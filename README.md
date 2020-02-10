# atlast

Atlast is a texture atlas generator for sprite sheets, specifically aimed at low-resolution pixel-art games. This simple program only needs to be configured once per project, and will remember your outputs and configuration - this means to recompile your atlas, you only need one command!

The purpose of atlast is to be simple, easy, and easy to integrate into your larger development environment. Unfortunately, atlast is **not** for image-processing - it is for creating a texture atlas. To create images that work well with atlast, I recommend [Piskel](https://www.piskelapp.com/), but there are plenty of other free pixel-art programs out there.

Atlast was created specifically with WebGL in mind, but these sprite sheets can definitely be used by a 2D canvas element, or even another program/framework entirely as long as it is able to read atlast's output JSON file.

## How It Works

Atlast works by scanning all the files and subfolders in a directory, and composites the sprites all into one texture atlas using [jimp](https://www.npmjs.com/package/jimp). It also exports a JSON file on atlas compiling, while holds an array of objects. This JSON should then be loaded in by your implementation. Each object in the array can correspond with a sprite, holding information like its name, width, height, and an array of image coordinates that directly correspond with the atlas.

The more images that go on an atlas, the longer it takes to compile. You should configure your atlas size properly so that you don't have much wasted space. During development, you should create your atlases with a good amount of space between each image - about 8 pixels can compile an atlas very fast. For a more compact atlas, use a lower value (like, I dunno, 0) for your final production.

## Usage

Install atlast to your machine globally by using the follow command: ```npm install -g atlast```

Use atlast with the following command: ```atlast compile```

If you'd like to change the configuration after it's been set, use ```atlast config```

When compiling your atlas, it is important that your root image directory follows the proper structure:
* Individual files in the root will be loaded as sprites that have only one image. The name of the sprite will be the file's name.
* Folders in the root will be scanned for images, which will be loaded as one sprite with multiple images. The name of the sprite will be the folder's name.
  * All the image files of one sprite need to be the same dimensions.
  * The filenames don't have an effect on how they're exported or arranged on the atlast, but they DO have an effect on the order they are loaded. As such, the filenames of each image should be ordered properly. Example: image00.png, image01.png, image02.png, etc...
* Any deeper subfolders, or files that are not .png format, will be ignored.

## Implementation

The way you implement an atlast atlas depends entirely on the structure of your game. Obviously you will need to load in your exported image:

```javascript
//show an example of loading the image
```

After that, you'll need to load in your JSON object somehow. You'll want to cycle through it to create sprite instances in your game.

```javascript
//show an example of parsing the output json
```

And here is an example of how these sprites may be implemented using WebGL. Of course, WebGL requires a **lot** of heavy lifting to actually set up, and that is outside the scope of this document. If you aren't familiar with WebGL, I suggest you get started at [WebGL Fundamentals](https://webglfundamentals.org/)!

```javascript
//webgl stuff will go here
```

## Configuration

Here is a more in-depth explanation of what each configurable value actually does:

* **Root Directory**: The root folder which should be scanned for all images. All images inside this folder are compiled into your atlas.
* **Atlas Width**: The width of the final image. Powers of 2 work best for WebGL.
* **Atlas Height**: The height of the final image. Powers of 2 work best for WebGL.
* **Image Separation**: Number of pixels to separate each image by. This is the amount that atlast will iterate across the atlas by, for each image - and so low numbers require a LOT of scanning.
* **Output Image Name**: The name of the final image to output. *This should NOT be inside the root directory!* This should ideally go directly into your development environment.
* **Output JSON Name**: The name of the final JSON file to output. Like the image name, this should ideally go directly into your development environment.
