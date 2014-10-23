// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Set up a simple 'reset stylesheet' test frame for all tests to use.
// Because there's no "describe" block in this file, the 'before' and 'after' run before and after
// the entire test suite, and the 'beforeEach' runs before every test.
//
// This reduces the number of times frames are created and destroyed, which speeds up the tests.

var quixote = require("./quixote.js");

var frame;

before(function(done) {
	frame = quixote.createFrame({ width: 500, height: 500, stylesheet: "/base/src/__reset.css" }, done);
	exports.frame = frame;
});

after(function() {
	frame.remove();
});

beforeEach(function() {
	frame.reset();
});