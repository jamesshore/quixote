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

});