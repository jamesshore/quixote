// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Size = require("./size.js");
var Pixels = require("./pixels.js");

describe("Size", function() {

	var a1 = new Size(52);
	var a2 = new Size(52);
	var b = new Size(7);

	it("can be constructed from pixels", function() {
		assert.objEqual(new Size(new Pixels(52)), a1);
	});

	it("responds to value()", function() {
		assert.equal(a1.value(), a1);    // note identity comparison, not objEqual()
	});

	it("arithmetic", function() {
		assert.objEqual(a1.plus(b), new Size(59));
		assert.objEqual(a1.minus(b), new Size(45));
	});

	it("converts to pixels", function() {
		assert.objEqual(a1.toPixels(), new Pixels(52));
	});

	it("compares", function() {
		assert.equal(a1.compare(b) > 0, true, "bigger");
		assert.equal(b.compare(a1) < 0, true, "smaller");
		assert.equal(b.compare(b) === 0, true, "same");
	});

	it("describes difference", function() {
		assert.equal(a1.diff(b), "45px larger");
		assert.equal(b.diff(a1), "45px smaller");
		assert.equal(a1.diff(a2), "");
	});

	it("equals()", function() {
		assert.objEqual(a1, a2, "same");
		assert.objNotEqual(a1, b, "different");
	});

	it("toString()", function() {
		assert.equal(a1.toString(), "52px");
	});

});