// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../util/assert.js");
	var reset = require("../__reset.js");
	var ElementVisibleEdge = require("./element_visible_edge.js");
	var PositionDescriptor = require("./position_descriptor.js");
	var Position = require("../values/position.js");

	describe("DESCRIPTOR: ElementVisibleEdge", function() {

		var frame;

		var top;
		var right;
		var bottom;
		var left;

		beforeEach(function() {
			frame = reset.frame;
		});

		it("is a position descriptor", function() {
			element();
			assert.implements(top, PositionDescriptor);
		});

		it("defaults to bounding box", function() {
			element("position: absolute; top: 10px; height: 20px; left: 40px; width: 80px");

			assert.objEqual(top.value(), Position.y(10), "top");
			assert.objEqual(right.value(), Position.x(120), "right");
			assert.objEqual(bottom.value(), Position.y(30), "bottom");
			assert.objEqual(left.value(), Position.x(40), "left");
		});

		it("accounts for elements positioned completely off-screen to top", function() {
			element("position: absolute; top: -100px; height: 20px; left: 40px; width: 80px");

			assert.objEqual(top.value(), Position.noY(), "top");
			assert.objEqual(right.value(), Position.noX(), "right");
			assert.objEqual(bottom.value(), Position.noY(), "bottom");
			assert.objEqual(left.value(), Position.noX(), "left");
		});

		it("accounts for elements positioned completely off-screen to left", function() {
			element("position: absolute; top: 10px; height: 20px; left: -400px; width: 80px");

			assert.objEqual(top.value(), Position.noY(), "top");
			assert.objEqual(right.value(), Position.noX(), "right");
			assert.objEqual(bottom.value(), Position.noY(), "bottom");
			assert.objEqual(left.value(), Position.noX(), "left");
		});

		it("accounts for elements positioned partly off-screen", function() {
			element("position: absolute; top: -100px; height: 200px; left: -400px; width: 800px");

			assert.objEqual(top.value(), Position.y(0), "top");
			assert.objEqual(right.value(), Position.x(400), "right");
			assert.objEqual(bottom.value(), Position.y(100), "bottom");
			assert.objEqual(left.value(), Position.x(0), "left");
		});

		function element(style) {
			if (style === undefined) style = "";

			var element = frame.add("<div style='" + style + "'>element</div>", "element");
			top = ElementVisibleEdge.top(element);
			right = ElementVisibleEdge.right(element);
			bottom = ElementVisibleEdge.bottom(element);
			left = ElementVisibleEdge.left(element);

			return element;
		}

	});

}());