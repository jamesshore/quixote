// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Size = require("./size.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");

describe("Size", function() {

	var a1 = Size.create(52);
	var a2 = Size.create(52);
	var b = Size.create(7);

	it("is a value object", function() {
		assert.implements(a1, Value);
	});

	it("can be constructed from pixels", function() {
		assert.objEqual(Size.create(Pixels.create(52)), a1);
	});

	it("arithmetic", function() {
		assert.objEqual(a1.plus(b), Size.create(59));
		assert.objEqual(a1.minus(b), Size.create(45));
		assert.objEqual(b.times(3), Size.create(21));
	});

	it("converts to pixels", function() {
		assert.objEqual(a1.toPixels(), Pixels.create(52));
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

	it("converts to string", function() {
		assert.equal(a1.toString(), "52px");
	});

});