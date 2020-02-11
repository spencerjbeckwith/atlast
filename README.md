# atlast

Atlast is a texture atlas generator for sprite sheets, specifically aimed at low-resolution pixel-art games. This simple program only needs to be configured once per project, and will remember your outputs and configuration - this means to recompile your atlas, you only need one command! It will take a ton of images and composite them all into one atlas, alongside a JSON file that holds the coordinates of each image so it can be loaded very easily.

The purpose of atlast is to be simple, easy, and trivial to integrate into your larger development environment. Unfortunately, atlast is **not** for image-processing - it is for creating a texture atlas. To create images that work well with atlast, I recommend [Piskel](https://www.piskelapp.com/), but there are plenty of other free pixel-art programs out there. Atlast was created specifically with WebGL in mind, but these sprite sheets can definitely be used by a 2D canvas element, or even another program/framework entirely as long as it is able to read atlast's output JSON file.

## Usage

Install atlast to your machine globally by using the follow command: ```npm install -g atlast```.

Use atlast with the following command: ```atlast```. If your configuration hasn't been set, it will ask for any unset values. Otherwise it will remember your last used configuration.

If you'd like to change the configuration after it's been set, use ```atlast config```.

You can change individual configuration values with ```atlast set <key> <value>```. A list of keys can be found below.

When compiling your atlas, it is important that your root image directory follows the proper structure:
* Individual files in the root will be loaded as sprites that have only one image. The name of the sprite will be the file's name.
* Folders in the root will be scanned for images, which will be loaded as one sprite with multiple images. The name of the sprite will be the folder's name.
  * All the image files of one sprite need to be the same dimensions.
  * The filenames don't have an effect on how they're exported or arranged on the atlast, but they DO have an effect on the order they are loaded. As such, the filenames of each image should be ordered properly. Example: image00.png, image01.png, image02.png, etc...
* Any deeper subfolders, or files that are not .png format, will be ignored.

## How It Works

Atlast works by scanning all the files and subfolders in a directory, and composites the sprites all into one texture atlas using [jimp](https://www.npmjs.com/package/jimp). It also exports a JSON file on atlas compiling, while holds an array of objects. This JSON should then be loaded in by your implementation. Each object in the array can correspond with a sprite, holding information like its name, width, height, and an array of image coordinates that directly correspond with the atlas.

The more images that go on an atlas, the longer it takes to compile. You should configure your atlas size properly so that you don't have much wasted space. During development, you should create your atlases with a good amount of space between each image - about 8 pixels can compile an atlas very fast. For a more compact atlas, use a lower value (like, I dunno, 0) for your final production.

## Implementation

The way you implement an atlast atlas depends entirely on the structure of your program, and it is up to you. Regardless of your decision, you need to store sprites based on the output file, and have some function to draw specific parts of a loaded texture.

```javascript
const texture = loadTexture(`output.png`); // Specific to your implementation - 2D vs. WebGL

function drawSprite(index,x,y,image) {
    image = Math.max(0,Math.min(Math.floor(image),ATLAST[index].images.length));

    /*  Like above, you have to create the following method: drawTexture(...)
        It should be able to draw just a portion of the texture atlas.
        Its where you'd apply a transformation matrix and set your shader's texCoords, based on these arguments.
        
        Or, if you're using a 2D Canvas context, this could be a trivial ctx.drawImage(...) call.*/

    drawTexture(texture, x, y,
        ATLAST[index].images[image].x, ATLAST[index].images[image].y,
        ATLAST[index].width, ATLAST[index].height);
}

//  ...

let spriteIndex = 8; // You'll need your own system to index your loaded sprites.
let frame = 0;
function main() {

    // ...

    // Draw a sprite
    drawSprite(spriteIndex,16,16,frame);
    frame++;

    // Loop the sprite
    if (frame >= ATLAST[spriteIndex].images.length) {
        frame = 0;
    }

    // ...

    requestAnimationFrame(main);
}
```

## Configuration

Here is a more in-depth explanation of what each configurable value actually does:

* **Root Directory** ```directory```: The root folder which should be scanned for all images. All images inside this folder are compiled into your atlas.
* **Atlas Width** ```atlasWidth```: The width of the final image. Powers of 2 work best for WebGL.
* **Atlas Height** ```atlasHeight```: The height of the final image. Powers of 2 work best for WebGL.
* **Image Separation** ```separation```: Number of pixels to separate each image by. This is the amount that atlast will iterate across the atlas by, for each image - and so low numbers require a LOT of scanning.
* **Output Image Name** ```outputImageName```: The name of the final image to output. *This should NOT be inside the root directory!* This should ideally go directly into your development environment.
* **Output JSON Name** ```outputJSONName```: The name of the final JSON file to output. Like the image name, this should ideally go directly into your development environment.
* **Output as JavaScript** ```outputAsJS```: If true, the output JSON file will instead be a .js file. The object is loaded as a const ATLAST, so you don't need to use an HTTP request for your JSON object when testing locally - You instead only need to include it now in your HTML file.

## At last, the end!

I hope this all makes sense. Don't hesitate to reach out to me with any questions! I fully intend to use atlast during my JavaScript game development myself.
