// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var SizeMultiple = require("./size_multiple.js");
var Size = require("../values/size.js");
var SizeDescriptor = require("./size_descriptor.js");

describe("DESCRIPTOR: SizeMultiple", function() {

	var WIDTH = 130;

	var element;
	var twice;

	beforeEach(function() {
		var frame = reset.frame;
		frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.get("#element");
		twice = SizeMultiple.create(element.width, 2);
	});

	it("is a size descriptor", function() {
		assert.implements(twice, SizeDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(twice.value(), Size.create(WIDTH * 2));
	});

	it("renders to string", function() {
		// multiple
		check(2, "2 times ", "twice");
		check(52.1838, "52.1838 times ", "any multiple");
		check(1, "", "same");

		// vulgar fractions
		check(1/2, "half of ", "1/2");
		check(1/3, "one-third of ", "1/3");
		check(2/3, "two-thirds of ", "2/3");
		check(1/4, "one-quarter of ", "1/4");
		check(3/4, "three-quarters of ", "3/4");
		check(1/5, "one-fifth of ", "1/5");
		check(2/5, "two-fifths of ", "2/5");
		check(3/5, "three-fifths of ", "3/5");
		check(4/5, "four-fifths of ", "4/5");
		check(1/6, "one-sixth of ", "1/6");
		check(5/6, "five-sixths of ", "5/6");
		check(1/8, "one-eighth of ", "1/8");
		check(3/8, "three-eighths of ", "3/8");
		check(5/8, "five-eighths of ", "5/8");
		check(7/8, "seven-eighths of ", "7/8");

		// percentages
		check(0.1, "10% of ", "10%");
		check(0.42, "42% of ", "arbitrary percentage");
		check(0.12345, "12.345% of ", "decimal percentage");

		function check(multiple, expected, message) {
			var descriptor = SizeMultiple.create(element.width, multiple);
			assert.equal(descriptor.toString(), expected + element.width, message);
		}
	});

	it("has assertions", function() {
		assert.exception(
			function() { twice.should.equal(30); },
			"2 times width of '#element' should be 230px smaller.\n" +
			"  Expected: 30px\n" +
			"  But was:  260px"
		);
	});

});