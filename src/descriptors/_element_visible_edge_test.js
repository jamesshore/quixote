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
			assertVisible(
				"position: absolute; top: 10px; height: 20px; left: 40px; width: 80px;",
				10, 120, 30, 40
			);
		});

		it("accounts for elements positioned completely off-screen", function() {
			assertNotVisible("position: absolute; top: -100px; height: 20px; left: 40px; width: 80px;", "outside top");
			assertNotVisible("position: absolute; top: 10px; height: 20px; left: -400px; width: 80px;", "outside left");
			// it's not possible to position off-screen to right or bottom--the page always expands to fit
		});

		it("accounts for elements positioned partly off-screen", function() {
			assertVisible(
				"position: absolute; top: -100px; height: 200px; left: -400px; width: 800px;",
				0, 400, 100, 0
			);
		});

		it("accounts for elements using display:none", function() {
			assertNotVisible("display: none;");
		});

		it("accounts for elements positioned completely outside overflow-clipped parent", function() {
			container("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 50px; width: 100px;");
			assertNotVisible("position: absolute; top: -20px; height: 10px; left: 30px; width: 10px;", "outside top");
			assertNotVisible("position: absolute; top: 20px; height: 10px; left: 130px; width: 10px;", "outside right");
			assertNotVisible("position: absolute; top: 120px; height: 10px; left: 30px; width: 10px;", "outside bottom");
			assertNotVisible("position: absolute; top: 20px; height: 10px; left: -30px; width: 10px;", "outside left");
		});

		it("accounts for elements partially clipped by overflow parent", function() {
			container("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 60px; width: 100px;");
			assertVisible(
				"position: absolute; top: -10px; height: 100px; left: -30px; width: 100px;",
				50, 130, 140, 60,
				"clipped on top left"
			);
			assertVisible(
				"position: absolute; top: 10px; height: 100px; left: 30px; width: 100px;",
				60, 160, 150, 90,
				"clipped on bottom right"
			);
			assertVisible(
				"position: absolute; top: -10px; height: 200px; left: -30px; width: 200px;",
				50, 160, 150, 60,
				"clipped on all sides"
			);
		});

		it("recognizes all forms of clipped overflow", function() {
			test("overflow: hidden;");
			test("overflow: scroll;");
			test("overflow: auto;");

			function test(overflowStyle) {
				container(overflowStyle + " position: absolute; top: 50px; height: 100px; left: 50px; width: 100px;");
				assertNotVisible("position:absolute; top: -20px; height: 10px");
			}
		});

		it("accounts for clipped overflow anywhere in parent hierarchy");

		it("accounts for multiple uses of clipped overflow");

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
			message = message ? message + " - " : "";
			element(elementStyle);

			assert.objEqual(top.value(), Position.noY(), message + "top");
			assert.objEqual(right.value(), Position.noX(), message + "right");
			assert.objEqual(bottom.value(), Position.noY(), message + "bottom");
			assert.objEqual(left.value(), Position.noX(), message + "left");
		}

		function assertVisible(elementStyle, expectedTop, expectedRight, expectedBottom, expectedLeft, message) {
			message = message ? message + " - " : "";
			element(elementStyle);

			assert.objEqual(top.value(), Position.y(expectedTop), message + "top");
			assert.objEqual(right.value(), Position.x(expectedRight), message + "right");
			assert.objEqual(bottom.value(), Position.y(expectedBottom), message + "bottom");
			assert.objEqual(left.value(), Position.x(expectedLeft), message + "left");
		}

	});

}());