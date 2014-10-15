// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var ElementEdge = require("./element_edge.js");
var Position = require("../values/position.js");

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
		top = ElementEdge.top(one);
		right = ElementEdge.right(one);
		bottom = ElementEdge.bottom(one);
		left = ElementEdge.left(one);
	});

	it("describes itself", function() {
		assert.equal(top.description(), "top edge");
		assert.equal(left.description(), "left edge");
	});

	it("resolves itself to actual value", function() {
		assert.objEqual(top.is(), Position.y(TOP), "top");
		assert.objEqual(right.is(), Position.x(RIGHT), "right");
		assert.objEqual(bottom.is(), Position.y(BOTTOM), "bottom");
		assert.objEqual(left.is(), Position.x(LEFT), "left");
	});

	it("diffs against expected value", function() {
		assert.equal(top.diff(13), "Element '#one' top edge expected 13, but was 10px", "top");
		assert.equal(left.diff(13), "Element '#one' left edge expected 13, but was 20px", "left");
		assert.equal(top.diff(TOP), "", "no difference");
	});

	it("checks every edge", function() {
		assert.equal(top.diff(TOP), "", "top");
		assert.equal(right.diff(RIGHT), "", "right");
		assert.equal(bottom.diff(BOTTOM), "", "bottom");
		assert.equal(left.diff(LEFT), "", "left");
	});

	it("diffs against another edge", function() {
		frame.addElement("<p id='two' style='position: absolute; left: 150px; top: 10px; height: 40px;'>two</p>");
		var two = frame.getElement("#two");

		var left2 = ElementEdge.left(two);
		var top2 = ElementEdge.top(two);
		var bottom2 = ElementEdge.bottom(two);

		assert.equal(top.diff(top2), "", "no difference");

		assert.equal(
			left.diff(left2),
			"Expected left edge of element '#one' (20px) to match left edge of element '#two' (150px), " +
				"but was 130px to the left",
			"shifted left"
		);

		assert.equal(
			left2.diff(left),
			"Expected left edge of element '#two' (150px) to match left edge of element '#one' (20px), " +
				"but was 130px to the right",
			"shifted right"
		);

		assert.equal(
			bottom2.diff(top),
			"Expected bottom edge of element '#two' (50px) to match top edge of element '#one' (10px), " +
				"but was 40px higher",
			"shifted down"
		);

		assert.equal(
			top.diff(bottom2),
			"Expected top edge of element '#one' (10px) to match bottom edge of element '#two' (50px), " +
				"but was 40px lower",
			"shifted up"
		);
	});

	it("fails fast when diffing two edges that aren't comparable", function() {
		assert.exception(diffFn(top, right), /Can't compare top edge to right edge/, "top to right");
		assert.exception(diffFn(right, top), /Can't compare right edge to top edge/, "right to top");
		assert.exception(diffFn(left, bottom), /Can't compare left edge to bottom edge/, "left to bottom");
		assert.exception(diffFn(bottom, left), /Can't compare bottom edge to left edge/, "bottom to left");

		function diffFn(actual, expected) {
			return function() {
				actual.diff(expected);
			};
		}
	});

});