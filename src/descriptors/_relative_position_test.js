// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var RelativePosition = require("./relative_position.js");
var Position = require("../values/position.js");
var PositionDescriptor = require("./position_descriptor.js");

describe("DESCRIPTOR: RelativePosition", function() {

	var element;
	var right;
	var down;
	var left;
	var up;

	var TOP = 300;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	var WIDTH = 130;
	var HEIGHT = 60;

	var RIGHT_ADJ = 5;
	var DOWN_ADJ = 10;
	var LEFT_ADJ = 3;
	var UP_ADJ = 4;

	beforeEach(function() {
		var frame = reset.frame;
		frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 300px; height: 60px'>element</p>"
		);
		element = frame.get("#element");
		right = RelativePosition.right(element.left, RIGHT_ADJ);
		down = RelativePosition.down(element.top, DOWN_ADJ);
		left = RelativePosition.left(element.left, LEFT_ADJ);
		up = RelativePosition.up(element.top, UP_ADJ);
	});

	it("is a position descriptor", function() {
		assert.implements(right, PositionDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(right.value(), Position.x(LEFT + RIGHT_ADJ), "right");
		assert.objEqual(down.value(), Position.y(TOP + DOWN_ADJ), "down");
		assert.objEqual(left.value(), Position.x(LEFT - LEFT_ADJ), "left");
		assert.objEqual(up.value(), Position.y(TOP - UP_ADJ), "up");
	});

	it("computes value relative to a size descriptor", function() {
		right = RelativePosition.right(element.left, element.width);
		assert.objEqual(right.value(), Position.x(LEFT + WIDTH));
	});

	it("computes value relative to a relative size descriptor", function() {
		right = RelativePosition.right(element.left, element.width.plus(10));
		assert.objEqual(right.value(), Position.x(LEFT + WIDTH + 10));
	});

	it("converts arguments to comparable values", function() {
		assert.objEqual(right.convert(13, "number"), Position.x(13), "right");
		assert.objEqual(down.convert(13, "number"), Position.y(13), "down");
		assert.objEqual(left.convert(13, "number"), Position.x(13), "left");
		assert.objEqual(up.convert(13, "number"), Position.y(13), "up");
	});

	it("converts to string", function() {
		assertRight(element.left, 10, "10px to right of ", "right +");
		assertRight(element.left, -15, "15px to left of ", "right -");
		assertRight(element.left, 0, "", "right 0");

		assertDown(element.top, 20, "20px below ", "down +");
		assertDown(element.top, -20, "20px above ", "down -");
		assertDown(element.top, 0, "", "down 0");

		assertLeft(element.left, 10, "10px to left of ", "left +");
		assertLeft(element.left, -10, "10px to right of ", "left -");
		assertLeft(element.left, 0, "", "left 0");

		assertUp(element.top, 20, "20px above ", "up +");
		assertUp(element.top, -20, "20px below ", "up -");
		assertUp(element.top, 0, "", "up 0");

		function assertRight(edge, amount, expected, message) {
			assert.equal(RelativePosition.right(edge, amount).toString(), expected + edge.toString(), message);
		}

		function assertDown(edge, amount, expected, message) {
			assert.equal(RelativePosition.down(edge, amount).toString(), expected + edge.toString(), message);
		}

		function assertLeft(edge, amount, expected, message) {
			assert.equal(RelativePosition.left(edge, amount).toString(), expected + edge.toString(), message);
		}

		function assertUp(edge, amount, expected, message) {
			assert.equal(RelativePosition.up(edge, amount).toString(), expected + edge.toString(), message);
		}
	});

	it("has assertions", function() {
		assert.exception(
			function() { left.should.equal(30); },
			"3px to left of left edge of '#element' should be 13px to right.\n" +
			"  Expected: 30px\n" +
			"  But was:  17px"
		);
	});

});