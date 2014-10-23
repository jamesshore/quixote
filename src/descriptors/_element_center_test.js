// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var Descriptor = require("./descriptor.js");
var ElementCenter = require("./element_center.js");
var Position = require("../values/position.js");

describe("ElementCenter", function() {

	var element;
	var center;
	var middle;

	var CENTER = 85;
	var MIDDLE = 90;

	var WIDTH = 130;
	var HEIGHT = 60;

	beforeEach(function() {
		var frame = reset.frame;

		frame.addElement(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 60px; height: 60px'>one</p>"
		);
		element = frame.get("#one");
		center = ElementCenter.x(element);
		middle = ElementCenter.y(element);
	});

	it("is a descriptor", function() {
		assert.implements(center, Descriptor);
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
		assert.equal(center.toString(), "center of " + element, "center");
		assert.equal(middle.toString(), "middle of " + element, "middle");
	});

	it("can be shifted up, down, left, and right", function() {
		assert.objEqual(center.plus(15).value(), Position.x(CENTER + 15), "right");
		assert.objEqual(center.minus(25).value(), Position.x(CENTER - 25), "left");

		assert.objEqual(middle.plus(10).value(), Position.y(MIDDLE + 10), "down");
		assert.objEqual(middle.minus(10).value(), Position.y(MIDDLE - 10), "up");
	});

	it("can be shifted by the size of another element", function() {
		assert.objEqual(center.plus(element.width).value(), Position.x(CENTER + WIDTH), "right");
		assert.objEqual(center.minus(element.height).value(), Position.x(CENTER - HEIGHT), "left");

		assert.objEqual(middle.plus(element.width).value(), Position.y(MIDDLE + WIDTH), "down");
		assert.objEqual(middle.minus(element.width).value(), Position.y(MIDDLE - WIDTH), "up");
	});

});