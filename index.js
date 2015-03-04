#!/usr/bin/env node

// cli wrapper for domenic/svg2png
'use strict;'

var path = require('path');
var svg2png = require('svg2png');
var minimist = require('minimist');
var glob = require('glob');
var chalk = require('chalk');

// success, warning, and error messages
var success = function(message) {
  console.log(chalk.green(message));
}
var warn = function(warning) {
  console.warn(chalk.bold.yellow(warning));
}
var err = function(error) {
  console.error(chalk.bold.red(error));
}

// help text
var help = [
  "$ svg2png [options] -- [file/glob](s)",
  "",
  "Default output directory is the directory the SVGs live in",
  "",
  "flag        | parameter | description                  ",
  "------------|-----------|------------------------------",
  "-o, --out   | path      | Output directory             ",
  "-s, --scale | float     | Scales the PNG               ",
  "-h, --help  | N/A       | Outputs the help text        "
].join('\n');

// parse arguments
var minimistOpts = {
  alias: {
    'o': 'out',
    's': 'scale',
    'h': 'help'
  },
  default: {
    'scale': 1.0,
    'help': false
  },
  boolean: [
    'help'
  ]
};

var args = minimist(process.argv.slice(2), minimistOpts);

// show the help text and return if that's what the user's into
if (!args._.length || args.help) {
  console.log(help);
  return;
}

// process scale
var scale = Number(args.scale);

// convert a single svg
var convertSvg = function(svg) {
  // check the file extension for sanity
  var ext = path.extname(svg);
  if (ext != '.svg') {
    warn("Warning: " + svg + " doesn't end with '.svg'; it may not be an SVG");
  }
  // get the output directory from the options or from the svg's location
  var out = args.out || path.dirname(svg);
  out = path.join(out, path.basename(svg, ext) + '.png');
  // actually convert now
  svg2png(svg, out, scale, function(e) {
    if (e) {
      err(e);
    }
    else {
      success(chalk.bold(svg) + ' converted to ' + chalk.bold(out));
    }
  });
}

// svg file array from glob handler
var svgArrayHandler = function(svgArray) {
  svgArray.forEach(convertSvg);
}

// user input handler
var userInputHandler = function(filename) {
  glob(filename, function(er, files) {
    if (er) {
      err(er.message);
    }
    else if (!files.length) {
      err('Error: ' + filename + ' did not match any existing filenames')
    }
    svgArrayHandler(files);
  });
}

// let's get it started
// for every filename or glob input by the user, call the userInputHandler
args._.forEach(userInputHandler);
