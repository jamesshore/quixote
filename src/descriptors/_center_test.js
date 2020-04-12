// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var PositionDescriptor = require("./position_descriptor.js");
var Center = require("./center.js");
var Position = require("../values/position.js");

describe("DESCRIPTOR: Center", function() {

	var element;
	var center;
	var middle;

	var CENTER = 85;
	var MIDDLE = 90;

	beforeEach(function() {
		var frame = reset.frame;

		frame.add(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 60px; height: 60px'>one</p>"
		);
		element = frame.get("#one");

		center = Center.x(element.left, element.right, "horizontal description");
		middle = Center.y(element.top, element.bottom, "vertical description");
	});

	it("is a position descriptor", function() {
		assert.implements(center, PositionDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(center.value(), Position.x(CENTER), "center");
		assert.objEqual(middle.value(), Position.y(MIDDLE), "middle");
	});

	it("converts comparison arguments", function() {
		assert.objEqual(center.convert(13, "number"), Position.x(13), "should convert numbers to x-positions");
		assert.objEqual(middle.convert(13, "number"), Position.y(13), "should convert numbers to y-positions");
	});

	it("converts to string", function() {
		assert.equal(center.toString(), "horizontal description", "center");
		assert.equal(middle.toString(), "vertical description", "middle");
	});

	it("has assertions", function() {
		assert.exception(
			function() { center.should.equal(10); },
			"horizontal description should be 75px to left.\n" +
			"  Expected: 10px\n" +
			"  But was:  85px"
		);
	});

});