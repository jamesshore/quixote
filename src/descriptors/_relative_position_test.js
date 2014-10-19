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
	var x;
	var y;

	var TOP = 10;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	var WIDTH = 130;
	var HEIGHT = 60;

	var X_ADJ = -5;
	var Y_ADJ = 10;

	beforeEach(function() {
		var frame = reset.frame;
		frame.addElement(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.getElement("#element");
		x = RelativePosition.x(element.left, X_ADJ);
		y = RelativePosition.y(element.top, Y_ADJ);
	});

	it("is a descriptor", function() {
		assert.implements(x, Descriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(x.value(), Position.x(LEFT + X_ADJ), "x");
		assert.objEqual(y.value(), Position.y(TOP + Y_ADJ), "y");
	});

	it("computes value relative to a size descriptor", function() {
		x = RelativePosition.x(element.left, element.width);
		assert.objEqual(x.value(), Position.x(LEFT + WIDTH));
	});

	it("computes value relative to a relative size descriptor", function() {
		x = RelativePosition.x(element.left, element.width.plus(10));
		assert.objEqual(x.value(), Position.x(LEFT + WIDTH + 10));
	});

	it("converts arguments to comparable values", function() {
		assert.objEqual(x.convert(13), Position.x(13), "x");
		assert.objEqual(y.convert(13), Position.y(13), "y");

		var descriptor = RelativePosition.x(element.top, 13);
		assert.equal(x.convert(descriptor), descriptor, "descriptor");
	});

	it("converts to string", function() {
		assertX(element.left, 10, "10px right of ", "right");
		assertX(element.left, -15, "15px left of ", "left");
		assertX(element.left, 0, "", "same x");

		assertY(element.top, 20, "20px below ", "below");
		assertY(element.top, -20, "20px above ", "above");
		assertY(element.top, 0, "", "same y");

		function assertX(edge, amount, expected, message) {
			assert.equal(RelativePosition.x(edge, amount).toString(), expected + edge.toString(), message);
		}

		function assertY(edge, amount, expected, message) {
			assert.equal(RelativePosition.y(edge, amount).toString(), expected + edge.toString(), message);
		}
	});

});