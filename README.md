# Toyunda2ASS

This is a converter for Epitanime Toyunda karaoke format to ASS, written in nodeJS.

## History

Epitanime is a french school club running an anime convention at the Epita computer school.  Their karaoke software suite, Toyunda, uses a proprietary file format, but this tool can convert it to standardized ASS karaoke format.

Toyunda was made during a time when soft-subbing (rendering ASS subtitles on the fly) was not possible with video players (in the late 90s-early 2000s).

The format should be deprecated given it relies on an old, unmaintained version of mplayer, but people (including Epitanime) still continue to use it despite there being better alternatives.

`¯\_(ツ)_/¯`

Toyunda2ASS was a fun side-project which took me about a day.

## Installation

Run `npm install -g toyunda2ass` to install as a global module (and get the CLI version)

Run `npm install toyunda2ass` to install as a module for your project.

## Usage

### Module

As a module here are the three methods you can call :

#### splitTime(time: string)

Splits a TimingV3 generated file into frm+lyr information. It will only work if the frm+lyr are embedded into the time (.txt) file.

Returns an object with `lyrics` and `frames` properties containing an array of strings (1 per line)

Note that this script won't work with V1/V2 Toyunda files

#### findFPS(videofile: string)

Returns the FPS (frames per second) of `videofile`. FPS is needed to calculate precisely the karaoke timing. You need [ffmpeg](http://ffmpeg.org) in your PATH for this to work.

#### convertToASS({lyrics: string[], frames: string[]}, fps: number)

Returns a correctly formatted ASS file as a string. You need to provide the frm+lyr data as the first parameter and FPS as the second one.

### CLI

The CLI version is used as follows :

```sh
toyunda2ass myfile.frm myfile.lyr 23.98
```

It produces an ASS file on stdout.

You can also provide a txt file instead of frm+lyr. In this case splitTime() is called. Of course the FPS number becomes the second parameter.

FPS is optional. If not provided it'll strip the `.frm` on the first file and try to find a matching `.avi` file. 

You need to have `ffmpeg` installed in your PATH so Toyunda2ASS can read fps info from a video file

## Build

If you wish to build from source, use `npm run-script build` to get standard JS in the `dist` folder.

## Test

You can test code with the `frm` and `lyr` files included in the test directory :

```sh
node dist/index.js test/HaruhiOP.frm test/HaruhiOP.lyr 23.98
```

## License

MIT
