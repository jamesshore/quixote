// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Size = require("./size.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");

describe("VALUE: Size", function() {

	var a1 = Size.create(52);
	var a2 = Size.create(52);
	var b = Size.create(7);
	var none = Size.createNone();

	it("is a value object", function() {
		assert.implements(a1, Value);
	});

	it("can be constructed from pixels", function() {
		assert.objEqual(Size.create(Pixels.create(52)), a1);
	});

	it("can be be off-screen", function() {
		assert.objEqual(Size.createNone(), none);
	});

	it("performs arithmetic", function() {
		assert.objEqual(a1.plus(b), Size.create(59), "plus");
		assert.objEqual(a1.minus(b), Size.create(45), "minus");
		assert.objEqual(b.times(3), Size.create(21), "multiply");
	});

	it("performs arithmetic on off-screen values (but result is always off-screen)", function() {
		assert.objEqual(none.plus(none), none, "off-screen + off-screen");
		assert.objEqual(a1.plus(none), none, "on-screen + off-screen");
		assert.objEqual(none.plus(a1), none, "off-screen + on-screen");
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
		assert.equal(a1.diff(a2), "", "same");
		assert.equal(a1.diff(b), "45px larger than expected", "larger");
		assert.equal(b.diff(a1), "45px smaller than expected", "smaller");

		assert.equal(none.diff(none), "", "both off-screen");
		assert.equal(a1.diff(none), "displayed when not expected", "expected off-screen, but was on");
		assert.equal(none.diff(a1), "not displayed", "expected on-screen, but was off");
	});

	it("converts to string", function() {
		assert.equal(a1.toString(), "52px");
		assert.equal(none.toString(), "not displayed");
	});

});