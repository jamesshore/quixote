// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Frame = require("./frame.js");
var QElement = require("./q_element.js");

describe("Frame", function() {

	describe("creation and removal", function() {

		it("creates iframe DOM element with specified width and height", function(done) {
			Frame.create(window.document.body, 600, 400, function(frame) {
				assert.type(frame, Frame, "frame");

				var iframe = frame.toDomElement();
				assert.equal(iframe.tagName, "IFRAME", "should create an iframe tag");
				assert.equal(iframe.parentNode, window.document.body, "iframe should go inside element we provide");
				assert.equal(iframe.width, "600", "width should match provided value");
				assert.equal(iframe.height, "400", "height should match provided value");

				done();
			});
		});

		it("destroys itself", function(done) {
			Frame.create(window.document.body, 800, 1000, function(frame) {
				var numChildren = document.body.childNodes.length;

				frame.remove();
				assert.equal(document.body.childNodes.length, numChildren - 1, "# of document child nodes");

				done();
			});
		});

	});

	describe("instance", function() {

		var frame;
		var frameDom;

		beforeEach(function(done) {
			Frame.create(window.document.body, 800, 1000, function(theFrame) {
				frame = theFrame;
				frameDom = frame.toDomElement();
				done();
			});
		});

		afterEach(function() {
			frame.remove();
		});

		it("adds an element", function() {
			var element = frame.addElement("<p>foo</p>");
			var body = frameDom.contentDocument.body;

			assert.equal(body.innerHTML.toLowerCase(), "<p>foo</p>", "frame body");
//			assert.type(element, QElement, "should return the element");
			assert.objEqual(element, new QElement(body.childNodes[0]));
		});

		it("fails fast if adding more than one element at a time", function() {
			assert.exception(function() {
				frame.addElement("<p>foo</p><div>bar</div>");
			}, /Expected one element, but got 2 \(<p>foo<\/p><div>bar<\/div>\)/);
		});

		it("retrieves an element by ID", function() {
			var expected = frame.addElement("<div id='foo'>Bar</div>");
			var actual = frame.getElement("#foo");

			assert.objEqual(actual, expected, "#foo ID");
		});

		it("retrieves element by selector", function() {
			var expected = frame.addElement("<div class='foo'>bar</div>");
			var actual = frame.getElement(".foo");

			assert.objEqual(actual, expected, ".foo class");
		});

		it("fails fast when retrieving non-existant element", function() {
			assert.exception(function() {
				frame.getElement(".blah");
			}, /Expected one element to match '\.blah', but found 0/);
		});

		it("fails fast when retrieving too many elements", function() {
			frame.addElement("<div><p>One</p><p>Two</p></div>");

			assert.exception(function() {
				frame.getElement("p");
			}, /Expected one element to match 'p', but found 2/);
		});

		it("resets frame to pristine state", function() {
			frame.addElement("<div>Foo</div>");
			frame.reset();

			assert.equal(frameDom.contentDocument.body.innerHTML, "", "frame body");
		});

	});

});