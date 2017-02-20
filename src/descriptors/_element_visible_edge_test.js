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
		var qContainer;
		var qElement;

		var top;
		var right;
		var bottom;
		var left;

		beforeEach(function() {
			frame = reset.frame;

			qContainer = frame.add("<div>container<div id='element'>element</div></div>", "container");
			qElement = frame.get("#element");

			top = ElementVisibleEdge.top(qElement);
			right = ElementVisibleEdge.right(qElement);
			bottom = ElementVisibleEdge.bottom(qElement);
			left = ElementVisibleEdge.left(qElement);
		});

		it("is a position descriptor", function() {
			assert.implements(top, PositionDescriptor);
		});

		it("defaults to bounding box", function() {
			element("position: absolute; top: 10px; height: 20px; left: 40px; width: 80px;");

			assert.objEqual(top.value(), Position.y(10), "top");
			assert.objEqual(right.value(), Position.x(120), "right");
			assert.objEqual(bottom.value(), Position.y(30), "bottom");
			assert.objEqual(left.value(), Position.x(40), "left");
		});

		it("accounts for elements positioned completely off-screen to top", function() {
			element("position: absolute; top: -100px; height: 20px; left: 40px; width: 80px;");

			assert.objEqual(top.value(), Position.noY(), "top");
			assert.objEqual(right.value(), Position.noX(), "right");
			assert.objEqual(bottom.value(), Position.noY(), "bottom");
			assert.objEqual(left.value(), Position.noX(), "left");
		});

		it("accounts for elements positioned completely off-screen to left", function() {
			element("position: absolute; top: 10px; height: 20px; left: -400px; width: 80px;");

			assert.objEqual(top.value(), Position.noY(), "top");
			assert.objEqual(right.value(), Position.noX(), "right");
			assert.objEqual(bottom.value(), Position.noY(), "bottom");
			assert.objEqual(left.value(), Position.noX(), "left");
		});

		it("accounts for elements positioned partly off-screen", function() {
			element("position: absolute; top: -100px; height: 200px; left: -400px; width: 800px;");

			assert.objEqual(top.value(), Position.y(0), "top");
			assert.objEqual(right.value(), Position.x(400), "right");
			assert.objEqual(bottom.value(), Position.y(100), "bottom");
			assert.objEqual(left.value(), Position.x(0), "left");
		});

		it("accounts for elements using display:none", function() {
			element("display: none;");

			assert.objEqual(top.value(), Position.noY(), "top");
			assert.objEqual(right.value(), Position.noX(), "right");
			assert.objEqual(bottom.value(), Position.noY(), "bottom");
			assert.objEqual(left.value(), Position.noX(), "left");
		});

		it("accounts for elements positioned completely outside clipped parent", function() {
			container("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 50px; width: 100px;");
			assertNotVisible("position: absolute; top: -20px; height: 10px; left: 30px; width: 10px;", "outside top");
			assertNotVisible("position: absolute; top: 20px; height: 10px; left: 130px; width: 10px;", "outside right");
			assertNotVisible("position: absolute; top: 120px; height: 10px; left: 30px; width: 10px;", "outside bottom");
			assertNotVisible("position: absolute; top: 20px; height: 10px; left: -30px; width: 10px;", "outside left");
		});

		// it("accounts for parent using clipped overflow", function() {
		// 	container("overflow: hidden; position:absolute; top: 10px; height: 100px; left: 20px; width: 200px");
		// 	element("position: absolute; top: -2px; height: 400px; left: -10px; width: 800px");
		//
		// 	assert.objEqual(top.value(), Position.y(10), "top");
		// 	assert.objEqual(right.value(), Position.x(220), "right");
		// 	assert.objEqual(bottom.value(), Position.y(110), "bottom");
		// 	assert.objEqual(left.value(), Position.x(20), "left");
		// });

		it("recognizes all forms of clipped overflow");

		it("accounts for multiple uses of clipped overflow anywhere in parent hierarchy", function() {

		});

		it("ignores overflow when position is fixed");  //???

		function container(style) {
			if (style === undefined) style = "";
			qContainer.toDomElement().style.cssText = style;
		}

		function element(style) {
			if (style === undefined) style = "";
			qElement.toDomElement().style.cssText = style;
		}

		function assertNotVisible(elementStyle, message) {
			message += " - ";
			element(elementStyle);

			assert.objEqual(top.value(), Position.noY(), message + "top");
			assert.objEqual(right.value(), Position.noX(), message + "right");
			assert.objEqual(bottom.value(), Position.noY(), message + "bottom");
			assert.objEqual(left.value(), Position.noX(), message + "left");
		}

	});

}());