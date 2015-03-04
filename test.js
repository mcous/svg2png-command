// test for the command line wrapper around svg2png
exec = require('child_process').exec;
path = require('path');
test = require('tape');
imageSize = require('image-size');
del = require('del');

var svgSize = [
  imageSize(path.join(__dirname, 'tests/svgs/test-svg-0.svg')),
  imageSize(path.join(__dirname, 'tests/svgs/test-svg-1.svg')),
  imageSize(path.join(__dirname, 'tests/svgs/test-svg-2.svg'))
]

var command = function(args, cb) {
  exec(path.join(__dirname, 'index.js') + " " + args, cb);
}

var clean = function(cb) {
  del(['./tests/svgs/*.png', './tests/temp'], function(e) {
    if (e) {
      throw e
    }
    cb();
  });
}

// all the tests to run
var tests = function() {
  // it should be able to convert a file
  test('it should convert a single file', function(expect) {
    expect.plan(2);
    command('tests/svgs/test-svg-0.svg', function() {
      // check that image sizes match to verify, which should be enough for us
      var pSize = imageSize(path.join(__dirname, 'tests/svgs/test-svg-0.png'));
      // clean the output and check our assertions
      clean(function() {
        expect.equal(svgSize[0].width, pSize.width);
        expect.equal(svgSize[0].height, pSize.height);
      });
    });
  });

  // it should work with several files being passed in
  test('it should convert several files', function(expect) {
    expect.plan(4);
    command('tests/svgs/test-svg-0.svg tests/svgs/test-svg-1.svg', function() {
      // check that image sizes match to verify, which should be enough for us
      var pSize0 = imageSize(path.join(__dirname, 'tests/svgs/test-svg-0.png'));
      var pSize1 = imageSize(path.join(__dirname, 'tests/svgs/test-svg-1.png'));
      // clean the output and check our assertions
      clean(function() {
        expect.equal(svgSize[0].width, pSize0.width);
        expect.equal(svgSize[0].height, pSize0.height);
        expect.equal(svgSize[1].width, pSize1.width);
        expect.equal(svgSize[1].height, pSize1.height);
      });
    });
  });

  // it should work with a blob passed in
  test('it should convert a blob of files', function(expect) {
    expect.plan(6);
    command('tests/**/*.svg', function() {
      // check that image sizes match to verify, which should be enough for us
      var pSize0 = imageSize(path.join(__dirname, 'tests/svgs/test-svg-0.png'));
      var pSize1 = imageSize(path.join(__dirname, 'tests/svgs/test-svg-1.png'));
      var pSize2 = imageSize(path.join(__dirname, 'tests/svgs/test-svg-2.png'));
      // clean the output and check our assertions
      clean(function() {
        expect.equal(svgSize[0].width, pSize0.width);
        expect.equal(svgSize[0].height, pSize0.height);
        expect.equal(svgSize[1].width, pSize1.width);
        expect.equal(svgSize[1].height, pSize1.height);
        expect.equal(svgSize[2].width, pSize2.width);
        expect.equal(svgSize[2].height, pSize2.height);
      });
    });
  });

  // it should respect the scale option
  test('it should respect the scale flag', function(expect) {
    var commands = 0;
    var finishCommand = function() {
      if (++commands > 1) {
        clean(expect.end)
      }
    }
    command('-s 0.5 -- tests/svgs/test-svg-0.svg', function() {
      var pSize = imageSize(path.join(__dirname, 'tests/svgs/test-svg-0.png'));
      expect.equal(svgSize[0].width / 2, pSize.width);
      expect.equal(svgSize[0].height / 2, pSize.height);
      finishCommand();
    });
    command('--scale 2 -- tests/svgs/test-svg-1.svg', function() {
      var pSize = imageSize(path.join(__dirname, 'tests/svgs/test-svg-1.png'));
      expect.equal(2 * svgSize[1].width, pSize.width);
      expect.equal(2 * svgSize[1].height, pSize.height);
      finishCommand();
    });
  });

  // it should respect the output option
  test('it should respect the out flag', function(expect) {
    var commands = 0;
    var finishCommand = function() {
      if (++commands > 1) {
        clean(expect.end)
      }
    }
    command('-o tests/temp -- tests/svgs/test-svg-0.svg', function() {
      var pSize = imageSize(path.join(__dirname, 'tests/temp/test-svg-0.png'));
      expect.equal(svgSize[0].width, pSize.width);
      expect.equal(svgSize[0].height, pSize.height);
      finishCommand();
    });
    command('--out tests/temp -- tests/svgs/test-svg-1.svg', function() {
      var pSize = imageSize(path.join(__dirname, 'tests/temp/test-svg-1.png'));
      expect.equal(svgSize[1].width, pSize.width);
      expect.equal(svgSize[1].height, pSize.height);
      finishCommand();
    });
  });

  // it should warn for files that don't end in .svg
  test('it should log a warning given potential non-svgs', function(expect) {
    expect.plan(1);
    command('tests/svgs/test-svg.badext', function(err, stdout, stderr) {
      expect.ok(/Warning:.*may not be an SVG/.test(stderr));
    });
  });

  // it should error for files that don't exist
  test("it should log an error when files don't exist", function(expect) {
    expect.plan(1);
    command('not-a-file.svg', function(err, stdout, stderr) {
      expect.ok(/Error:.*did not match/.test(stderr));
    });
  });

  // it should log a success message when a file convers
  test('it should log on a successful conversion', function(expect) {
    expect.plan(1);
    command('tests/svgs/test-svg-0.svg', function(err, stdout, stderr) {
      clean(function() {
        expect.ok(/converted to/.test(stdout));
      });
    });
  });
}

// clean the test dirs and run the tests
clean(tests);
