// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var ElementEdge = require("./element_edge.js");
var Position = require("../values/position.js");
var ElementPosition = require("./element_position.js");

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

	it("resolves itself to actual value", function() {
		assert.objEqual(top.value(), Position.y(TOP), "top");
		assert.objEqual(right.value(), Position.x(RIGHT), "right");
		assert.objEqual(bottom.value(), Position.y(BOTTOM), "bottom");
		assert.objEqual(left.value(), Position.x(LEFT), "left");
	});

	it("describes itself", function() {
		assert.equal(top.description(), "top edge");
		assert.equal(left.description(), "left edge");
	});

	it("converts to string", function() {
		assert.equal(top.toString(), "top edge of element '#one'", "description + element");
		assert.equal(top.toString(top.value()), "top edge of element '#one' (10px)", "description + element + value");
	});

	it("describes match", function() {
		assert.equal(top.describeMatch(), "match top edge of element '#one' (10px)");
	});

	it("diffs against expected value", function() {
		assert.equal(top.diff(13), "Expected top edge of element '#one' (10px) to be 13px, but was 3px lower", "top");
		assert.equal(top.diff(TOP), "", "no difference");
	});

	it("diffs against another edge", function() {
		frame.addElement("<p id='two' style='position: absolute; left: 150px; top: 10px; height: 40px;'>two</p>");
		var two = frame.getElement("#two");

		var left2 = ElementEdge.left(two);
		var top2 = ElementEdge.top(two);

		assert.equal(top.diff(top2), "", "no difference");
		assert.equal(
			left.diff(left2),
			"Expected left edge of element '#one' (20px) to match left edge of element '#two' (150px), " +
				"but was 130px to the left",
			"difference"
		);
	});

	it("fails fast when diffing two edges that aren't comparable", function() {
		assert.exception(diffFn(top, right), /Can't compare X dimension to Y dimension/);

		function diffFn(actual, expected) {
			return function() {
				actual.diff(expected);
			};
		}
	});

//	it("can be shifted up or to the right", function() {
//		var descriptor = top.plus(10);
//		assert.type(descriptor, ElementPosition);
//
//		/* TODO: what about negative values? */
//	});

});