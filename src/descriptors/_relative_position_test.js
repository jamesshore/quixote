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

	var TOP = 10;
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
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.getElement("#element");
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
		assert.objEqual(right.convert(13), Position.x(13), "right");
		assert.objEqual(down.convert(13), Position.y(13), "down");

		var descriptor = RelativePosition.right(element.top, 13);
		assert.equal(right.convert(descriptor), descriptor, "descriptor");
	});

	it("converts to string", function() {
		assertX(element.left, 10, "10px right of ", "right");
		assertX(element.left, -15, "15px left of ", "left");
		assertX(element.left, 0, "", "same right");

		assertY(element.top, 20, "20px below ", "below");
		assertY(element.top, -20, "20px above ", "above");
		assertY(element.top, 0, "", "same down");

		function assertX(edge, amount, expected, message) {
			assert.equal(RelativePosition.right(edge, amount).toString(), expected + edge.toString(), message);
		}

		function assertY(edge, amount, expected, message) {
			assert.equal(RelativePosition.down(edge, amount).toString(), expected + edge.toString(), message);
		}
	});

});