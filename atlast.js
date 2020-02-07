//THINGS TO CONSIDER:
//  make the program confirm to overwrite files, unless that has been specified as ok in config.json
//  how do we get all of our images? should it just do every image in a folder, maybe?

const fs = require(`fs`);
const Jimp = require(`jimp`);

const config = JSON.parse(fs.readFileSync(`config.json`));
const outputObject = [];

function readJimp(directory) {
    //this is our closing function?
    Jimp.read(directory)
        .then((image => {

        }))
        .catch((error) => {
            throw 
        })
}

function compile() {
    console.log(`Compiling atlas from directory: ${config.directory}...`);
    console.group();

    new Jimp(config.atlasWidth,config.atlasHeight,(error,image) => {
        //Find all our file paths
        const directory = fs.opendirSync(config.directory);
        let pathObject = [];

        let dirent = directory.readSync();
        while (dirent !== null) {
            if (dirent.isDirectory()) {
                console.log(`Opening directory: ${dirent.name}`);
                console.group();
                let innerPathObject = [];

                //Open inner directory
                const innerDirectory = fs.opendirSync(`${config.directory}\\${dirent.name}`);
                let innerDirent = innerDirectory.readSync();
                while (innerDirent !== null) {
                    if (innerDirent.isDirectory()) {
                        throw `Too many nested directories! Path: ${config.directory}\\${dirent.name}.`;
                    } else if (innerDirent.isFile()) {
                        //Add file to sprite entry
                        if (innerDirent.name.endsWith(`.png`)) {
                            console.log(`Adding PNG file to directory: ${innerDirent.name}`);
                            /*innerPathObject.push({
                                location: `${config.directory}\\${dirent.name}\\${innerDirent.name}`,
                                name: dirent.name
                            });*/
                        }
                    }
                    innerDirent = innerDirectory.readSync();
                }

                pathObject.push(innerPathObject);
                innerDirectory.closeSync();
                console.groupEnd();
            } else if (dirent.isFile()) {
                if (dirent.name.endsWith(`.png`)) {

                        //USE A CLOSURE HERE. but how? oof

                    Jimp.read(`${config.directory}\\${dirent.name}`)
                        .then((image) => {

                            console.log(`Loaded singular PNG file: ${dirent.name}`);
                            pathObject.push({
                                name: dirent.name.replace(`.png`,``),
                                image: image
                            });
                        }).catch((error) => {
                            throw `Error loading image: ${error}`;
                        });
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