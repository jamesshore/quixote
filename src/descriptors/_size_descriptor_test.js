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
		example = new ExampleSizeDescriptor(SIZE);
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

});

function ExampleSizeDescriptor(size) {
	this.position = Size.create(size);
}
SizeDescriptor.extend(ExampleSizeDescriptor);

ExampleSizeDescriptor.prototype.value = function() {
	return this.position;
};