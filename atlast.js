//THINGS TO CONSIDER:
//  make the program confirm to overwrite files, unless that has been specified as ok in config.json
//  how do we get all of our images? should it just do every image in a folder, maybe?

const fs = require(`fs`);
const Jimp = require(`jimp`);

const config = JSON.parse(fs.readFileSync(`config.json`));

const sprites = [];
let totalImages = 0;
let loadedImages = 0;
let totalPixels = 0;

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
        console.log(`Loading: ${this.spriteName} (${fileNameArray.length} images)`);
    }

    pushImage(image) { //bound to object {sprite, iteration} in constructor
        this.sprite.images[this.iteration] = image;
        this.sprite.width = Math.max(this.sprite.width,image.bitmap.width);
        this.sprite.height = Math.max(this.sprite.height,image.bitmap.height);

        totalPixels += this.sprite.width*this.sprite.height;
        loadedImages++;
        if (loadedImages >= totalImages) {
            arrangeAtlas();
        }
    }

    getSize() {
        return this.width*this.height;
    }
}

function compile() {
    console.log(`Loading sprite images from directory: ${config.directory}...`);
    console.group();

    //Find all our file paths
    const directory = fs.opendirSync(config.directory);
    let dirent = directory.readSync();

    while (dirent !== null) {
        if (dirent.isDirectory()) {
            //Open inner directory
            const innerDirectory = fs.opendirSync(`${config.directory}\\${dirent.name}`);
            let innerDirent = innerDirectory.readSync();
            let fnArray = [];

            while (innerDirent !== null) {
                if (innerDirent.isDirectory()) {
                    console.warn(`Too many nested directories! Folders nested inside this directory (${dirent.name}) will not be read.`);
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
                console.warn(`Directory (${dirent.name}) has no images!`);
            }

            innerDirectory.closeSync();
        } else if (dirent.isFile()) {
            if (dirent.name.endsWith(`.png`)) {
                let fnArray = [ `${config.directory}\\${dirent.name}` ];
                sprites.push(new Sprite(fnArray,dirent.name.replace(`.png`,``)));
            }
        }

        dirent = directory.readSync();
    }
    directory.closeSync();
    console.groupEnd();
}

function arrangeAtlas() { //Called by a sprite instance when all images are loaded by JIMP.
    console.log(`All sprite images loaded. Writing to the atlas...`);
    console.group();

    //Preliminary check to see if we have enough space
    const maxPixels = config.atlasWidth*config.atlasHeight;
    console.log(`Atlas size: ${config.atlasWidth}, ${config.atlasHeight}, totalling ${maxPixels} pixels.`);
    console.log(`Image expected to use ${totalPixels} pixels, which is ${(totalPixels/maxPixels)*100}% of the atlas.`);
    if (totalPixels > maxPixels) {
        throw `Atlas size is too small! Increase the size with "npm run atlast set atlasWidth/atlasHeight <value>"`;
    }

    //Sort the sprite array: largest to smallest
    sprites.sort((sprite1,sprite2) => {
        return (sprite2.getSize() - sprite1.getSize());
    });

    new Jimp(config.atlasWidth,config.atlasHeight,(error,image) => {
        //Find open places for each sprite and each of its images, doing larger sprites first
        const outputObject = [];
        for (let s = 0; s < sprites.length; s++) {
            const spriteOutput = {
                name: sprites[s].spriteName,
                width: sprites[s].width,
                height: sprites[s].height,
                images: []
            }
            for (let i = 0; i < sprites[s].images.length; i++) {
                let placeX = 0, placeY = 0, placeW = spriteOutput.width, placeH = spriteOutput.height;
                //check a spot
            
                //if spot is open

                //place image, record its location into imageoutput

                //move on to next iteration

                //if spot is not open

                //try another spot - repeat.

                //if no open spots: throw error.

                image.composite(sprites[s].images[i],placeX,placeY);
                let imageOutput = {
                    x: placeX, y: placeY
                };
                spriteOutput.images.push(imageOutput);
            }
            outputObject.push(spriteOutput);
        }

        //Save the outputs
        image.write(config.outputImageName);
        fs.writeFileSync(config.outputJSONName,JSON.stringify(outputObject,null,Number(config.outputWhitespace)));
    });
    console.groupEnd();
    console.log(`Atlas complete! Image output: ${config.outputImageName}, JSON output: ${config.outputJSONName}`);
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