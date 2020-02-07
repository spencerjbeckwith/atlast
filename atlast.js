const fs = require(`fs`);
const Jimp = require(`jimp`);

const config = JSON.parse(fs.readFileSync(`config.json`));
let outputObject = {};

function compile() {
    new Jimp(config.atlasWidth,config.atlasHeight,(error,image) => {
        //Plop all the images in

        //Save the final Jump to a file
        image.write(config.outputImageName);
    });
    fs.writeFileSync(config.outputJSONName,JSON.stringify(outputObject));
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