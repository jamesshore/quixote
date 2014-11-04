// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var ElementEdge = require("./element_edge.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var PositionDescriptor = require("./position_descriptor.js");

describe("ElementEdge", function() {

	var frame;
	var element;
	var top;
	var right;
	var bottom;
	var left;

	var TOP = 10;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	var WIDTH = 130;
	var HEIGHT = 60;

	beforeEach(function() {
		frame = reset.frame;
		element = frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>",
			"element"
		);
		top = ElementEdge.top(element);
		right = ElementEdge.right(element);
		bottom = ElementEdge.bottom(element);
		left = ElementEdge.left(element);
	});

	it("is a position descriptor", function() {
		assert.implements(top, PositionDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(top.value(), Position.y(TOP), "top");
		assert.objEqual(right.value(), Position.x(RIGHT), "right");
		assert.objEqual(bottom.value(), Position.y(BOTTOM), "bottom");
		assert.objEqual(left.value(), Position.x(LEFT), "left");
	});

	it("converts arguments to comparable values", function() {
		assert.objEqual(top.convert(13, "number"), Position.y(13), "top");
		assert.objEqual(right.convert(13, "number"), Position.x(13), "right");
		assert.objEqual(bottom.convert(13, "number"), Position.y(13), "bottom");
		assert.objEqual(left.convert(13, "number"), Position.x(13), "left");
	});

	it("converts to string", function() {
		assertDesc(element, top, "top edge of ", "top");
		assertDesc(element, right, "right edge of ", "right");
		assertDesc(element, bottom, "bottom edge of ", "bottom");
		assertDesc(element, left, "left edge of ", "left");

		function assertDesc(element, edge, expected, message) {
			assert.equal(edge.toString(), expected + element, message);
		}
	});

	it("accounts for scrolling", function() {
		if (quixote.browser.enlargesFrameToPageSize()) return;

		frame.add("<div style='position: absolute; left: 5000px; top: 5000px; width: 60px'>scroll enabler</div>");

		frame.scroll(50, 60);

		assert.objEqual(top.value(), Position.y(TOP), "top");
		assert.objEqual(right.value(), Position.x(RIGHT), "right");
		assert.objEqual(bottom.value(), Position.y(BOTTOM), "bottom");
		assert.objEqual(left.value(), Position.x(LEFT), "left");
	});

});