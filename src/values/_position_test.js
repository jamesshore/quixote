// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Position = require("./position.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");
var Size = require("./size.js");

describe("VALUE: Position", function() {

	var x1 = Position.x(10);
	var x2 = Position.x(20);
	var x1b = Position.x(10);
	var x2b = Position.x(20);

	var y1 = Position.y(50);
	var y2 = Position.y(80);
	var y1b = Position.y(50);

	var noX = Position.noX();
	var noY = Position.noY();

	it("is a value object", function() {
		assert.implements(x1, Value);
	});

	it("can be constructed from pixels", function() {
		assert.objEqual(Position.x(Pixels.create(10)), x1);
	});

	it("knows if it is 'none' or not", function() {
		assert.equal(noX.isNone(), true, "no X");
		assert.equal(noY.isNone(), true, "no Y");
		assert.equal(x1.isNone(), false, "not no X");
		assert.equal(y1.isNone(), false, "not no Y");
	});

	it("can be be non-rendered", function() {
		assert.objEqual(Position.noX(), noX, "x");
		assert.objEqual(Position.noY(), noY, "y");
	});

	it("responds to value()", function() {
		assert.equal(x1.value(), x1);    // note identity comparison, not objEqual()
	});

	it("computes distance between positions (and always returns positive result)", function() {
		assert.objEqual(y1.distanceTo(y2), Size.create(30), "smaller to larger");
		assert.objEqual(y2.distanceTo(y1), Size.create(30), "larger to smaller");
		assert.objEqual(x1.distanceTo(x2), Size.create(10), "axis is irrelevant");
		assert.objEqual(y1.distanceTo(noY), Size.createNone(), "rendered to non-rendered");
		assert.objEqual(noY.distanceTo(y1), Size.createNone(), "non-rendered to rendered");
		assert.objEqual(noY.distanceTo(noY), Size.createNone(), "non-rendered to non-rendered");
	});

	it("performs arithmetic on itself", function() {
		assert.objEqual(x1.plus(x2), Position.x(30), "plus x");
		assert.objEqual(y1.plus(y2), Position.y(130), "plus y");
		assert.objEqual(x2.minus(x1), Position.x(10), "minus x");
		assert.objEqual(y2.minus(y1), Position.y(30), "minus y");
	});

	it("performs arithmetic on size", function() {
		assert.objEqual(x1.plus(Size.create(42)), Position.x(52), "plus");
		assert.objEqual(x1.minus(Size.create(7)), Position.x(3), "minus");
	});

	it("computes midpoint", function() {
		assert.objEqual(x1.midpoint(x2), Position.x(15), "left to right");
		assert.objEqual(x2.midpoint(x1), Position.x(15), "right to left");
		assert.objEqual(y1.midpoint(y2), Position.y(65), "top to bottom");
		assert.objEqual(y2.midpoint(y1), Position.y(65), "bottom to top");
	});

	it("performs comparisons", function() {
		assert.equal(x1.compare(x2) < 0, true, "left of");
		assert.equal(x2.compare(x1) > 0, true, "right of");
		assert.equal(x1.compare(x1b) === 0, true, "same");

		assert.equal(y1.compare(y2) < 0, true, "higher");
		assert.equal(y2.compare(y1) > 0, true, "lower");
		assert.equal(y1.compare(y1b) === 0, true, "same");
	});

	it("minimizes and maximizes", function() {
		assert.objEqual(x1.min(x2), x1b, "min");
		assert.objEqual(x1.max(x2), x2b, "max");
	});

	it("allows computation with non-rendered values (but result is always non-rendered)", function() {
		assert.objEqual(noX.plus(noX), noX, "non-rendered + non-rendered");
		assert.objEqual(noX.plus(x1), noX, "non-rendered + on-screen");
		assert.objEqual(x1.plus(noX), noX, "on-screen + non-rendered");

		assert.objEqual(noX.plus(Size.create(42)), noX, "non-rendered + size");
	});

	it("describes difference between displayed positions", function() {
		assert.equal(x1.diff(x1b), "", "same");

		assert.equal(x1.diff(x2), "10px to left", "less than expected - horizontal");
		assert.equal(x2.diff(x1), "10px to right", "more than expected - horizontal");

		assert.equal(y1.diff(y2), "30px higher", "less than expected - vertical");
		assert.equal(y2.diff(y1), "30px lower", "more than expected - vertical");
	});

	it("describes difference between undisplayed positions", function() {
		assert.equal(noX.diff(noX), "", "same");
		assert.equal(x1.diff(noX), "rendered", "rendered");
		assert.equal(noX.diff(x1), "not rendered", "non-rendered");
	});

	it("can't compare positions and sizes", function() {
		assert.exception(function() {
			x1.equals(Size.create(10));
		}, "Argument #1 expected Position instance, but was Size instance");
	});

	it("fails fast when doing stuff with incompatible dimensions", function() {
		var expected = "Can't compare X coordinate to Y coordinate";
		assert.exception(function() { x1.distanceTo(y1); }, expected, "distanceTo");
		assert.exception(function() { x1.plus(y1); }, expected, "plus");
		assert.exception(function() { x1.minus(y1); }, expected, "minus");
		assert.exception(function() { x1.midpoint(y1); }, expected, "midpoint");
		assert.exception(function() { x1.compare(y1); }, expected, "compare");
		assert.exception(function() { x1.equals(y1); }, expected, "equals");
		assert.exception(function() { x1.diff(y1); }, expected, "diff");
	});

	it("converts to pixels", function() {
		assert.objEqual(x1.toPixels(), Pixels.create(10));
	});

	it("converts to string", function() {
		assert.equal(x1.toString(), "10px");
		assert.equal(noX.toString(), "not rendered");
	});

});

