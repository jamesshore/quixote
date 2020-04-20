// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var ElementRenderEdge = require("./element_render_edge.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

describe("DESCRIPTOR: ElementRenderEdge", function() {

	var frame;
	var qGrandparent;
	var qParent;
	var qElement;

	var top;
	var right;
	var bottom;
	var left;

	beforeEach(function() {
		frame = reset.frame;

		qGrandparent = frame.add("<div>grandparent</div>", "grandparent");
		qParent = qGrandparent.add("<div>intermediate element</div>").add("<div>parent</div>", "parent");
		qElement = qParent.add("<div>element</div>", "element");

		top = ElementRenderEdge.top(qElement);
		right = ElementRenderEdge.right(qElement);
		bottom = ElementRenderEdge.bottom(qElement);
		left = ElementRenderEdge.left(qElement);
	});

	it("is a position descriptor", function() {
		assert.implements(top, PositionDescriptor);
	});

	it("converts to string", function() {
		assertDesc(qElement, top, "top rendered edge of ", "top");
		assertDesc(qElement, right, "right rendered edge of ", "right");
		assertDesc(qElement, bottom, "bottom rendered edge of ", "bottom");
		assertDesc(qElement, left, "left rendered edge of ", "left");

		function assertDesc(element, edge, expected, message) {
			assert.equal(edge.toString(), expected + element, message);
		}
	});

	it("has assertions", function() {
		if (quixote.browser.misreportsClipAutoProperty()) return;

		assert.exception(
			function() { left.should.equal(30); },
			"left rendered edge of 'element' should be 30px to right.\n" +
			"  Expected: 30px\n" +
			"  But was:  0px"
		);
	});

	it("defaults to bounding box", function() {
		if (quixote.browser.misreportsClipAutoProperty()) return;

		assertRendered(
			"position: absolute; top: 10px; height: 20px; left: 40px; width: 80px;",
			10, 120, 30, 40
		);
	});

	it("accounts for elements positioned completely off-screen", function() {
		if (quixote.browser.misreportsClipAutoProperty()) return;

		assertNotRendered("position: absolute; top: -100px; height: 20px; left: 40px; width: 80px;", "outside top");
		assertNotRendered("position: absolute; top: 10px; height: 20px; left: -400px; width: 80px;", "outside left");
		// it's not possible to position off-screen to right or bottom--the page always expands to fit
	});

	it("accounts for elements positioned partly off-screen", function() {
		if (quixote.browser.misreportsClipAutoProperty()) return;

		assertRendered(
			"position: absolute; top: -100px; height: 200px; left: -400px; width: 800px;",
			0, 400, 100, 0
		);
	});

	it("accounts for elements with zero width or height", function() {
		assertNotRendered("position: absolute; top: 10px; height: 0px; left: 10px; width: 10px;", "zero height");
		assertNotRendered("position: absolute; top: 10px; height: 10px; left: 10px; width: 0px;", "zero width");
	});

	it("accounts for elements using display:none", function() {
		assertNotRendered("display: none;");
	});

	it("accounts for detached elements", function() {
		qElement.remove();
		assertNotRendered("position: absolute; top: 10px; height: 10px; left: 10px; width: 10px;");
	});


	describe("clip-path CSS property", function() {

		var EXPECTED_FAIL_FAST_MESSAGE = "Can't determine element rendering because the element is affected by the " +
			"'clip-path' property, which Quixote doesn't support.";

		it("fails fast when used in element", function() {
			element("clip-path: url('#something');");
			if (!browserSupportsClipPath()) return;

			assert.exception(function() { top.value(); }, EXPECTED_FAIL_FAST_MESSAGE);
		});

		it("fails fast when used anywhere in parent hierarchy", function() {
			grandparent("clip-path: url('#something');");
			if (!browserSupportsClipPath()) return;

			assert.exception(function() { top.value(); }, EXPECTED_FAIL_FAST_MESSAGE);
		});

		function browserSupportsClipPath() {
			var clipPath = qElement.getRawStyle("clip-path");
			return (clipPath !== "" && clipPath !== "none");
		}

	});


	describe("overflow CSS property", function() {

		it("accounts for elements positioned completely outside overflow-clipped parent", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			parent("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 50px; width: 100px;");
			assertNotRendered("position: absolute; top: -20px; height: 10px; left: 30px; width: 10px;", "outside top");
			assertNotRendered("position: absolute; top: 20px; height: 10px; left: 130px; width: 10px;", "outside right");
			assertNotRendered("position: absolute; top: 120px; height: 10px; left: 30px; width: 10px;", "outside bottom");
			assertNotRendered("position: absolute; top: 20px; height: 10px; left: -30px; width: 10px;", "outside left");
		});

		it("accounts for elements partially clipped by overflow parent", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			parent("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 60px; width: 100px;");
			assertRendered(
				"position: absolute; top: -10px; height: 100px; left: -30px; width: 100px;",
				50, 130, 140, 60,
				"clipped on top left"
			);
			assertRendered(
				"position: absolute; top: 10px; height: 100px; left: 30px; width: 100px;",
				60, 160, 150, 90,
				"clipped on bottom right"
			);
			assertRendered(
				"position: absolute; top: -10px; height: 200px; left: -30px; width: 200px;",
				50, 160, 150, 60,
				"clipped on all sides"
			);
		});

		it("accounts for parents that have zero width or height", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			parent("overflow: hidden; position: absolute; top: 10px; height: 0px; left: 10px; width: 100px;");
			assertNotRendered("", "zero height");

			parent("overflow: hidden; position: absolute; top: 10px; height: 100px; left: 10px; width: 0px;");
			assertNotRendered("", "zero width");
		});

		it("recognizes all forms of clipped overflow", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			test("overflow: hidden;");
			test("overflow: scroll;");
			test("overflow: auto;");

			function test(overflowStyle) {
				parent(overflowStyle + " position: absolute; top: 50px; height: 100px; left: 50px; width: 100px;");
				assertNotRendered("position: absolute; top: -20px; height: 10px;");
			}
		});

		it("accounts for different X and Y overflow settings", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			parent("overflow-x: visible; overflow-y: hidden; position: absolute; top: 50px; height: 100px; left: 60px; width: 100px; background-color: red;");
			assertRendered(
				"position: absolute; top: -10px; height: 200px; left: -10px; width: 200px; background-color: blue",
				50, 160, 150, 60,
				"clips on all sides despite `overflow-x: visible` (spec says it is set to 'auto')"
			);
			parent("overflow-x: hidden; overflow-y: visible; position: absolute; top: 50px; height: 100px; left: 60px; width: 100px; background-color: red;");
			assertRendered(
				"position: absolute; top: -10px; height: 200px; left: -10px; width: 200px; background-color: blue",
				50, 160, 150, 60,
				"clips on all sides despite `overflow-y: visible` (spec says it is set to 'auto')"
			);
		});

		it("does not crash when compound 'overflow' parameter used (but results correctly vary by browser)", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			parent("overflow: hidden visible");
			assert.noException(
				function() { top.value(); }
			);
		});

		it("accounts for clipped overflow anywhere in parent hierarchy", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			grandparent("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 50px; width: 100px;");
			assertNotRendered("position:absolute; top: -20px; height: 10px;");
		});

		it("accounts for multiple uses of clipped overflow", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			grandparent("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 50px; width: 100px;");
			parent("overflow: hidden; position: absolute; top: 20px; height: 100px; left: 40px; width: 100px;");
			assertRendered(
				"position:absolute; top: -10px; height: 200px; left: -20px; width: 200px;",
				70, 150, 150, 90
			);
		});

		it("ignores overflow when position is fixed", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			parent("overflow: hidden; position: absolute; top: 50px; height: 100px; left: 40px; width: 100px;");
			assertRendered(
				"position:fixed; top: 10px; height: 10px; left: 15px; width: 10px;",
				10, 25, 20, 15
			);
		});

	});


	describe("clip CSS property", function() {

		describe("on an element", function() {

			it("accounts for `clip:auto` (which means 'no clipping')", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;

				assertRendered(
					"position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; clip: auto;",
					50, 140, 150, 40
				);
			});

			it("fails fast when browser can't detect 'clip: auto' property", function() {
				if (!quixote.browser.misreportsClipAutoProperty()) return;

				element("position: absolute; clip: auto");
				assert.exception(function() {
					top.value();
				}, "Can't determine element rendering on this browser because it misreports the value of the " +
					"`clip: auto` property. You can use `quixote.browser.misreportsClipAutoProperty()` to skip this browser.");
			});

			it("fails fast when browser can't compute individual clip properties", function() {
				if (!quixote.browser.misreportsAutoValuesInClipProperty()) return;

				element("position: absolute; clip: rect(auto, auto, auto, auto);");
				assert.exception(function() {
					top.value();
				}, "Can't determine element rendering on this browser because it misreports the value of the `clip`" +
					" property. You can use `quixote.browser.misreportsAutoValuesInClipProperty()` to skip this browser.");
			});

			it("accounts for pixel values in clip property", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertRendered(
					"position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; clip: rect(10px, 30px, 25px, 15px);",
					60, 70, 75, 55
				);
			});

			it("treats 'auto' values as equivalent to element edge", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertRendered(
					"position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; clip: rect(auto, auto, auto, auto);",
					50, 140, 150, 40
				);
			});

			it("clips element out of existence when clip values are the same or nonsensical", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				var style = "position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; ";

				assertNotRendered(style + " clip: rect(10px, auto, 10px, auto);", "same top and bottom");
				assertNotRendered(style + " clip: rect(auto, 10px, auto, 10px);", "same left and right");
				assertNotRendered(style + " clip: rect(10px, auto, 5px, auto);", "bottom higher than top");
				assertNotRendered(style + " clip: rect(auto, 5px, auto, 10px);", "right less than left");
			});

			it("handles negative clip values", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				var style = "position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; ";

				assertRendered(
					style + " clip: rect(-10px, auto, auto, auto)",
					50, 140, 150, 40, "negative top"
				);
				assertNotRendered(style + " clip: rect(auto, -10px, auto, auto)", "negative right");
				assertNotRendered(style + " clip: rect(auto, auto, -10px, auto)", "negative bottom");
				assertRendered(
					style + " clip: rect(auto, auto, auto, -10px)",
					50, 140, 150, 40, "negative left"
				);
			});

			it("handles fractional clip values", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertRendered("position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; " +
					"clip: rect(10.9px, 9.1px, 30.3px, 4.6px);",
					60.9, 49.1, 80.3, 44.6
				);
			});

			it("handles non-pixel values in clip property", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertRendered(
					"position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; clip: rect(1em, 2em, 2em, 1em);",
					66, 72, 82, 56
				);
			});

			it("doesn't clip padding", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertRendered(
					"position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; " +
					"clip: rect(auto, auto, auto, auto); padding: 10px 10px 10px 10px;",
					50, 160, 170, 40
				);
			});

			it("doesn't clip border", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertRendered(
					"position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; " +
					"clip: rect(auto, auto, auto, auto); border: 10px solid black;",
					50, 160, 170, 40
				);
			});

			it("doesn't clip margin", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertRendered(
					"position: absolute; top: 50px; height: 100px; left: 40px; width: 100px; " +
					"clip: rect(auto, auto, auto, auto); margin: 10px 10px 10px 10px;",
					60, 150, 160, 50
				);
			});

			it("only applies when position is 'absolute' or 'fixed'", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				assertClip("position: absolute;");
				assertClip("position: fixed;");
				assertNoClip("position: static;");
				assertNoClip("position: relative;");
				assertNoClip("position: sticky;");

				function assertClip(positionStyle) {
					assertNotRendered(positionStyle + " clip: rect(0px, 0px, 0px, 0px);", positionStyle);
				}

				function assertNoClip(positionStyle) {
					element(positionStyle + " clip: rect(0px, 0px, 0px, 0px);");
					assert.equal(top.value().equals(Position.noY()), false, "clipping when '" + positionStyle + "'");
				}
			});

		});

		describe("on ancestor elements", function() {

			var tenPxParent = "position: absolute; top: 100px; height: 10px; left: 100px; width: 10px; ";
			var hundredPxChild = "position: absolute; top: -50px; height: 100px; left: -50px; width: 100px; ";

			it("clips children when ancestor is clipped", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				parent(tenPxParent + "clip: rect(1px, 4px, 3px, 2px);");
				assertRendered(hundredPxChild, 101, 104, 103, 102);
			});

			it("clips children when multiple ancestors are clipped", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				grandparent(tenPxParent + "clip: rect(1px, auto, 3px, auto);");
				parent("position: absolute; top: 0px; height: 100px; left: 0px; width: 100px; " +
					"clip: rect(auto, 4px, auto, 2px);");
				assertRendered(hundredPxChild, 101, 104, 103, 102);
			});

			it("applies both element's 'clip' and ancestor's 'clip'", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				parent(tenPxParent + "clip: rect(1px, auto, 3px, auto);");
				assertRendered(hundredPxChild + "clip: rect(auto, 54px, auto, 52px);", 101, 104, 103, 102);
			});

			it("doesn't clip children when ancestor uses 'clip: auto'", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;

				parent(tenPxParent + "clip: auto;");
				assertRendered(hundredPxChild, 50, 150, 150, 50);
			});

			it("clips children to edges of ancestor when ancestor uses 'clip: rect(auto, auto, auto, auto)'", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				parent(tenPxParent + "clip: rect(auto, auto, auto, auto)");
				assertRendered(hundredPxChild, 100, 110, 110, 100);
			});

			it("clips children above and to left of ancestor when ancestor uses negative clip values", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				parent(tenPxParent + "clip: rect(-10px, -8px, -5px, -18px);");
				assertRendered(hundredPxChild, 100 - 10, 100 - 8, 100 - 5, 100 - 18);
			});

			it("clips children even when they have 'position: fixed' property", function() {
				if (quixote.browser.misreportsClipAutoProperty()) return;
				if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

				parent(tenPxParent + "clip: rect(auto, auto, auto, auto);");
				assertRendered(
					"position: fixed; top: 0px; height: 105px; left: 107px; width: 100px;",
					100, 110, 105, 107
				);
			});

		});
	});


	it("applies overflow and clip together", function() {
		if (quixote.browser.misreportsClipAutoProperty()) return;
		if (quixote.browser.misreportsAutoValuesInClipProperty()) return;

		parent(
			"overflow: hidden; " +
			"clip: rect(auto, 5px, auto, auto); " +
			"position: absolute; " +
			"top: 50px; height: 100px; left: 60px; width: 100px;"
		);
		assertRendered(
			"position: absolute; top: -10px; height: 100px; left: -30px; width: 100px;",
			50, 65, 140, 60
		);
	});


	function grandparent(style) {
		if (style === undefined) style = "";
		qGrandparent.toDomElement().style.cssText = style;
	}

	function parent(style) {
		if (style === undefined) style = "";
		qParent.toDomElement().style.cssText = style;
	}

	function element(style) {
		if (style === undefined) style = "";
		qElement.toDomElement().style.cssText = style;
	}

	function assertNotRendered(elementStyle, message) {
		message = message ? message + " - " : "";
		element(elementStyle);

		assert.objEqual(top.value(), Position.noY(), message + "top");
		assert.objEqual(right.value(), Position.noX(), message + "right");
		assert.objEqual(bottom.value(), Position.noY(), message + "bottom");
		assert.objEqual(left.value(), Position.noX(), message + "left");
	}

	function assertRendered(elementStyle, expectedTop, expectedRight, expectedBottom, expectedLeft, message) {
		message = message ? message + " - " : "";
		element(elementStyle);

		assert.objEqual(top.value(), Position.y(expectedTop), message + "top");
		assert.objEqual(right.value(), Position.x(expectedRight), message + "right");
		assert.objEqual(bottom.value(), Position.y(expectedBottom), message + "bottom");
		assert.objEqual(left.value(), Position.x(expectedLeft), message + "left");
	}

});
