// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Pixels = require("./pixels.js");
var Value = require("./value.js");
var CssLength = require("./css_length.js");

describe("Pixels", function() {

	var a1 = Pixels.create(10);
	var a2 = Pixels.create(10);
	var b = Pixels.create(20);

	it("is a value and css length object", function() {
		assert.implements(a1, Value);
		assert.implements(a1, CssLength);
	});

	it("performs arithmetic", function() {
		assert.objEqual(a1.plus(b), Pixels.create(30), "addition");
		assert.objEqual(b.minus(a1), Pixels.create(10), "subtraction");
		assert.objEqual(a1.times(3), Pixels.create(30), "multiplication");
		assert.objEqual(a1.average(b), Pixels.create(15), "average");
		assert.objEqual(b.average(a1), Pixels.create(15), "average should not care about ordering");
	});

	it("performs comparisons", function() {
		assert.equal(a1.compare(b) < 0, true, "less than");
		assert.equal(b.compare(a1) > 0, true, "greater than");
		assert.equal(a1.compare(a2) === 0, true, "equal");
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

});
