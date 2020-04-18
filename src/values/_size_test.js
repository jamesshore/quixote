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

	it("knows if it is 'none' or not", function() {
		assert.equal(none.isNone(), true, "none");
		assert.equal(a1.isNone(), false, "not none");
	});

	it("can be be non-rendered", function() {
		assert.objEqual(Size.createNone(), none);
	});

	it("performs arithmetic", function() {
		assert.objEqual(a1.plus(b), Size.create(59), "plus");
		assert.objEqual(a1.minus(b), Size.create(45), "minus");
		assert.objEqual(b.times(3), Size.create(21), "multiply");
	});

	it("performs arithmetic on non-rendered values (but result is always non-rendered)", function() {
		assert.objEqual(none.plus(none), none, "non-rendered + non-rendered");
		assert.objEqual(a1.plus(none), none, "on-screen + non-rendered");
		assert.objEqual(none.plus(a1), none, "non-rendered + on-screen");
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
		assert.equal(a1.diff(b), "45px bigger", "bigger");
		assert.equal(b.diff(a1), "45px smaller", "smaller");

		assert.equal(none.diff(none), "", "both non-rendered");
		assert.equal(a1.diff(none), "rendered", "expected non-rendered, but was rendered");
		assert.equal(none.diff(a1), "not rendered", "expected rendered, but was non-rendered");
	});

	it("converts to string", function() {
		assert.equal(a1.toString(), "52px");
		assert.equal(none.toString(), "not rendered");
	});

});