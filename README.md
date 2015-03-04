# svg2png command line wrapper
 [![Travis](https://img.shields.io/travis/mcous/svg2png-command.svg?style=flat-square)](https://travis-ci.org/mcous/svg2png-command)
 [![David](https://img.shields.io/david/mcous/svg2png-command.svg?style=flat-square)](https://david-dm.org/mcous/svg2png-command)
 [![npm](https://img.shields.io/npm/v/svg2png-command.svg?style=flat-square)](https://www.npmjs.com/package/svg2png-command)

This module is a (very thin) command line wrapper around domenic's [svg2png](https://github.com/domenic/svg2png).

## install

`$ npm install -g svg2png-command`

## use

`$ svg2png [options] -- [file/glob](s)`

Default output directory is the directory the SVGs live in and the default output filename is the same filename with `.svg` replaced with `.png`

### options

flag        | parameter | description
------------|-----------|-------------
-o, --out   | path      | Output directory
-s, --scale | float     | Scales the PNG
-h, --help  | N/A       | Outputs the help text

### note

A command line tool called `svg2png` already exists in the world, and you may have it installed if you've found yourself frequently trying to convert SVGs to PNGs. You may need to uninstall it to get everything to work. I wouldn't worry too much though; domenic's PhantomJS-based converter tends to be better than any other tool.

## test

`$ npm test`

Tests are written using [Tape](https://github.com/substack/tape).
