//THINGS TO CONSIDER:
//  make the program confirm to overwrite files, unless that has been specified as ok in config.json
//  how do we get all of our images? should it just do every image in a folder, maybe?

const fs = require(`fs`);
const Jimp = require(`jimp`);

const config = JSON.parse(fs.readFileSync(`config.json`));
const outputObject = [];

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
                            innerPathObject.push(`${config.directory}\\${dirent.name}\\${innerDirent.name}`);
                        }
                    }
                    innerDirent = innerDirectory.readSync();
                }

                pathObject.push(innerPathObject);
                innerDirectory.closeSync();
                console.groupEnd();
            } else if (dirent.isFile()) {
                if (dirent.name.endsWith(`.png`)) {
                    console.log(`Adding singular PNG file: ${dirent.name}`);
                    pathObject.push(`${config.directory}\\${dirent.name}`);
                }
            }

            dirent = directory.readSync();
        }
        directory.closeSync();
        
        console.log(pathObject);


        //

        //Save the outputs
        image.write(config.outputImageName);
        fs.writeFileSync(config.outputJSONName,JSON.stringify(outputObject));

        console.groupEnd();
        console.log(`Atlas complete! Image output: ${config.outputImageName}, JSON output: ${config.outputJSONName}`);
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