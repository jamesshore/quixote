// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var ViewportEdge = require("./viewport_edge.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

describe("ViewportEdge", function() {

	var WIDTH = reset.WIDTH;
	var HEIGHT = reset.HEIGHT;

	var frame;
	var bodyStyle;
	var top;
	var right;
	var bottom;
	var left;

	beforeEach(function() {
		frame = reset.frame;

		top = ViewportEdge.top(frame);
		right = ViewportEdge.right(frame);
		bottom = ViewportEdge.bottom(frame);
		left = ViewportEdge.left(frame);

		bodyStyle = frame.toDomElement().contentDocument.body.style;
		bodyStyle.backgroundColor = "blue";
	});

	afterEach(function() {
		if (reset.DEBUG) return;
		bodyStyle.backgroundColor = "";
	});

	it("is a descriptor", function() {
		assert.implements(top, Descriptor);
	});

	it("values match viewport size", function() {
		assert.objEqual(left.value(), Position.x(0), "left");
		assert.objEqual(top.value(), Position.y(0), "top");

		assert.objEqual(right.value(), Position.x(WIDTH), "right");
		assert.objEqual(bottom.value(), Position.y(HEIGHT), "bottom");
	});

	it("values account for scrolling", function() {
		if (!quixote.browser.canScroll()) return;

		frame.add(
			"<div style='position: absolute; left: " + (WIDTH + 100) + "px; top: " + (HEIGHT + 100) + "px; " +
			"width: 100px; height: 100px; background-color: green'>make scrollable</div>"
		);
		frame.scroll(10, 20);

		assert.objEqual(left.value(), Position.x(10), "left");
		assert.objEqual(top.value(), Position.y(20), "top");

		assert.objEqual(right.value(), Position.x(10).plus(frame.viewport().width.value()), "right");
		assert.objEqual(bottom.value(), Position.y(20).plus(frame.viewport().height.value()), "bottom");
	});

	it("converts comparison arguments", function() {
		assert.objEqual(top.convert(13, "number"), Position.y(13), "top");
		assert.objEqual(right.convert(13, "number"), Position.x(13), "right");
		assert.objEqual(bottom.convert(13, "number"), Position.y(13), "bottom");
		assert.objEqual(left.convert(13, "number"), Position.x(13), "left");
	});

	it("converts to string", function() {
		assert.equal(top.toString(), "top edge of viewport");
		assert.equal(right.toString(), "right edge of viewport");
		assert.equal(bottom.toString(), "bottom edge of viewport");
		assert.equal(left.toString(), "left edge of viewport");
	});

	//it("can be arithmaticated", function() {
	//	assert.objEqual(width.plus(10).value(), Size.create(WIDTH + 10), "bigger");
	//	assert.objEqual(width.minus(10).value(), Size.create(WIDTH - 10), "smaller");
	//	assert.objEqual(width.times(3).value(), Size.create(WIDTH * 3), "multiplied");
	//});

	it("works end-to-end with fixed-position element");

});