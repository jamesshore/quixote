// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Position = require("../values/position.js");
var PositionDescriptor = require("./position_descriptor.js");
var Descriptor = require("./descriptor.js");

describe("DESCRIPTOR: PositionDescriptor", function() {

	var X = 30;
	var Y = 60;

	var x;
	var y;

	beforeEach(function() {
		x = new Example("x", X);
		y = new Example("y", Y);
	});

	it("is a descriptor", function() {
		assert.type(x, Descriptor);
	});

	it("converts comparison arguments", function() {
		assert.objEqual(x.convert(13, "number"), Position.x(13), "converts numbers to x positions");
		assert.objEqual(y.convert(42, "number"), Position.y(42), "converts numbers to y positions");
	});

	it("can be shifted up, down, left, and right", function() {
		assert.objEqual(x.plus(15).value(), Position.x(X + 15), "right");
		assert.objEqual(x.minus(25).value(), Position.x(X - 25), "left");

		assert.objEqual(y.plus(10).value(), Position.y(Y + 10), "down");
		assert.objEqual(y.minus(10).value(), Position.y(Y - 10), "up");
	});

});


function Example(dimension, value) {
	if (dimension === "x") {
		PositionDescriptor.x(this);
		this._position = Position.x(value);
	}
	else {
		PositionDescriptor.y(this);
		this._position = Position.y(value);
	}
}
PositionDescriptor.extend(Example);

Example.prototype.value = function() {
	return this._position;
};