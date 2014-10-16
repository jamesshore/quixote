// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var ElementPosition = require("./element_position.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");

describe("ElementPosition", function() {

	var frame;
	var one;
	var x;
	var y;

	var X = 15;
	var Y = 20;

	before(function(done) {
		frame = quixote.createFrame(500, 500, { stylesheet: "/base/src/__reset.css" }, done);
	});

	after(function() {
		frame.remove();
	});

	beforeEach(function() {
		frame.reset();
		frame.addElement(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		one = frame.getElement("#one");
		x = ElementPosition.x(one.left, -5);
		y = ElementPosition.y(one.top, 10);
	});

	it("is a descriptor", function() {
		assert.type(x, Descriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(x.value(), Position.x(15), "x");
		assert.objEqual(y.value(), Position.y(20), "y");
	});

	it("converts arguments to comparable values", function() {
		assert.objEqual(x.convert(13), Position.x(13), "x");
		assert.objEqual(y.convert(13), Position.y(13), "y");

		var descriptor = ElementPosition.x(one.top, 13);
		assert.equal(x.convert(descriptor), descriptor, "descriptor");
	});

	it("converts to string", function() {
		assertX(one.left, 10, "10px right of ", "right");
		assertX(one.left, -15, "15px left of ", "left");
		assertX(one.left, 0, "", "same x");

		assertY(one.top, 20, "20px below ", "below");
		assertY(one.top, -20, "20px above ", "above");
		assertY(one.top, 0, "", "same y");

		function assertX(edge, amount, expected, message) {
			assert.equal(ElementPosition.x(edge, amount).toString(), expected + edge.toString(), message);
		}

		function assertY(edge, amount, expected, message) {
			assert.equal(ElementPosition.y(edge, amount).toString(), expected + edge.toString(), message);
		}
	});

	it("describes match", function() {
		assert.equal(y.describeMatch(), "be 10px below top edge of element '#one' (20px)");
	});

});