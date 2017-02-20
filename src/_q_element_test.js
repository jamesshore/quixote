// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var Assertable = require("./assertable.js");
var QElement = require("./q_element.js");

describe("FOUNDATION: QElement", function() {

	var TOP = 10;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	var CENTER = 85;
	var MIDDLE = 40;

	var WIDTH = 130;
	var HEIGHT = 60;

	var frame;
	var element;

	beforeEach(function() {
		frame = reset.frame;
		frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		element = frame.get("#element");
	});

	it("is Assertable", function() {
		assert.implements(element, Assertable);
	});

	describe("object", function() {

		it("compares to another QElement", function() {
			var head = new QElement(document.querySelector("head"), frame, "head");    // WORKAROUND IE8: no document.head
			var body1 = new QElement(document.body, frame, "body");
			var body2 = new QElement(document.body, frame, "body");

			assert.objEqual(body1, body2, "equality");
			assert.objNotEqual(head, body1, "inequality");
		});

		it("element description does not affect equality", function() {
			var body1 = new QElement(document.body, frame, "body description");
			var body2 = new QElement(document.body, frame, "description can be anything");

			assert.objEqual(body1, body2, "should still be equal");
		});

		it("converts to string", function() {
			var element = new QElement(document.body, frame, "nickname");
			assert.equal(element.toString(), "'nickname'");
		});

	});

	describe("DOM manipulation", function() {

		it("converts to DOM element", function() {
			var q = new QElement(document.body, frame, "body");
			var dom = q.toDomElement();

			assert.equal(dom, document.body);
		});

		it("detaches from DOM", function() {
			element.remove();
			assert.equal(frame.getAll("#element").length(), 0, "element should have been removed");
		});

		it("provides parent element", function() {
			frame.add("<div id='parent'>parent<div id='child'>child</div></div>");
			var parent = frame.get("#parent");
			var child = frame.get("#child");

			assert.objEqual(child.parent(), parent, "should provide parent");
			assert.equal(child.parent().toString(), "'parent of #child'", "should provide default nickname");
			assert.equal(child.parent("nickname").toString(), "'nickname'", "should use provided nickname");
		});
	});

	describe("properties", function() {

		it("frame", function() {
			assert.equal(element.frame, frame);
		});

		it("visibility", function() {
			assert.equal(element.rendered.diff(true), "", "rendered");
		});

		it("edges", function() {
			assert.equal(element.top.diff(TOP), "", "top");
			assert.equal(element.right.diff(RIGHT), "", "right");
			assert.equal(element.bottom.diff(BOTTOM), "", "bottom");
			assert.equal(element.left.diff(LEFT), "", "left");
		});

		it("centers", function() {
			assert.equal(element.center.diff(CENTER), "", "center");
			assert.equal(element.middle.diff(MIDDLE), "", "middle");
			assert.equal(element.center.toString(), "center of " + element, "center description");
			assert.equal(element.middle.toString(), "middle of " + element, "middle description");
		});

		it("sizes", function() {
			assert.equal(element.width.diff(WIDTH), "", "width");
			assert.equal(element.height.diff(HEIGHT), "", "height");
		});

	});

	describe("raw styles and positions", function() {

		it("retrieves raw style", function() {
			var element = frame.add("<div style='font-size: 42px'></div>");
			assert.equal(element.getRawStyle("font-size"), "42px", "raw style");
		});

		it("reports consistent results when called multiple times in a row", function() {
			// WORKAROUND Firefox 40.0.3 (ref https://bugzilla.mozilla.org/show_bug.cgi?id=1204062)
			var element = frame.add("<div style='padding-left: 20px;'></div>");

			element.getRawStyle("padding-left");
			var call2 = element.getRawStyle("padding-left");

			assert.equal(call2, "20px");
		});

		it("returns empty string when raw style doesn't exist", function() {
			var element = frame.add("<div></div>");
			assert.equal(element.getRawStyle("non-existant"), "", "non-existant style");
		});

		it("retrieves raw element position", function() {
			var element = frame.add(
				"<div style='position: absolute; left: 30px; width: 60px; top: 20px; height: 50px;'></div>"
			);
			assert.deepEqual(element.getRawPosition(), {
				left: 30,
				right: 90,
				width: 60,

				top: 20,
				bottom: 70,
				height: 50
			});
		});

	});


	describe("end-to-end", function() {

		it("handles fractions well", function() {
			frame.add(
				"<p id='golden' style='position: absolute; left: 20px; width: 162px; top: 10px; height: 100px'>golden</p>"
			);
			var goldenRect = frame.get("#golden");
			var goldenRatio = 1.6180339887;

			goldenRect.assert({
				width: goldenRect.height.times(goldenRatio)
			});
		});

		it("provides nice explanation when descriptor doesn't match a hand-coded value", function() {
			assert.equal(
				element.width.diff(60),
				"width of '#element' was 70px larger than expected.\n" +
				"  Expected: 60px\n" +
				"  But was:  130px"
			);
		});

		it("provides nice explanation when relative difference between elements", function() {
			assert.equal(
				element.width.diff(element.height),
				"width of '#element' was 70px larger than expected.\n" +
				"  Expected: 60px (height of '#element')\n" +
				"  But was:  130px"
			);
		});

		it("renders multiple differences nicely", function() {
			assert.equal(
				element.diff({
					width: element.height,
					top: 13
				}),
				"width of '#element' was 70px larger than expected.\n" +
				"  Expected: 60px (height of '#element')\n" +
				"  But was:  130px\n" +
				"top edge of '#element' was 3px higher than expected.\n" +
				"  Expected: 13px\n" +
				"  But was:  10px"
			);
		});

		it("fails nicely when invalid property is diff'd", function() {
			assert.exception(function() {
				element.diff({ XXX: "non-existant" });
			}, "'#element' doesn't have a property named 'XXX'. Did you misspell it?");
		});

		it("fails nicely when adding incompatible elements", function() {
			assert.exception(function() {
				element.width.plus(element.top).value();
			}, "Size isn't compatible with Position");
		});

		it("fails nicely when diffing incompatible elements", function() {
			assert.exception(function() {
				element.width.diff(element.top);
			}, "Can't compare width of '#element' to top edge of '#element': Size isn't compatible with Position");
		});

	});

});