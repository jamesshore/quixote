// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var SizeDescriptor = require("./size_descriptor.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

describe("DESCRIPTOR: SizeDescriptor", function() {

	var SIZE = 30;

	var example;

	beforeEach(function() {
		example = createDescriptor(SIZE);
	});

	it("is a descriptor", function() {
		assert.type(example, Descriptor);
	});

	it("converts numbers to sizes", function() {
		assert.objEqual(example.convert(13, "number"), Size.create(13));
	});

	it("converts 'none' to non-displayed position", function() {
		assert.objEqual(example.convert("none", "string"), Size.createNone(), "should convert 'none'");
		assert.undefined(example.convert("any other string", "string"), "should ignore other strings");
	});

	it("can be arithmaticated (yes, that's a word now)", function() {
		assert.objEqual(example.plus(10).value(), Size.create(SIZE + 10), "bigger");
		assert.objEqual(example.minus(10).value(), Size.create(SIZE - 10), "smaller");
		assert.objEqual(example.times(3).value(), Size.create(SIZE * 3), "multiplied");
	});


	describe("assertions", function() {

		it("checks that size is bigger than expectation", function() {
			var actual = createDescriptor(10);
			var expectedSuccess = createDescriptor(5);
			var expectedFailure = createDescriptor(15);

			assert.noException(
				function() { actual.should.beBiggerThan(expectedSuccess); }
			);

			assert.exception(
				function() { actual.should.beBiggerThan(expectedFailure, "my message"); },
				"my message: 10px example should be at least 6px bigger.\n" +
				"  Expected: more than 15px (15px example)\n" +
				"  But was:  10px"
			);
		});

		it("checks that size is smaller than expectation", function() {
			var actual = createDescriptor(10);
			var expectedSuccess = createDescriptor(15);
			var expectedFailure = createDescriptor(5);

			assert.noException(
				function() { actual.should.beSmallerThan(expectedSuccess); }
			);

			assert.exception(
				function() { actual.should.beSmallerThan(expectedFailure, "my message"); },
				"my message: 10px example should be at least 6px smaller.\n" +
				"  Expected: less than 5px (5px example)\n" +
				"  But was:  10px"
			);
		});

	});

});

function createDescriptor(size) {
	return new ExampleSizeDescriptor(size);
}



function ExampleSizeDescriptor(size) {
	this.should = this.createShould();
	this.size = Size.create(size);
}
SizeDescriptor.extend(ExampleSizeDescriptor);
ExampleSizeDescriptor.prototype.value = function() { 	return this.size; };
ExampleSizeDescriptor.prototype.toString = function() { 	return this.size + " example"; };