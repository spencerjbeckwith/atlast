//THINGS TO CONSIDER:
//  make the program confirm to overwrite files, unless that has been specified as ok in config.json
//  how do we get all of our images? should it just do every image in a folder, maybe?

const fs = require(`fs`);
const Jimp = require(`jimp`);

const config = JSON.parse(fs.readFileSync(`config.json`));

const sprites = [];
let totalImages = 0;
let loadedImages = 0;

class Sprite {
    constructor(fileNameArray,spriteName) {
        this.spriteName = spriteName;
        this.width = 0;
        this.height = 0;

        this.images = [];
        for (let f = 0; f < fileNameArray.length; f++) {
            totalImages++;
            Jimp.read(fileNameArray[f])
                .then(this.pushImage.bind({
                    sprite: this,
                    iteration: f
                }))
                .catch(function(error) {
                    throw error;
                });
        }
    }

    pushImage(image) { //bound to object {sprite, iteration} in constructor
        this.sprite.images[this.iteration] = image;
        this.sprite.width = Math.max(this.sprite.width,image.bitmap.width);
        this.sprite.height = Math.max(this.sprite.height,image.bitmap.height);

        loadedImages++;
        if (loadedImages >= totalImages) {
            arrangeAtlas();
        }
    }
}

function compile() {
    console.log(`Compiling atlas from directory: ${config.directory}...`);
    console.group();

    new Jimp(config.atlasWidth,config.atlasHeight,(error,image) => {
        //Find all our file paths
        const directory = fs.opendirSync(config.directory);
        let dirent = directory.readSync();

        while (dirent !== null) {
            if (dirent.isDirectory()) {
                //Open inner directory
                console.log(`Opening directory: ${dirent.name}`);
                console.group();

                const innerDirectory = fs.opendirSync(`${config.directory}\\${dirent.name}`);
                let innerDirent = innerDirectory.readSync();
                let fnArray = [];

                while (innerDirent !== null) {
                    if (innerDirent.isDirectory()) {
                        console.warn(`Too many nested directories! Folders inside this folder will not be read.`);
                    } else if (innerDirent.isFile()) {
                        if (innerDirent.name.endsWith(`.png`)) {
                            fnArray.push(`${config.directory}\\${dirent.name}\\${innerDirent.name}`);
                        }
                    }
                    innerDirent = innerDirectory.readSync();
                }

                if (fnArray.length > 0) {
                    sprites.push(new Sprite(fnArray,dirent.name));
                } else {
                    console.warn(`This directory was empty!`);
                }

                console.groupEnd();
                innerDirectory.closeSync();
            } else if (dirent.isFile()) {
                if (dirent.name.endsWith(`.png`)) {
                    //Open one-image sprite
                    console.log(`Opening file: ${dirent.name}`);

                    let fnArray = [ `${config.directory}\\${dirent.name}` ];
                    sprites.push(new Sprite(fnArray,dirent.name.replace(`.png`,``)));
                }
            }

            dirent = directory.readSync();
        }
        directory.closeSync();

        /*
        ALGORITHM IDEAS:
        Optimal placement.
            Put down the images in order of largest to smallest. This gets the big ones out of the way.
                How to make this work, though?
                    I have to cycle according to the size of the images, which can be real tricky. Or, maybe not?
                Then the little ones take up just the remaining space. Maybe, each image is just placed wherever it can be, not in relation to its other images?
                    Then I need a way to find space that hasn't been taken already, and an algorithm to plop images in there.

        -Sort the pathObject according to the size of each entry.
        -cycle through:
            -find a spot that isn't taken
            -place the jimp, record its location for the output object
        */

        /*console.log(`Writing to the atlas...`);
        console.group();
        let placeName = ``, placeX = 0, placeY = 0, placeW = 0, placeH = 0;
        pathObject.forEach((element) => {
            if (typeof element.location === `string`) {
                //One-image sprite
                //Place inside the jimp

                //One image sprite
                placeName = element.name;
                console.log(`Placing element ${placeName}...`);
                outputObject.push({
                    name: placeName,
                    x: placeX,
                    y: placeY,
                    w: placeW,
                    h: placeH
                });

            } else if (typeof element === `object`) {
                //Array - sprite with multiple images
                let spriteObject = [];
                element.forEach((element) => {
                    //Place inside the Jimp

                    //One image inside a sprite
                    placeName = element.name;
                    console.log(`Placing a nested element of ${placeName} at (${placeX},${placeY})...`)
                    spriteObject.push({
                        name: placeName,
                        x: placeX,
                        y: placeY,
                        w: placeW,
                        h: placeH
                    });
                });
                outputObject.push(spriteObject);
            }
        });
        console.groupEnd();*/

        //Save the outputs
        /*image.write(config.outputImageName);
        fs.writeFileSync(config.outputJSONName,JSON.stringify(outputObject));

        console.groupEnd();
        console.log(`Atlas complete! Image output: ${config.outputImageName}, JSON output: ${config.outputJSONName}`);*/
    });
}

function arrangeAtlas() { //Called by a sprite instance when all image are loaded by JIMP.
    console.log(sprites);
}

function set(key,value) {
    //Update a value in our config, rewrite the config file
    if (key === undefined || value === undefined) {
        throw `Cannot update config: both a key and value must be specified.`;
    }
    config[key] = value;
    fs.writeFileSync(`config.json`,JSON.stringify(config));
    console.log(`config.json has been updated.`);
}

function help() {
    //Display help
    console.log(`atlast by Spencer J. Beckwith. Version ${require(`./package.json`).version}.`);
}

const args = process.argv.slice(2);
switch (args[0]) {
    case (`compile`): {
        compile();
        break;
    }
    case (`set`): {
        set(args[1],args[2]);
        break;
    }
    case (`help`): {
        help();
        break;
    }
    //More commands here
    default: {
        if (args[0] === undefined) {
            help();
        } else {
            console.error(`Invalid atlast argument: ${args[0]}`);
        }
        break;
    }
}

module.exports = {
    compile: compile,
    set: set,
    help: help
}