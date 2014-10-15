// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var ElementPosition = require("./element_position.js");
var Position = require("../values/position.js");

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

	it("resolves to value", function() {
		assert.objEqual(x.value(), Position.x(15), "x");
		assert.objEqual(y.value(), Position.y(20), "y");
	});

	it("describes itself", function() {
		assert.equal(descriptionX(one.left, 10), "10px right of left edge", "right");
		assert.equal(descriptionX(one.left, -15), "15px left of left edge", "left");
		assert.equal(descriptionX(one.left, 0), "left edge", "same x");

		assert.equal(descriptionY(one.top, 20), "20px below top edge", "below");
		assert.equal(descriptionY(one.top, -20), "20px above top edge", "above");
		assert.equal(descriptionY(one.top, 0), "top edge", "same y");

		function descriptionX(edge, amount) {
			return ElementPosition.x(edge, amount).description();
		}

		function descriptionY(edge, amount) {
			return ElementPosition.y(edge, amount).description();
		}
	});

	it("converts to string", function() {
		assert.equal(y.toString(), "10px below top edge of element '#one'");
	});

	it("describes match", function() {
		assert.equal(y.describeMatch(), "be 10px below top edge of element '#one' (20px)");
	});

	it("diffs against expected value", function() {
		assert.equal(x.diff(15), "", "no difference");
		assert.equal(x.diff(19), "Expected 5px left of left edge of element '#one' (15px) to be 19px, but was 4px to the left", "x difference");
		assert.equal(y.diff(23), "Expected 10px below top edge of element '#one' (20px) to be 23px, but was 3px lower", "y difference");
	});

	it("diffs against other positions", function() {
		assert.equal(
			x.diff(ElementPosition.x(one.right, -10)),
			"Expected 5px left of left edge of element '#one' (15px) to be 10px left of right edge of element '#one' (140px), but was 125px to the left");
	});


});