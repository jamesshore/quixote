// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Pixels = require("./pixels.js");
var Value = require("./value.js");
var ensure = require("../util/ensure.js");

describe("VALUE: Pixels", function() {

	var a1 = Pixels.create(10);
	var a2 = Pixels.create(10);
	var b = Pixels.create(20);
	var noPixels = Pixels.createNone();
	var noPixels2 = Pixels.createNone();

	it("is a value object", function() {
		assert.implements(a1, Value);
	});

	it("knows if it is 'none' or not", function() {
		assert.equal(noPixels.isNone(), true, "none");
		assert.equal(a1.isNone(), false, "not none");
	});

	it("performs arithmetic", function() {
		assert.objEqual(a1.plus(b), Pixels.create(30), "addition");
		assert.objEqual(b.minus(a1), Pixels.create(10), "subtraction");
		assert.objEqual(b.difference(a1), Pixels.create(10), "subtraction with absolute value");
		assert.objEqual(a1.difference(b), Pixels.create(10), "difference shouldn't care about ordering");
		assert.objEqual(a1.times(3), Pixels.create(30), "multiplication");
		assert.objEqual(a1.average(b), Pixels.create(15), "average");
		assert.objEqual(b.average(a1), Pixels.create(15), "average should not care about ordering");
	});

	it("performs comparisons", function() {
		assert.equal(a1.compare(b) < 0, true, "less than");
		assert.equal(b.compare(a1) > 0, true, "greater than");
		assert.equal(a1.compare(a2) === 0, true, "equal");
	});

	it("minimizes and maximizes", function() {
		assert.objEqual(Pixels.min(a1, b), a1, "minimum");
		assert.objEqual(Pixels.max(a1, b), b, "maximum");
	});

	it("rounds off differences of 0.5px or less", function() {
		var almostA = Pixels.create(10.5);
		var almostAminus = Pixels.create(9.5);

		assert.objEqual(a1, almostA, "equal (+0.5)");
		assert.objEqual(a1, almostAminus, "equal (-0.5)");
		assert.equal(a1.compare(almostA) === 0, true, "compare (+0.5)");
		assert.equal(a1.compare(almostAminus) === 0, true, "compare (-0.5)");
		assert.equal(a1.diff(almostA), "", "diff (+0.5)");
		assert.equal(a1.diff(almostAminus), "", "diff (-0.5)");
	});

	it("describes difference (always a positive result)", function() {
		assert.equal(a1.diff(b), "10px", "greater than");
		assert.equal(b.diff(a1), "10px", "less than");
		assert.equal(a1.diff(a2), "", "same");
	});

	it("describes long differences compactly", function() {
		check(12.3, "12.3px", "one decimal place");
		check(12.34, "12.34px", "two decimal places");
		check(12.344, "about 12.34px", "three decimal places (round down)");
		check(12.345, "about 12.35px", "three decimal places (round up)");
		check(28.123481812, "about 28.12px", "many decimal places");

		function check(actual, expected, message) {
			assert.equal(Pixels.create(0).diff(Pixels.create(actual)), expected, message);
		}
	});

	it("converts to string", function() {
		assert.equal(a1.toString(), "10px", "normal");
		assert.equal(Pixels.create(12.3456789).toString(), "12.3456789px", "should not round off");
	});

	describe("'no pixels' variant", function() {

		it("arithmetic always results in no pixels", function() {
			var pixels = Pixels.create(42);

			assert.objEqual(noPixels.plus(noPixels2), Pixels.createNone(), "adding noPixels");
			assert.objEqual(noPixels.minus(noPixels2), Pixels.createNone(), "subtracting noPixels");
			assert.objEqual(noPixels.difference(noPixels2), Pixels.createNone(), "differencing noPixels");
			assert.objEqual(noPixels.times(2), Pixels.createNone(), "multiplying noPixels");
			assert.objEqual(noPixels.average(noPixels2), Pixels.createNone(), "averaging noPixels");
			assert.objEqual(Pixels.min(noPixels, noPixels2), Pixels.createNone(), "minimizing noPixels");
			assert.objEqual(Pixels.max(noPixels, noPixels2), Pixels.createNone(), "maximizing noPixels");

			assert.objEqual(noPixels.plus(pixels), Pixels.createNone(), "adding noPixels and pixels");
			assert.objEqual(pixels.plus(noPixels), Pixels.createNone(), "adding pixels and noPixels");
			assert.objEqual(noPixels.minus(pixels), Pixels.createNone(), "subtracting noPixels and pixels");
			assert.objEqual(pixels.minus(noPixels), Pixels.createNone(), "subtracting pixels and noPixels");
			assert.objEqual(noPixels.difference(pixels), Pixels.createNone(), "differencing noPixels and pixels");
			assert.objEqual(pixels.difference(noPixels), Pixels.createNone(), "differencing pixels and noPixels");
			assert.objEqual(noPixels.average(pixels), Pixels.createNone(), "averaging noPixels and pixels");
			assert.objEqual(pixels.average(noPixels), Pixels.createNone(), "averaging pixels and noPixels");
			assert.objEqual(Pixels.min(noPixels, pixels), Pixels.createNone(), "minimizing noPixels and pixels");
			assert.objEqual(Pixels.min(pixels, noPixels), Pixels.createNone(), "minimizing pixels and noPixels");
			assert.objEqual(Pixels.max(noPixels, pixels), Pixels.createNone(), "maximizing noPixels and pixels");
			assert.objEqual(Pixels.max(pixels, noPixels), Pixels.createNone(), "maximizing pixels and noPixels");
		});

		it("is comparable to itself (and always equal)", function() {
			assert.equal(noPixels.compare(noPixels) === 0, true);
		});

		it("is always 'less' than pixel values", function() {
			var zero = Pixels.create(0);

			assert.equal(noPixels.compare(zero) < 0, true, "noPixels < pixels");
			assert.equal(zero.compare(noPixels) > 0, true, "pixels > noPixels");
		});

		it("diffs", function() {
			var pixels = Pixels.create(42);

			assert.equal(noPixels.diff(noPixels2), "", "diffing noPixels and noPixels");
			assert.equal(noPixels.diff(pixels), "non-measurable", "diffing noPixels and pixels");
			assert.equal(pixels.diff(noPixels), "non-measurable", "diffing pixels and noPixels");
		});

		it("converts to string", function() {
			assert.equal(noPixels.toString(), "no pixels");
		});

	});
});