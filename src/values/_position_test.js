// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Position = require("./position.js");
var Pixels = require("./pixels.js");
var Size = require("./size.js");

describe("Position", function() {

	var x1 = Position.x(10);
	var x2 = Position.x(20);
	var x1b = Position.x(10);

	var y1 = Position.y(50);
	var y2 = Position.y(80);

	it("can be constructed from pixels", function() {
		assert.objEqual(Position.x(new Pixels(10)), x1);
	});

	it("responds to value()", function() {
		assert.equal(x1.value(), x1);    // note identity comparison, not objEqual()
	});

	it("adds itself", function() {
		assert.objEqual(x1.plus(x2), Position.x(30), "x");
		assert.objEqual(y1.plus(y2), Position.y(130), "y");
	});

	it("adds size", function() {
		assert.objEqual(x1.plus(new Size(42)), Position.x(52), "x");
	});

	it("fails fast when adding incompatible dimensions", function() {
		assert.exception(function() {
			x1.plus(y1);
		}, /Can't compare X dimension to Y dimension/);
	});

	it("determines difference", function() {
		assert.equal(x1.diff(x1b), "", "same");

		assert.equal(x1.diff(x2), "10px to the left", "left");
		assert.equal(x2.diff(x1), "10px to the right", "right");

		assert.equal(y1.diff(y2), "30px lower", "lower");
		assert.equal(y2.diff(y1), "30px higher", "higher");
	});

	it("fails fast when computing difference between incompatible dimensions", function() {
		assert.exception(function() {
			x1.diff(y1);
		}, /Can't compare X dimension to Y dimension/);
	});

	it("describes how it is compared", function() {
		assert.equal(x1.describeMatch(), "be 10px");
	});

	it("is comparable to itself", function() {
		assert.objEqual(x1, x1b, "same");
		assert.objNotEqual(x1, x2, "different");
	});

	it("is not comparable to opposite dimension", function() {
		assert.exception(function() {
			x1.equals(y1);
		}, /Can't compare X dimension to Y dimension/);
	});

	it("converts to pixels", function() {
		assert.objEqual(x1.toPixels(), new Pixels(10));
	});

	it("toString()", function() {
		assert.equal(x1.toString(), "10px");
	});

});