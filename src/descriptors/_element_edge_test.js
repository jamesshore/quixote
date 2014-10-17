// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var ElementEdge = require("./element_edge.js");
var Position = require("../values/position.js");
var ElementPosition = require("./element_position.js");
var Descriptor = require("./descriptor.js");

describe("ElementEdge", function() {

	var frame;
	var one;
	var top;
	var right;
	var bottom;
	var left;

	var TOP = 10;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	beforeEach(function() {
		var frame = reset.frame;
		frame.addElement(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		one = frame.getElement("#one");
		top = ElementEdge.top(one);
		right = ElementEdge.right(one);
		bottom = ElementEdge.bottom(one);
		left = ElementEdge.left(one);
	});

	it("is a descriptor", function() {
		assert.type(top, Descriptor);
	});

	it("resolves itself to actual value", function() {
		assert.objEqual(top.value(), Position.y(TOP), "top");
		assert.objEqual(right.value(), Position.x(RIGHT), "right");
		assert.objEqual(bottom.value(), Position.y(BOTTOM), "bottom");
		assert.objEqual(left.value(), Position.x(LEFT), "left");
	});

	it("converts arguments to comparable values", function() {
		assert.objEqual(top.convert(13), Position.y(13), "top");
		assert.objEqual(right.convert(13), Position.x(13), "right");
		assert.objEqual(bottom.convert(13), Position.y(13), "bottom");
		assert.objEqual(left.convert(13), Position.x(13), "left");

		var descriptor = ElementPosition.x(top, 13);
		assert.equal(top.convert(descriptor), descriptor, "descriptor");
	});

	it("converts to string", function() {
		assertDesc(one, top, "top edge of ", "top");
		assertDesc(one, right, "right edge of ", "right");
		assertDesc(one, bottom, "bottom edge of ", "bottom");
		assertDesc(one, left, "left edge of ", "left");

		function assertDesc(element, edge, expected, message) {
			assert.equal(edge.toString(), expected + "element '" + element.description() + "'", message);
		}
	});

	it("describes match", function() {
		assert.equal(top.describeMatch(), "match " + top.toString() + " (10px)");
	});

	it("can be shifted up, down, left, and right", function() {
		assert.objEqual(top.plus(10).value(), Position.y(TOP + 10), "down");
		assert.objEqual(top.minus(10).value(), Position.y(TOP - 10), "up");

		assert.objEqual(left.plus(15).value(), Position.x(LEFT + 15), "right");
		assert.objEqual(left.minus(25).value(), Position.x(LEFT - 25), "left");
	});

});