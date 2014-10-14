// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Frame = require("./frame.js");
var QElement = require("./q_element.js");

describe("QElement", function() {

	var frame;

	before(function(done) {
		Frame.create(window.document.body, 800, 1000, { stylesheet: "/base/src/__reset.css" }, function(theFrame) {
			frame = theFrame;
			done();
		});
	});

	after(function() {
		frame.remove();
	});

	afterEach(function() {
		frame.reset();
	});

	describe("object", function() {
		it("converts to DOM element", function() {
			var q = new QElement(document.body, "body");
			var dom = q.toDomElement();

			assert.equal(dom, document.body);
		});

		it("has a description", function() {
			var element = new QElement(document.body, "description");
			assert.equal(element.description(), "description");
		});

		it("compares to another QElement", function() {
			var head = new QElement(document.querySelector("head"), "head");    // WORKAROUND IE8: no document.head
			var body1 = new QElement(document.body, "body");
			var body2 = new QElement(document.body, "body");

			assert.objEqual(body1, body2, "equality");
			assert.objNotEqual(head, body1, "inequality");
		});

		it("element description does not affect equality", function() {
			var body1 = new QElement(document.body, "body description");
			var body2 = new QElement(document.body, "description can be anything");

			assert.objEqual(body1, body2, "should still be equal");
		});

		it("displays nicely as a string", function() {
			var element = document.createElement("div");
			element.setAttribute("baz", "quux");
			element.innerHTML = "foo<p>bar</p>";
			var q = new QElement(element, "div");

			assert.match(q.toString().toLowerCase(), /<div baz="quux">foo\s*<p>bar<\/p><\/div>/);
		});
	});

	describe("raw styles and positions", function() {

		it("retrieves raw style", function() {
			var element = frame.addElement("<div style='font-size: 42px'></div>");
			assert.equal(element.getRawStyle("font-size"), "42px", "raw style");
		});

		it("returns empty string when raw style doesn't exist", function() {
			var element = frame.addElement("<div></div>");
			assert.equal(element.getRawStyle("non-existant"), "", "non-existant style");
		});

		it("retrieves raw element position", function() {
			var element = frame.addElement(
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


	describe("constraints", function() {
		var TOP = 20;
		var RIGHT = 90;
		var BOTTOM = 70;
		var LEFT = 30;

		var element;

		beforeEach(function() {
			element = frame.addElement(
				"<div style='position: absolute; left: 30px; width: 60px; top: 20px; height: 50px;'></div>"
			);
		});

		it("exposes edges", function() {
			assert.equal(element.top.diff(TOP), "", "top");
			assert.equal(element.right.diff(RIGHT), "", "right");
			assert.equal(element.bottom.diff(BOTTOM), "", "bottom");
			assert.equal(element.left.diff(LEFT), "", "left");
		});

		it("diff one constraint", function() {
			var expected = element.top.diff(600);
			assert.equal(element.diff({ top: 600 }), expected, "difference");
			assert.equal(element.diff({ top: TOP }), "", "no difference");
		});

		it("diff multiple constraints", function() {
			var topDiff = element.top.diff(600);
			var rightDiff = element.right.diff(400);
			var bottomDiff = element.bottom.diff(200);

			assert.equal(
				element.diff({ top: 600, right: 400, bottom: 200 }),
				topDiff + "\n" + rightDiff + "\n" + bottomDiff,
				"three differences"
			);
			assert.equal(element.diff({ top: TOP, right: RIGHT, bottom: BOTTOM }), "", "no differences");
			assert.equal(
				element.diff({ top: 600, right: RIGHT, bottom: 200}),
				topDiff + "\n" + bottomDiff,
				"two differences, with middle one okay"
			);
			assert.equal(element.diff({ top: TOP, right: RIGHT, bottom: 200}), bottomDiff, "one difference");
		});

		it("diff fails fast when invalid property is provided", function() {
			assert.exception(function() {
				element.diff({ XXX: "non-existant" });
			}, /'XXX' is unknown and can't be used with diff()/);
		});

	});

});