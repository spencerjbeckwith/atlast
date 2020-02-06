const fs = require(`fs`);
const jimp = require(`jimp`);

function atlastCompile() {
    //Put all our image frames into one png. Write a json
}

function atlastHelp() {
    //Display help
    console.log(`atlast by Spencer J. Beckwith. Version ${require("./package.json").version}`);
}

const args = process.argv.slice(2);
switch (args[0]) {
    case ("compile"): {
        atlastCompile();
        break;
    }
    case ("help"): {
        atlastHelp();
        break;
    }
    //More commands here
    default: {
        if (args[0] === undefined) {
            atlastHelp();
        } else {
            console.error(`Invalid atlast argument: ${args[0]}`);
        }
        break;
    }
}