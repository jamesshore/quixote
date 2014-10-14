// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Frame = require("./frame.js");
var QElement = require("./q_element.js");

describe("QElement", function() {

	var frame;

	before(function(done) {
		Frame.create(window.document.body, 800, 1000, function(theFrame) {
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
			var q = new QElement(document.body);
			var dom = q.toDomElement();

			assert.equal(dom, document.body);
		});

		it("has a description", function() {
			var element = new QElement(document.body, "description");
			assert.equal(element.description(), "description");
		});

		it("compares to another QElement", function() {
			var head = new QElement(document.querySelector("head"));    // WORKAROUND IE8: no document.head
			var body1 = new QElement(document.body);
			var body2 = new QElement(document.body);

			assert.objEqual(body1, body2, "equality");
			assert.objNotEqual(head, body1, "inequality");
		});

		it("displays nicely as a string", function() {
			var element = document.createElement("div");
			element.setAttribute("baz", "quux");
			element.innerHTML = "foo<p>bar</p>";
			var q = new QElement(element);

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

			var position = element.getRawPosition();

			// WORKAROUND IE8: getRawPosition() reports different values
			if (position.left === 32) {
				assert.deepEqual(position, {
					left: 32,
					right: 92,
					width: 60,

					top: 22,
					bottom: 72,
					height: 50
				});
			}
			else {
				assert.deepEqual(element.getRawPosition(), {
					left: 30,
					right: 90,
					width: 60,

					top: 20,
					bottom: 70,
					height: 50
				});
			}

		});

	});

});