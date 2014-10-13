// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Frame = require("./frame.js");
var QElement = require("./q_element.js");

describe("QElement", function() {

	describe("object manipulation", function() {
		it("converts to DOM element", function() {
			var q = new QElement(document.body);
			var dom = q.toDomElement();

			assert.equal(dom, document.body);
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
			"<div style='position: fixed; left: 30px; right: 90px; top: 20px; bottom: 70px;'></div>"
		);

		dump(typeof element.getRawPosition().left);

		assert.deepEqual(element.getRawPosition(), {
			left: 30,
			width: 60,
			right: 90,

			top: 20,
			height: 50,
			bottom: 70
		});

	});

});