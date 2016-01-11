// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Pixels = require("./pixels.js");
var NoPixels = require("./no_pixels.js");
var CssLength = require("./css_length.js");
var Value = require("./value.js");

describe("NoPixels", function() {
	var goodPixels = Pixels.create(10);
	var noPixels = NoPixels.create();

	it("is a value and a css length object", function() {
		assert.implements(noPixels, Value);
		assert.implements(noPixels, CssLength);
	});

	it("fails with expected type errors if you try to mix Pixel and NoPixel instances in operations", function() {
		assert.exception(function() { goodPixels.plus(noPixels); }, /Pixels isn.t compatible with NoPixels/);
		assert.exception(function() { noPixels.plus(goodPixels); }, /NoPixels isn.t compatible with Pixels/);
		assert.exception(function() { goodPixels.minus(noPixels); }, /Pixels isn.t compatible with NoPixels/);
		assert.exception(function() { noPixels.minus(goodPixels); }, /NoPixels isn.t compatible with Pixels/);
		assert.exception(function() { goodPixels.average(noPixels); }, /Pixels isn.t compatible with NoPixels/);
		assert.exception(function() { noPixels.average(goodPixels); }, /NoPixels isn.t compatible with Pixels/);
	});
});
