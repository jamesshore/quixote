// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var PageEdge = require("./page_edge.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

describe("PageEdge", function() {

	var top;
	var right;
	var bottom;
	var left;

	beforeEach(function() {
		var frame = reset.frame;

		top = PageEdge.top(frame);
		right = PageEdge.right(frame);
		bottom = PageEdge.bottom(frame);
		left = PageEdge.left(frame);

		frame.add(
			"<div style='position: absolute; left: " + (reset.WIDTH + 100) + "px; top: " + (reset.HEIGHT + 100) + "px; " +
			"width: 100px; height: 100px; background-color: green;'>force scroll</div>"
		);
	});

	it("is a position descriptor", function() {
		assert.implements(top, PositionDescriptor);
	});

	it("values match page size", function() {
		assert.objEqual(top.value(), Position.y(0), "top");
		assert.objEqual(right.value(), Position.x(reset.WIDTH + 100 + 100), "right");
		assert.objEqual(bottom.value(), Position.y(reset.HEIGHT + 100 + 100), "bottom");
		assert.objEqual(left.value(), Position.x(0), "left");
	});

	it("converts comparison arguments", function() {
		assert.objEqual(top.convert(13, "number"), Position.y(13), "top");
		assert.objEqual(right.convert(13, "number"), Position.x(13), "right");
		assert.objEqual(bottom.convert(13, "number"), Position.y(13), "bottom");
		assert.objEqual(left.convert(13, "number"), Position.x(13), "left");
	});

	it("converts to string", function() {
		assert.equal(top.toString(), "top of page");
		assert.equal(right.toString(), "right side of page");
		assert.equal(bottom.toString(), "bottom of page");
		assert.equal(left.toString(), "left side of page");
	});

});