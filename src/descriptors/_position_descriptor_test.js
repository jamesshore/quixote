// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Position = require("../values/position.js");
var PositionDescriptor = require("./position_descriptor.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

describe("DESCRIPTOR: PositionDescriptor", function() {

	var X = 30;
	var Y = 60;

	var x;
	var y;

	beforeEach(function() {
		x = createDescriptor("x", X);
		y = createDescriptor("y", Y);
	});

	it("is a descriptor", function() {
		assert.type(x, Descriptor);
	});

	it("converts numbers to positions", function() {
		assert.objEqual(x.convert(13, "number"), Position.x(13), "x");
		assert.objEqual(y.convert(42, "number"), Position.y(42), "y");
	});

	it("converts 'none' to non-displayed position", function() {
		assert.objEqual(x.convert("none", "string"), Position.noX());
		assert.objEqual(y.convert("none", "string"), Position.noY());
	});

	it("can be shifted up, down, left, and right", function() {
		assert.objEqual(x.plus(15).value(), Position.x(X + 15), "right");
		assert.objEqual(x.minus(25).value(), Position.x(X - 25), "left");

		assert.objEqual(y.plus(10).value(), Position.y(Y + 10), "down");
		assert.objEqual(y.minus(10).value(), Position.y(Y - 10), "up");
	});

	it("calculates distance to another position", function() {
		assert.objEqual(x.to(createDescriptor("x", X + 20)).value(), Size.create(20), "left to right");
		assert.objEqual(x.to(createDescriptor("x", X - 20)).value(), Size.create(20), "right to left");
		assert.objEqual(y.to(createDescriptor("y", Y + 30)).value(), Size.create(30), "top to bottom");
		assert.objEqual(y.to(createDescriptor("y", Y - 30)).value(), Size.create(30), "bottom to top");
		assert.exception(function() {
			x.to(createDescriptor("y", 42));
		}, "Can't calculate distance between an X coordinate and a Y coordinate");

		var xPlus = createDescriptor("x", X + 20);
		assert.equal(x.to(xPlus).toString(), "distance from " + x + " to " + xPlus, "toString()");
	});

	it("calculates distance to a numeric coordinate", function() {
		assert.objEqual(x.to(X + 20).value(), Size.create(20), "left to right");
		assert.objEqual(x.to(X - 20).value(), Size.create(20), "right to left");
		assert.objEqual(y.to(Y + 30).value(), Size.create(30), "top to bottom");
		assert.objEqual(y.to(Y - 30).value(), Size.create(30), "bottom to top");

		assert.equal(x.to(X + 20).toString(), "distance from " + x + " to " + (X + 20) + "px x-coordinate", "toString()");
	});


	describe("assertions", function() {

		it("checks that position is above an expected value", function() {
			var actual = createDescriptor("y", 10);
			var expectedSuccess = createDescriptor("y", 15);
			var expectedFailure = createDescriptor("y", 5);

			assert.noException(
				function() { actual.should.beAbove(expectedSuccess); }
			);

			assert.exception(
				function() { actual.should.beAbove(expectedFailure, "my message"); },
				"my message: y.10px should be at least 6px higher.\n" +
				"  Expected: less than 5px (y.5px)\n" +
				"  But was:  10px"
			);
		});

		it("checks that position is below an expected value", function() {
			var actual = createDescriptor("y", 10);
			var expectedSuccess = createDescriptor("y", 5);
			var expectedFailure = createDescriptor("y", 15);

			assert.noException(
				function() { actual.should.beBelow(expectedSuccess); }
			);

			assert.exception(
				function() { actual.should.beBelow(expectedFailure, "my message"); },
				"my message: y.10px should be at least 6px lower.\n" +
				"  Expected: more than 15px (y.15px)\n" +
				"  But was:  10px"
			);
		});
		//
		// it("checks that position is above an expected value", function() {
		// 	var actual = createDescriptor("y", 10);
		// 	var expectedSuccess = createDescriptor("y", 15);
		// 	var expectedFailure = createDescriptor("y", 5);
		//
		// 	assert.noException(
		// 		function() { actual.should.beAbove(expectedSuccess); }
		// 	);
		//
		// 	assert.exception(
		// 		function() { actual.should.beAbove(expectedFailure, "my message"); },
		// 		"my message: y.10px should be at least 6px higher.\n" +
		// 		"  Expected: less than 5px (y.5px)\n" +
		// 		"  But was:  10px"
		// 	);
		// });
		//
		// it("checks that position is above an expected value", function() {
		// 	var actual = createDescriptor("y", 10);
		// 	var expectedSuccess = createDescriptor("y", 15);
		// 	var expectedFailure = createDescriptor("y", 5);
		//
		// 	assert.noException(
		// 		function() { actual.should.beAbove(expectedSuccess); }
		// 	);
		//
		// 	assert.exception(
		// 		function() { actual.should.beAbove(expectedFailure, "my message"); },
		// 		"my message: y.10px should be at least 6px higher.\n" +
		// 		"  Expected: less than 5px (y.5px)\n" +
		// 		"  But was:  10px"
		// 	);
		// });

	});

});

function createDescriptor(dimension, value) {
	return new TestPositionDescriptor(dimension, value);
}


function TestPositionDescriptor(dimension, value) {
	this.should = this.createShould();
	this._dimension = dimension;
	if (dimension === "x") {
		PositionDescriptor.x(this);
		this._position = Position.x(value);
	}
	else {
		PositionDescriptor.y(this);
		this._position = Position.y(value);
	}
}
PositionDescriptor.extend(TestPositionDescriptor);

TestPositionDescriptor.prototype.value = function() {
	return this._position;
};

TestPositionDescriptor.prototype.toString = function() {
	return this._dimension + "." + this._position.toString();
};