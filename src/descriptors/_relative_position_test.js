// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var RelativePosition = require("./relative_position.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

describe("RelativePosition", function() {

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
		frame.addElement(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 300px; height: 60px'>element</p>"
		);
		element = frame.get("#element");
		right = RelativePosition.right(element.left, RIGHT_ADJ);
		down = RelativePosition.down(element.top, DOWN_ADJ);
		left = RelativePosition.left(element.left, LEFT_ADJ);
		up = RelativePosition.up(element.top, UP_ADJ);
	});

	it("is a descriptor", function() {
		assert.implements(right, Descriptor);
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

	it("can be shifted (by the size of another element, in this case)", function() {
		assert.objEqual(right.plus(element.width).value(), Position.x(LEFT + RIGHT_ADJ + WIDTH), "right +");
		assert.objEqual(right.minus(element.width).value(), Position.x(LEFT + RIGHT_ADJ - WIDTH), "right -");

		assert.objEqual(down.plus(element.height).value(), Position.y(TOP + DOWN_ADJ + HEIGHT), "down +");
		assert.objEqual(down.minus(element.height).value(), Position.y(TOP + DOWN_ADJ - HEIGHT), "down -");

		assert.equal(
			right.plus(element.width).toString(),
			element.width + " to right of 5px to right of " + element.left,
			"string"
		);
	});

	it("can be shifted by a relative size", function() {
		var rel = right.plus(element.width.plus(10));
		assert.objEqual(rel.value(), Position.x(LEFT + RIGHT_ADJ + WIDTH + 10), "value");
		assert.equal(rel.toString(), element.width.plus(10) + " to right of " + right);
	});

	it("can be shifted, starting with a number, by a number", function() {
		var rel = RelativePosition.right(element.left, 10).plus(15);
		assert.objEqual(rel.value(), Position.x(LEFT + 10 + 15), "value");
		assert.equal(rel.toString(), "15px to right of 10px to right of " + element.left, "string");
	});

	it("can be shifted, starting with a size, by a number", function() {
		var rel = RelativePosition.right(element.left, element.width).plus(15);
		assert.objEqual(rel.value(), Position.x(LEFT + WIDTH + 15), "value");
		assert.equal(rel.toString(), "15px to right of " + element.width + " to right of " + element.left, "string");
	});

});