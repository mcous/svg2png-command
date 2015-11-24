// test for the command line wrapper around svg2png
// mostly just checks that the image size matches what's expected
// this should be enough for our purposes
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var async = require('async');
var imageSize = require('image-size');
var expect = require('chai').expect;

var SVG = ['test-svg-0.svg', 'test-svg-1.svg', 'test-svg-2.svg'].map(function(svg) {
  return path.join(__dirname, 'test/svg', svg)
});

var PNG = SVG.map(function(svg) {
  return path.join(path.dirname(svg), path.basename(svg, '.svg') + '.png')
});

var svgSize = SVG.map(function(svg) {
  return imageSize(svg)
});

var command = function(args, done) {
  childProcess.exec(path.join(__dirname, 'index.js') + " " + args, done);
};

// clean a file and ignore errors
var cleanOne = function(file, done) {
  fs.unlink(file, function() {
    done();
  });
};

var clean = function(done) {
  async.each(PNG, cleanOne, done);
};

describe('svg2png command', function() {
  beforeEach(clean);
  after(clean);

  it('should convert a single file', function(done) {
    command('test/svg/test-svg-0.svg', function() {
      var pngSize = imageSize(PNG[0]);
      expect(svgSize[0].width).to.equal(pngSize.width);
      expect(svgSize[0].height).to.equal(pngSize.height);
      done();
    });
  });

  it('should convert several files', function(done) {
    command('test/svg/test-svg-0.svg test/svg/test-svg-1.svg', function() {
      var pSize0 = imageSize(PNG[0]);
      var pSize1 = imageSize(PNG[1]);
      expect(svgSize[0].width).to.equal(pSize0.width);
      expect(svgSize[0].height).to.equal(pSize0.height);
      expect(svgSize[1].width).to.equal(pSize1.width);
      expect(svgSize[1].height).to.equal(pSize1.height);
      done();
    });
  });

  it('should convert a blob of files', function(done) {
    command('test/**/*.svg', function() {
      var pSize0 = imageSize(PNG[0]);
      var pSize1 = imageSize(PNG[1]);
      var pSize2 = imageSize(PNG[2]);
      expect(svgSize[0].width).to.equal(pSize0.width);
      expect(svgSize[0].height).to.equal(pSize0.height);
      expect(svgSize[1].width).to.equal(pSize1.width);
      expect(svgSize[1].height).to.equal(pSize1.height);
      expect(svgSize[2].width).to.equal(pSize2.width);
      expect(svgSize[2].height).to.equal(pSize2.height);
      done();
    });
  });

  // it should respect the scale option
  it('should respect the scale flag', function(done) {
    var commands = 0;
    var finishCommand = function() {
      if (++commands > 1) {
        done();
      }
    }

    command('-s 0.5 -- test/svg/test-svg-0.svg', function() {
      var pSize = imageSize(PNG[0]);
      expect(svgSize[0].width / 2).to.equal(pSize.width);
      expect(svgSize[0].height / 2).to.equal(pSize.height);
      finishCommand();
    });
    command('--scale 2 -- test/svg/test-svg-1.svg', function() {
      var pSize = imageSize(PNG[1]);
      expect(2 * svgSize[1].width).to.equal(pSize.width);
      expect(2 * svgSize[1].height).to.equal(pSize.height);
      finishCommand();
    });
  });

  // it should respect the output option
  it('should respect the out flag', function(done) {
    var commands = 0;
    var finishCommand = function(file) {
      fs.unlink(file, function() {
        if (++commands > 1) {
          fs.rmdir(path.join(__dirname, 'test/temp'), function() {
            done();
          });
        }
      });
    };

    command('-o test/temp -- test/svg/test-svg-0.svg', function() {
      var png = path.join(__dirname, 'test/temp/test-svg-0.png')
      var pSize = imageSize(png);
      expect(svgSize[0].width).to.equal(pSize.width);
      expect(svgSize[0].height).to.equal(pSize.height);
      finishCommand(png);
    });
    command('--out test/temp -- test/svg/test-svg-1.svg', function() {
      var png = path.join(__dirname, 'test/temp/test-svg-1.png')
      var pSize = imageSize(png);
      expect(svgSize[1].width).to.equal(pSize.width);
      expect(svgSize[1].height).to.equal(pSize.height);
      finishCommand(png);
    });
  });

  it('should log a warning given potential non-svgs', function(done) {
    command('test/svg/test-svg.badext', function(err, stdout, stderr) {
      expect(err).to.be.null;
      expect(stderr).to.match(/Warning:.*may not be an SVG/);
      done();
    });
  });

  it('should log an error when files do not exist', function(done) {
    command('not-a-file.svg', function(err, stdout, stderr) {
      expect(err).to.be.null;
      expect(stderr).to.match(/Error:.*did not match/);
      done();
    });
  });

  it('should log on a successful conversion', function(done) {
    command('test/svg/test-svg-0.svg', function(err, stdout) {
      expect(err).to.be.null;
      expect(stdout).to.match(/converted to/);
      done();
    });
  });
});
