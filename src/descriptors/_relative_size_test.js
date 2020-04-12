// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var RelativeSize = require("./relative_size.js");
var Size = require("../values/size.js");
var SizeDescriptor = require("./size_descriptor.js");

describe("DESCRIPTOR: RelativeSize", function() {

	var element;
	var smaller;
	var larger;

	var WIDTH = 130;
	var HEIGHT = 60;

	beforeEach(function() {
		var frame = reset.frame;
		frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.get("#element");
		larger = RelativeSize.larger(element.height, 10);
		smaller = RelativeSize.smaller(element.width, 5);
	});

	it("is a size descriptor", function() {
		assert.implements(smaller, SizeDescriptor);
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

	it("has assertions", function() {
		assert.exception(
			function() { larger.should.equal(30); },
			"10px larger than height of '#element' should be 40px smaller.\n" +
			"  Expected: 30px\n" +
			"  But was:  70px"
		);
	});

});