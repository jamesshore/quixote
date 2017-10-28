// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
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
		}, "Can only calculate distance between two X coordinates or two Y coordinates");

		var xPlus = createDescriptor("x", X + 20);
		assert.equal(x.to(xPlus).toString(), "distance from " + x + " to " + xPlus, "toString()");
	});

	function createDescriptor(dimension, value) {
		return new TestPositionDescriptor(dimension, value);
	}

});


function TestPositionDescriptor(dimension, value) {
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