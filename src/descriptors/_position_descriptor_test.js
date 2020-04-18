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
	var noX;
	var noY;

	beforeEach(function() {
		x = createDescriptor("x", X);
		y = createDescriptor("y", Y);
		noX = new NoXPositionDescriptor();
		noY = new NoYPositionDescriptor();
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

	it("can span between two positions", function() {
		assert.objEqual(x.to(createDescriptor("x", X + 20)).value(), Size.create(20), "left to right");
		assert.objEqual(x.to(createDescriptor("x", X - 20)).value(), Size.create(20), "right to left");
		assert.objEqual(y.to(createDescriptor("y", Y + 30)).value(), Size.create(30), "top to bottom");
		assert.objEqual(y.to(createDescriptor("y", Y - 30)).value(), Size.create(30), "bottom to top");
		assert.exception(
			function() { x.to(y); },
			"Can't span between an X coordinate and a Y coordinate"
		);

		var xPlus = createDescriptor("x", X + 20);
		assert.equal(x.to(xPlus).toString(), "span from " + x + " to " + xPlus, "toString()");
	});

	it("can span to a numeric coordinate", function() {
		assert.objEqual(x.to(X + 20).value(), Size.create(20), "left to right");
		assert.objEqual(x.to(X - 20).value(), Size.create(20), "right to left");
		assert.objEqual(y.to(Y + 30).value(), Size.create(30), "top to bottom");
		assert.objEqual(y.to(Y - 30).value(), Size.create(30), "bottom to top");

		assert.equal(x.to(X + 20).toString(), "span from " + x + " to " + (X + 20) + "px x-coordinate", "toString()");
	});

	it("allows custom nicknames for spans", function() {
		assert.equal(x.to(X, "my nickname").toString(), "my nickname");
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

		it("checks that position is left of an expected value", function() {
			var actual = createDescriptor("x", 10);
			var expectedSuccess = createDescriptor("x", 15);
			var expectedFailure = createDescriptor("x", 5);

			assert.noException(
				function() { actual.should.beLeftOf(expectedSuccess); }
			);

			assert.exception(
				function() { actual.should.beLeftOf(expectedFailure, "my message"); },
				"my message: x.10px should be at least 6px to left.\n" +
				"  Expected: less than 5px (x.5px)\n" +
				"  But was:  10px"
			);
		});

		it("checks that position is right of an expected value", function() {
			var actual = createDescriptor("x", 10);
			var expectedSuccess = createDescriptor("x", 5);
			var expectedFailure = createDescriptor("x", 15);

			assert.noException(
				function() { actual.should.beRightOf(expectedSuccess); }
			);

			assert.exception(
				function() { actual.should.beRightOf(expectedFailure, "my message"); },
				"my message: x.10px should be at least 6px to right.\n" +
				"  Expected: more than 15px (x.15px)\n" +
				"  But was:  10px"
			);
		});

		it("fails gracefully if using above/below on x-coordinate", function() {
			assert.exception(
				function() { x.should.beAbove(5); },
				/Can't use 'should.beAbove\(\)' on X coordinates. Did you mean 'should.beLeftOf\(\)'\?/
			);
			assert.exception(
				function() { x.should.beBelow(5); },
				/Can't use 'should.beBelow\(\)' on X coordinates. Did you mean 'should.beRightOf\(\)'\?/
			);
		});


		it("fails gracefully if using left/right on y-coordinate", function() {
			assert.exception(
				function() { y.should.beLeftOf(5); },
				/Can't use 'should.beLeftOf\(\)' on Y coordinates. Did you mean 'should.beAbove\(\)'\?/
			);
			assert.exception(
				function() { y.should.beRightOf(5); },
				/Can't use 'should.beRightOf\(\)' on Y coordinates. Did you mean 'should.beBelow\(\)'\?/
			);
		});

		it("fails gracefully if actual is non-rendered", function() {
			assert.exception(
				function() { noY.should.beAbove(10); },
				"not rendered example should be rendered.\n" +
				"  Expected: less than 10px\n" +
				"  But was:  not rendered"
			);
			assert.exception(
				function() { noY.should.beBelow(10); },
				"not rendered example should be rendered.\n" +
				"  Expected: more than 10px\n" +
				"  But was:  not rendered"
			);
			assert.exception(
				function() { noX.should.beLeftOf(10); },
				"not rendered example should be rendered.\n" +
				"  Expected: less than 10px\n" +
				"  But was:  not rendered"
			);
			assert.exception(
				function() { noX.should.beRightOf(10); },
				"not rendered example should be rendered.\n" +
				"  Expected: more than 10px\n" +
				"  But was:  not rendered"
			);
		});

		it("fails gracefully if expectation is non-rendered", function() {
			assert.exception(
				function() { y.should.beAbove("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
			assert.exception(
				function() { y.should.beBelow("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
			assert.exception(
				function() { x.should.beLeftOf("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
			assert.exception(
				function() { x.should.beRightOf("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
		});

		it("fails gracefully if both are non-rendered", function() {
			assert.exception(
				function() { noY.should.beAbove("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
			assert.exception(
				function() { noY.should.beBelow("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
			assert.exception(
				function() { noX.should.beLeftOf("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
			assert.exception(
				function() { noX.should.beRightOf("none"); },
				/'expected' value is not rendered, so relative comparisons aren't possible/
			);
		});

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


function NoXPositionDescriptor() {
	this.should = this.createShould();
	PositionDescriptor.x(this);
	this.position = Position.noX();
}
PositionDescriptor.extend(NoXPositionDescriptor);
NoXPositionDescriptor.prototype.value = function() { 	return this.position; };
NoXPositionDescriptor.prototype.toString = function() { 	return this.position + " example"; };


function NoYPositionDescriptor() {
	this.should = this.createShould();
	PositionDescriptor.y(this);
	this.position = Position.noY();
}
PositionDescriptor.extend(NoYPositionDescriptor);
NoYPositionDescriptor.prototype.value = function() { 	return this.position; };
NoYPositionDescriptor.prototype.toString = function() { 	return this.position + " example"; };
