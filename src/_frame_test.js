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

		it("creates iframe using source URL", function(done) {
			Frame.create(window.document.body, 600, 400, { src: "/base/src/_frame_test.html" }, function(frame) {
				assert.noException(function() {
					frame.getElement("#exists");
				});
				done();
			});
		});

		it("creates iframe using stylesheet link", function(done) {
			Frame.create(window.document.body, 600, 400, { stylesheet: "/base/src/_frame_test.css" }, function(frame) {
				var styleMe = frame.addElement("<div class='style-me'>Foo</div>");
				assert.equal(styleMe.getRawStyle("font-size"), "42px");
				done();
			});
		});

		it("cannot create iframe using stylesheet and source URL simultaneously", function(done) {
			var options = {
				src: "/base/src/_frame_test.html",
				stylesheet: "/base/src/_frame_test.css"
			};

			assert.exception(function() {
				Frame.create(window.document.body, 600, 400, options, function(frame) {
					done("Should never be called");
				});
			}, /Cannot specify HTML URL and stylesheet URL simultaneously due to Mobile Safari issue/);
			done();

				// WORKAROUND Mobile Safari 7.0.0: Weird font-size result (23px)
//			Frame.create(window.document.body, 600, 400, options, function(frame) {
//				try {
//					var styleMe = frame.getElement(".style-me");
//					var makeLintHappy = styleMe.toDomElement().offsetHeight;  // force reflow
//					assert.equal(styleMe.getRawStyle("font-size"), "42px");
//					done();
//				}
//				catch(e) {
//					done(e);
//				}
		});

		it("resets iframe loaded with source URL without destroying source document", function(done) {
			Frame.create(window.document.body, 600, 400, { src: "/base/src/_frame_test.html" }, function(frame) {
				frame.reset();
				assert.noException(function() {
					frame.getElement("#exists");
				});
				done();
			});
		});

		it("resets iframe loaded with stylesheet without destroying stylesheet", function(done) {
			Frame.create(window.document.body, 600, 400, { stylesheet: "/base/src/_frame_test.css" }, function(frame) {
				frame.reset();
				var styleMe = frame.addElement("<div class='style-me'>Foo</div>");
				assert.equal(styleMe.getRawStyle("font-size"), "42px");
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

		// WORKAROUND IE 8: getClientRect() includes frame border in positions
		it("creates iframe without border to prevent IE 8 positioning problems", function(done) {
			Frame.create(window.document.body, 600, 400, { stylesheet: "/base/src/__reset.css" }, function(frame) {
				var element = frame.addElement("<p>Foo</p>");
				assert.equal(element.getRawPosition().top, 0, "top should account for body margin, but not frame border");
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

			assert.equal(body.innerHTML.toLowerCase(), "<p>foo</p>", "frame body should include new element");
			assert.objEqual(element, new QElement(body.childNodes[0]), "element should be present in frame body");
			assert.equal(element.description(), "<p>foo</p>", "description should match the HTML created");
		});

		it("fails fast if adding more than one element at a time", function() {
			assert.exception(function() {
				frame.addElement("<p>foo</p><div>bar</div>");
			}, /Expected one element, but got 2 \(<p>foo<\/p><div>bar<\/div>\)/);
		});

		it("retrieves an element by selector", function() {
			var expected = frame.addElement("<div id='foo' class='bar'>Irrelevant text</div>");
			var byId = frame.getElement("#foo");
			var byClass = frame.getElement(".bar");

			assert.objEqual(byId, expected, "should get element by ID");
			assert.objEqual(byClass, expected, "should get element by class");

			assert.equal(byId.description(), "#foo", "should describe element by selector used (#id)");
			assert.equal(byClass.description(), ".bar", "should describe element by selector used (.class)");
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

		it("resets frame without src document", function() {
			frame.addElement("<div>Foo</div>");
			frame.reset();

			assert.equal(frameDom.contentDocument.body.innerHTML, "", "frame body");
		});

	});

});