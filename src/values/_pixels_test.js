// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Pixels = require("./pixels.js");

describe("Pixels", function() {

	var a1 = new Pixels(10);
	var a2 = new Pixels(10);
	var b = new Pixels(20);

	it("arithmetic", function() {
		assert.objEqual(a1.plus(b), new Pixels(30));
		assert.objEqual(b.minus(a1), new Pixels(10));
	});

	it("compares", function() {
		assert.equal(a1.compare(b) < 0, true, "less than");
		assert.equal(b.compare(a1) > 0, true, "greater than");
		assert.equal(a1.compare(a2) === 0, true, "equal");
	});

	it("describes difference (always a positive result)", function() {
		assert.equal(a1.diff(b), "10px", "greater than");
		assert.equal(b.diff(a1), "10px", "less than");
		assert.equal(a1.diff(a2), "", "same");
	});

	it("equals()", function() {
		assert.objEqual(a1, a2, "same");
		assert.objNotEqual(a1, b, "different");
	});

	it("toString()", function() {
		assert.equal(a1.toString(), "10px");
	});

});