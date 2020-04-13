// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Set up a simple 'reset stylesheet' test frame for all tests to use.
// Because there's no "describe" block in this file, the 'before' and 'after' run before and after
// the entire test suite, and the 'beforeEach' runs before every test.
//
// This reduces the number of times frames are created and destroyed, which speeds up the tests.

var quixote = require("./quixote.js");

exports.WIDTH = 500;
exports.HEIGHT = 400;

mocha.timeout(20000);

before(function(done) {
	var options = {
		width: exports.WIDTH,
		height: exports.HEIGHT,
		stylesheet: "/base/src/__reset.css"
	};

	exports.frame = quixote.createFrame(options, done);
});

beforeEach(function() {
	exports.frame.reset();
});