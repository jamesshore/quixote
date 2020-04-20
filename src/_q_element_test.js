// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var quixote = require("./quixote.js");
var reset = require("./__reset.js");
var shim = require("./util/shim.js");
var Assertable = require("./assertable.js");
var BrowsingContext = require("./browsing_context.js");
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


	describe("creation", function() {

		it("uses provided nickname", function() {
			var element = create("<div></div>", "my nickname");
			assert.equal(element.toString(), "'my nickname'");
		});

		it("uses element ID if no nickname provided", function() {
			var element = create("<div id='myId'></div>");
			assert.equal(element.toString(), "'#myId'");
		});

		it("uses class names if no nickname or ID", function() {
			var oneClass = create("<div class='myClass'></div>");
			assert.equal(oneClass.toString(), "'.myClass'", "one class");

			var manyClasses = create("<div class='one two three'></div>");
			assert.equal(manyClasses.toString(), "'.one.two.three'", "multiple classes");

			var lotsOfWhitespace = create("<div class='one  \t \n two'></div>");
			assert.equal(lotsOfWhitespace.toString(), "'.one.two'", "lots of whitespace");
		});

		it("uses tag name if nothing else works", function() {
			var element = create("<blockquote></blockquote>");
			assert.equal(element.toString(), "'<blockquote>'");
		});

		function create(html, nickname) {
			return QElement.create(frame.add(html).toDomElement(), nickname);
		}

	});


	describe("object", function() {

		it("compares to another QElement", function() {
			var head = new QElement(document.querySelector("head"), "head");    // WORKAROUND IE 8: no document.head
			var body1 = new QElement(document.body, "body");
			var body2 = new QElement(document.body, "body");

			assert.objEqual(body1, body2, "equality");
			assert.objNotEqual(head, body1, "inequality");
		});

		it("element nickname does not affect equality", function() {
			var body1 = new QElement(document.body, "body nickname");
			var body2 = new QElement(document.body, "nickname can be anything");

			assert.objEqual(body1, body2, "should still be equal");
		});

		it("converts to string based on nickname", function() {
			var element = new QElement(document.body, "nickname");
			assert.equal(element.toString(), "'nickname'");
		});

	});


	describe("DOM manipulation", function() {

		it("converts to DOM element", function() {
			var q = new QElement(document.body, "body");
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
			assert.equal(child.parent().toString(), "'#parent'", "should generate default nickname");
			assert.equal(child.parent("nickname").toString(), "'nickname'", "should use provided nickname");
		});

		it("parent element of body is 'null'", function() {
			assert.equal(frame.body().parent(), null);
		});

		it("parent element of detached element is 'null'", function() {
			element.remove();
			assert.equal(element.parent(), null);
		});

		it("provides access to its host", function() {
			var body = new QElement(document.body, "body");
			var browsingContext = new BrowsingContext(document);

			assert.objEqual(body.context(), browsingContext);
		});

		it("host of detached element is still the original host", function() {
			element.remove();
			assert.objEqual(element.context(), frame.toBrowsingContext());
		});

		it("adds child element", function() {
			var child = element.add("<div>child</div>");
			assert.objEqual(child.parent(), element, "child should have been added");
			assert.equal(
				// WORKAROUND IE 8 - IE 8 provides uppercase tagnames and adds whitespace
				shim.String.trim(child.toDomElement().outerHTML.toLowerCase()),
				"<div>child</div>",
				"child HTML should have been set"
			);
			assert.equal(child.toString(), "'<div>'", "default nickname");
		});

		it("doesn't choke on leading/trailing whitespace in html passed to .add()", function() {
			var htmlWithWhitespace = "  \n  <p>foo</p>  \n  ";
			element.add(htmlWithWhitespace);
			// should not throw exception
		});

		it("uses optional nickname to describe added elements", function() {
			var child = element.add("<p>child</p>", "my element");
			assert.equal(child.toString(), "'my element'");
		});

		it("fails fast if adding more than one element at a time", function() {
			assert.exception(function() {
				element.add("<p>foo</p><div>bar</div>");
			}, /Expected one element, but got 2 \(<p>foo<\/p><div>bar<\/div>\)/);
		});

		it("knows if it contains an element", function() {
			var child = element.add("<div>child</div>");
			var grandchild = element.add("<div>grandchild</div>");

			assert.equal(element.contains(child), true, "child");
			assert.equal(element.contains(grandchild), true, "grandchild");

			child.remove();
			assert.equal(element.contains(child), false, "removed child");
		});

	});


	describe("properties", function() {
		it("visibility", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			assert.equal(element.render.diff(true), "", "rendered");
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
			assert.equal(element.width.toString(), "width of " + element, "width description");
			assert.equal(element.height.toString(), "height of " + element, "height description");
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


	describe("pixel calculation", function() {

		var IRRELEVANT_SIZE = "1px";

		it("converts size strings (such as '10em') to pixel values", function() {
			assert.equal(element('font-size: 15px;').calculatePixelValue("10em"), 150);
		});

		it("supports negative values", function() {
			assert.equal(element('font-size: 15px;').calculatePixelValue("-10em"), -150);
		});

		it("works with non-integer results", function() {
			var expected = 7.5;
			if (quixote.browser.roundsOffPixelCalculations()) expected = 8;

			assert.equal(element('font-size: 15px;').calculatePixelValue("0.5em"), expected);
		});

		it("doesn't destroy 'position' style", function() {
			var el = element("position: relative;");
			el.calculatePixelValue(IRRELEVANT_SIZE);
			assert.equal(el.getRawStyle("position"), "relative");
		});

		it("doesn't destroy 'left' style", function() {
			var el = element("position: absolute; width: 100px");
			el.calculatePixelValue(IRRELEVANT_SIZE);
			assert.equal(el.getRawStyle("width"), "100px");
		});

		function element(styles) {
			return frame.add("<div style='" + styles + "'></div>");
		}

	});


});