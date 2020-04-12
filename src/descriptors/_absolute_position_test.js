// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");

var PositionDescriptor = require("./position_descriptor");
var AbsolutePosition = require("./absolute_position.js");
var Position = require("../values/position.js");

describe("DESCRIPTOR: AbsolutePosition", function() {

	var IRRELEVANT = 42;

	it("is a position descriptor", function() {
		assert.implements(AbsolutePosition.x(IRRELEVANT), PositionDescriptor);
	});

	it("regurgitates its value", function() {
		assert.objEqual(AbsolutePosition.x(10).value(), Position.x(10), "x");
		assert.objEqual(AbsolutePosition.y(20).value(), Position.y(20), "y");
	});

	it("renders to string", function() {
		assert.equal(AbsolutePosition.x(10).toString(), "10px x-coordinate", "x");
		assert.equal(AbsolutePosition.y(20).toString(), "20px y-coordinate", "y");
	});

	it("has assertions", function() {
		assert.exception(
			function() { AbsolutePosition.x(10).should.equal(AbsolutePosition.x(30)); },
			"10px x-coordinate should be 20px to right.\n" +
			"  Expected: 30px (30px x-coordinate)\n" +
			"  But was:  10px"
		);
	});

});