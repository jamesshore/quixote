// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var RelativeSize = require("./relative_size.js");
var Size = require("../values/size.js");
var Descriptor = require("./descriptor.js");

describe("RelativeSize", function() {

	var element;
	var smaller;
	var larger;

	var WIDTH = 130;
	var HEIGHT = 60;

	var LARGER = HEIGHT + 10;
	var SMALLER = WIDTH - 5;

	beforeEach(function() {
		var frame = reset.frame;
		frame.addElement(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.getElement("#element");
		larger = RelativeSize.larger(element.height, 10);
		smaller = RelativeSize.smaller(element.width, 5);
	});

	it("is a descriptor", function() {
		assert.implements(smaller, Descriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(larger.value(), Size.create(70), "y");
		assert.objEqual(smaller.value(), Size.create(125), "x");
	});

	it("computes value relative to a size descriptor", function() {
		var rel = RelativeSize.larger(element.height, element.width);
		assert.objEqual(rel.value(), Size.create(HEIGHT + WIDTH));
	});

	it("computes value relative to a relative size descriptor", function() {
		var rel = RelativeSize.larger(element.height, element.width.plus(10));
		assert.objEqual(rel.value(), Size.create(HEIGHT + WIDTH + 10));
	});

	it("converts arguments to comparable values", function() {
		assert.objEqual(smaller.convert(50, "number"), Size.create(50), "number");
	});

	it("converts to string", function() {
		assertLarger(element.width, 10, "10px larger than ", "larger +");
		assertLarger(element.width, -15, "15px smaller than ", "larger -");
		assertLarger(element.width, 0, "", "larger 0");

		assertSmaller(element.width, 10, "10px smaller than ", "smaller +");
		assertSmaller(element.width, -10, "10px larger than ", "smaller -");
		assertSmaller(element.width, 0, "", "smaller 0");

		function assertLarger(relativeTo, amount, expected, message) {
			assert.equal(RelativeSize.larger(relativeTo, amount).toString(), expected + relativeTo, message);
		}

		function assertSmaller(relativeTo, amount, expected, message) {
			assert.equal(RelativeSize.smaller(relativeTo, amount).toString(), expected + relativeTo, message);
		}
	});

	it("can be arithmaticated", function() {
		assert.objEqual(larger.plus(10).value(), Size.create(LARGER + 10), "plus number");
		assert.objEqual(larger.minus(10).value(), Size.create(LARGER - 10), "minus number");
		assert.objEqual(larger.times(3).value(), Size.create(LARGER * 3), "multiplied");
	});

	it("can be modified (but not multiplied) by the size of another element", function() {
		assert.objEqual(larger.plus(element.width).value(), Size.create(LARGER + WIDTH), "plus size");
		assert.objEqual(larger.plus(element.width.plus(10)).value(), Size.create(LARGER + WIDTH + 10), "plus relative size");
	});

});