// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var SizeDescriptor = require("./size_descriptor.js");
var PositionDescriptor = require("./position_descriptor.js");
var Span = require("./span.js");
var Position = require("../values/position.js");
var Size = require("../values/size.js");

var IRRELEVANT_POSITION = 42;
var IRRELEVANT_DESCRIPTION = "irrelevant";

describe("DESCRIPTOR: Span", function() {

	it("is a descriptor", function() {
		assert.implements(xSpan(IRRELEVANT_POSITION, IRRELEVANT_POSITION), SizeDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(xSpan(10, 30).value(), Size.create(20), "forward");
		assert.objEqual(xSpan(30, 10).value(), Size.create(20), "backward");
	});

	it("renders to a string", function() {
		assert.equal(xSpan(IRRELEVANT_POSITION, IRRELEVANT_POSITION, "my description").toString(), "my description");
	});

	it("has assertions", function() {
		assert.exception(
			function() { xSpan(10, 30, "size").should.equal(30); },
			"size should be 10px bigger.\n" +
			"  Expected: 30px\n" +
			"  But was:  20px"
		);
	});

	it("has horizontal center", function() {
		var center = xSpan(10, 30, "my description").center;

		assert.objEqual(center.value(), Position.x(20), "value");
		assert.equal(center.toString(), "center of my description", "description");
	});

	it("has vertical middle", function() {
		var middle = ySpan(10, 30, "my description").middle;

		assert.objEqual(middle.value(), Position.y(20), "value");
		assert.equal(middle.toString(), "middle of my description", "description");
	});

	it("fails fast when asking for horizontal center of vertical span", function() {
		assert.exception(
		function() { ySpan(10, 30).center.should.equal(20); },
		/Can't compare X coordinate to Y coordinate/
		);
	});

	it("fails fast when asking vertical middle of horizontal span", function() {
		assert.exception(
		function() { xSpan(10, 30).middle.should.equal(20); },
		/Can't compare X coordinate to Y coordinate/
		);
	});

});

function xSpan(from, to, description) {
	if (description === undefined) description = IRRELEVANT_DESCRIPTION;
	return Span.create(new TestPosition(Position.x(from)), new TestPosition(Position.x(to)), description);
}

function ySpan(from, to, description) {
	if (description === undefined) description = IRRELEVANT_DESCRIPTION;
	return Span.create(new TestPosition(Position.y(from)), new TestPosition(Position.y(to)), description);
}

function TestPosition(position) {
	this._position = position;
}
PositionDescriptor.extend(TestPosition);
TestPosition.prototype.value = function value() { return this._position; };
TestPosition.prototype.toString = function toString() { return "test position: " + this._position; };
