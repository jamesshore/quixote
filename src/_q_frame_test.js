// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var QFrame = require("./q_frame.js");
var BrowsingContext = require("./browsing_context.js");

describe("FOUNDATION: QFrame", function() {

	describe("creation and removal", function() {

		var frame;

		afterEach(function() {
			if (reset.DEBUG) return;

			frame.remove();
		});

		it("creates iframe DOM element with specified width and height", function(done) {
			frame = QFrame.create(window.document.body, { width: 600, height: 400 }, function() {
				assert.type(frame, QFrame, "frame");

				var iframe = frame.toDomElement();
				assert.equal(iframe.tagName, "IFRAME", "should create an iframe tag");
				assert.equal(iframe.parentNode, window.document.body, "iframe should go inside element we provide");
				assert.equal(iframe.width, "600", "width should match provided value");
				assert.equal(iframe.height, "400", "height should match provided value");

				done();
			});
		});

		it("use default values when no options provided", function(done) {
			frame = QFrame.create(window.document.body, function() {
				var iframe = frame.toDomElement();

				assert.equal(iframe.width, "2000", "default width");
				assert.equal(iframe.height, "2000", "default height");

				done();
			});
		});

		it("returns frame immediately upon creation", function(done) {
			frame = QFrame.create(window.document.body, function(err, loadedFrame) {
				assert.equal(frame, loadedFrame, "should return same frame as passed in callback");
				done(err);
			});
			assert.defined(frame, "valid QFrame object should be returned from create() method");
		});

		it("creates frames in standards mode when they don't have src link", function(done) {
			frame = QFrame.create(window.document.body, { width: 600, height: 400 }, function(err, loadedFrame) {
				var style = frame.body().toDomElement().style;
				style.backgroundColor = "blue";
				style.margin = "0";
				var element = frame.add("<div style='width: 100%; height: 100px; background-color: green'>full width</div>");

				element.assert({ width: 600 }, "in quirks mode, element doesn't span full width of viewport");
				done();
			});
		});

		it("does not fail in Mocha if Mocha's 'done' is passed as frame callback", function(done) {
			frame = QFrame.create(window.document.body, done);
		});

		it("creates iframe using source URL", function(done) {
			var frame = QFrame.create(window.document.body, { src: "/base/src/_q_frame_test.html" }, function() {
				assert.noException(function() {
					frame.get("#exists");
				});
				done();
			});
		});

		it("creates iframe using stylesheet link", function(done) {
			frame = QFrame.create(window.document.body, { stylesheet: "/base/src/_q_frame_test.css" }, function() {
				var styleMe = frame.add("<div class='style-me'>Foo</div>");
				assert.equal(styleMe.getRawStyle("font-size"), "42px", "should get style from stylesheet");
				done();
			});
		});

		it("creates iframe using multiple stylesheet links", function(done) {
			var options = {
				stylesheet: ["/base/src/_q_frame_test.css", "/base/src/_q_frame_test2.css"]
			};
			frame = QFrame.create(window.document.body, options, function(err) {
				if (err) return done(err);
				try {
					var styleMe = frame.add("<div class='style-me'>Foo</div>");
					assert.equal(styleMe.getRawStyle("font-size"), "42px", "should get style from first stylesheet");
					assert.equal(styleMe.getRawPosition().height, 123, "should get style from second stylesheet");
					done();
				}
				catch(e) {
					done(e);
				}
			});
		});

		it("creates iframe using raw CSS only", function(done) {
			QFrame.create(window.document.body, { css: ".style-me { font-size: 42px; }"	}, function(err, frame) {
				var styleMe = frame.add("<div class='style-me'>Foo</div>");
				assert.equal(styleMe.getRawStyle("font-size"), "42px");
				done();
			});
		});

		it("creates iframe using raw CSS and a stylesheet link", function(done) {
			var options = {
				css: ".style-me { font-size: 42px; }",
				stylesheet: "/base/src/_q_frame_test2.css"
			};
			frame = QFrame.create(window.document.body, options, function(err) {
				if (err) return done(err);
				try {
					var styleMe = frame.add("<div class='style-me'>Foo</div>");
					assert.equal(styleMe.getRawStyle("font-size"), "42px", "should get style from raw css");
					assert.equal(styleMe.getRawPosition().height, 123, "should get style from stylesheet");
					done();
				}
				catch(e) {
					done(e);
				}
			});
		});

		it("gives raw CSS precedence over stylesheet link", function(done) {
			var options = {
				css: ".style-me { height: 20px; }",
				stylesheet: "/base/src/_q_frame_test2.css"
			};
			frame = QFrame.create(window.document.body, options, function(err) {
				if (err) return done(err);
				try {
					var styleMe = frame.add("<div class='style-me'>Foo</div>");
					assert.equal(styleMe.getRawPosition().height, 20, "raw CSS should override stylesheet");
					done();
				}
				catch(e) {
					done(e);
				}
			});
		});

		it("creates iframe using stylesheet and source URL simultaneously", function(done) {
			var options = {
				src: "/base/src/_q_frame_test.html",
				stylesheet: "/base/src/_q_frame_test.css"
			};

			QFrame.create(window.document.body, options, function(err, frame) {
				var styleMe = frame.get(".style-me");
				assert.equal(styleMe.getRawStyle("font-size"), "42px");
				done();
			});
		});

		it("creates iframe using raw CSS and source URL simultaneously", function(done) {
			var options = {
				src: "/base/src/_q_frame_test.html",
				css: ".style-me { font-size: 42px; }"
			};

			QFrame.create(window.document.body, options, function(err, frame) {
				var styleMe = frame.get(".style-me");
				assert.equal(styleMe.getRawStyle("font-size"), "42px");
				done();
			});
		});

		// WORKAROUND IE 8: getClientRect() includes frame border in positions
		it("creates iframe without border to prevent IE 8 positioning problems", function(done) {
			frame = QFrame.create(window.document.body, { stylesheet: "/base/src/__reset.css" }, function() {
				var element = frame.add("<p>Foo</p>");
				assert.equal(element.getRawPosition().top, 0, "top should account for body margin, but not frame border");
				done();
			});
		});

		it("destroys itself", function(done) {
			frame = QFrame.create(window.document.body, function() {
				var numChildren = document.body.childNodes.length;

				frame.remove();
				assert.equal(document.body.childNodes.length, numChildren - 1, "# of document child nodes");

				assert.noException(function() {
					frame.remove();
				}, "removing an already removed frame should be a no-op");
				done();
			});
		});

		it("fails fast if source URL not found", function(done) {
			QFrame.create(window.document.body, { src: "non_existing.html" }, function(err, frame) {
				assert.undefined(frame, "frame should not exist");
				assert.type(err, Error, "err should be an Error object");
				assert.equal(err.message, "404 error while loading src (non_existing.html)", "error message");
				done();
			});
		});

		it("fails fast if stylesheet URL not found", function(done) {
			QFrame.create(window.document.body, { stylesheet: "non_existing.css" }, function(err, frame) {
				assert.undefined(frame, "frame should not exist");
				assert.type(err, Error, "err should be an Error object");
				assert.equal(err.message, "404 error while loading stylesheet (non_existing.css)", "error message");
				done();
			});
		});

		it("checks for existence of all stylesheet URLs", function(done) {
			var options = {
				stylesheet: ["/base/src/_q_frame_test.css", "non_existing.css"]
			};
			QFrame.create(window.document.body, options, function(err, frame) {
				assert.undefined(frame, "frame should not exist");
				assert.type(err, Error, "err should be an Error object");
				assert.equal(err.message, "404 error while loading stylesheet (non_existing.css)", "error message");
				done();
			});
		});

		it("fails fast if frame is used before it's loaded", function(done) {
			frame = QFrame.create(window.document.body, function() { done(); });

			var expected = /Frame not loaded: Wait for frame creation callback to execute before using frame/;
			assert.exception(function() { frame.reset(); }, expected, "reset()");
			assert.exception(function() { frame.reload(function() {}); }, expected, "reload()");
			assert.exception(function() { frame.toDomElement(); }, expected, "toDomElement()");
			assert.exception(
				function() { frame.remove(); },
				expected,
				"technically, removing the frame works, but it's complicated, so it should just fail"
			);
			assert.exception(function() { frame.add("<p></p>"); }, expected, "add()");
			assert.exception(function() { frame.get("foo"); }, expected, "get()");
			assert.exception(function() { frame.getAll("foo"); }, expected, "getAll()");
			assert.exception(function() { frame.viewport(); }, expected, "viewport()");
			assert.exception(function() { frame.page(); }, expected, "page()");
			assert.exception(function() { frame.body(); }, expected, "body()");
			assert.exception(function() { frame.scroll(0, 0); }, expected, "scroll()");
			assert.exception(function() { frame.getRawScrollPosition(); }, expected, "getRawScrollPosition()");
			assert.exception(function() { frame.resize(100, 100); }, expected, "resize()");
		});

		it("fails fast if frame is used after it's removed", function(done) {
			var expected = /Attempted to use frame after it was removed/;

			frame = QFrame.create(window.document.body, function() {
				frame.remove();
				assert.exception(function() { frame.reset(); }, expected, "reset()");
				assert.exception(function() { frame.reload(function() {}); }, expected, "reload()");
				assert.exception(function() { frame.toDomElement(); }, expected, "toDomElement()");
				assert.noException(function() { frame.remove(); }, "calling remove() twice shouldn't do anything");
				assert.exception(function() { frame.add("<p></p>"); }, expected, "add()");
				assert.exception(function() { frame.get("foo"); }, expected, "get()");
				assert.exception(function() { frame.getAll("foo"); }, expected, "getAll()");
				assert.exception(function() { frame.viewport(); }, expected, "viewport()");
				assert.exception(function() { frame.page(); }, expected, "page()");
				assert.exception(function() { frame.body(); }, expected, "body()");
				assert.exception(function() { frame.scroll(0, 0); }, expected, "scroll()");
				assert.exception(function() { frame.getRawScrollPosition(); }, expected, "getRawScrollPosition()");
				assert.exception(function() { frame.resize(100, 100); }, expected, "resize()");

				done();
			});
		});

		describe('frame reset', function() {

			it("resets iframe loaded with source URL without destroying source document", function(done) {
				frame = QFrame.create(window.document.body, { src: "/base/src/_q_frame_test.html" }, function() {
					frame.reset();
					assert.noException(function() {
						frame.get("#exists");
					});
					done();
				});
			});

			it("resets iframe loaded with stylesheet without destroying stylesheet", function(done) {
				frame = QFrame.create(window.document.body, { stylesheet: "/base/src/_q_frame_test.css" }, function() {
					frame.reset();
					var styleMe = frame.add("<div class='style-me'>Foo</div>");
					assert.equal(styleMe.getRawStyle("font-size"), "42px");
					done();
				});
			});

			it("doesn't re-run scripts", function(done) {
				var options = { src: "/base/src/_q_frame_test.html" };
				frame = QFrame.create(window.document.body, options, function() {
					frame._domElement.contentWindow._Q_FRAME_TEST_GLOBAL = "new value";

					frame.reset();
					var frameGlobal = frame._domElement.contentWindow._Q_FRAME_TEST_GLOBAL;
					assert.equal(frameGlobal, "new value", "script should not re-run");

					done();
				});
			});

		});

		describe('frame reload', function() {

			it('reloads iframe with original source URL', function(done) {
				frame = QFrame.create(window.document.body, { src: "/base/src/_q_frame_test.html" }, function() {
					frame.reload(function() {
						assert.noException(function() {
							frame.get("#exists");
						});
						done();
					});
				});
			});

			it('reloads iframe with original stylesheet', function(done) {
				frame = QFrame.create(window.document.body, { stylesheet: "/base/src/_q_frame_test.css" }, function() {
					frame.reload(function() {
						var styleMe = frame.add("<div class='style-me'>Foo</div>");
						assert.equal(styleMe.getRawStyle("font-size"), "42px");
						done();
					});
				});
			});

			it("re-runs scripts", function(done) {
				var options = { src: "/base/src/_q_frame_test.html" };
				frame = QFrame.create(window.document.body, options, function() {
					frame._domElement.contentWindow._Q_FRAME_TEST_GLOBAL = "new value";

					frame.reload(function() {
						var frameGlobal = frame._domElement.contentWindow._Q_FRAME_TEST_GLOBAL;
						assert.equal(frameGlobal, "initial value", "script should re-run");

						done();
					});
				});
			});

		});

	});


	describe("instance", function() {

		var frame;
		var frameDom;

		before(function() {
			frame = reset.frame;
			frameDom = frame.toDomElement();
		});

		it("provides access to browsingContext", function() {
			assert.type(frame.toBrowsingContext(), BrowsingContext);
		});

		it("resets frame without src document", function() {
			frame.add("<div>Foo</div>");
			frame.reset();

			assert.equal(frameDom.contentDocument.body.innerHTML, "", "frame body");
		});

		it("after reset, scroll position also resets", function() {
			frame.add("<div style='position: absolute; left: 5000px; top: 5000px; width: 60px'>scroll enabler</div>");

			frame.scroll(150, 300);

			frame.reset();
			assert.equal(frame.getRawScrollPosition().x, 0, "should have reset X scroll position");
			assert.equal(frame.getRawScrollPosition().y, 0, "should have reset Y scroll position");
		});

		it("can resize frame", function() {
			frame.resize(reset.WIDTH - 100, reset.HEIGHT - 100);
			assert.equal(frame.viewport().width.diff(reset.WIDTH - 100), "", "width");
			assert.equal(frame.viewport().height.diff(reset.HEIGHT - 100), "", "height");
		});

		// WORKAROUND IE 11, Edge 18.18362.0
		it("forces reflow after resizing frame so media queries take effect (issue #52)", function() {
			try {
				frame.add(
					"<style type='text/css'>" +
						".header { font-size: 20px; }" +
						"@media (min-width: 640px) {" +
							".header { font-size: 40px; }" +
						"}" +
					"</style>"
				);
			}
			catch (err) {
				// WORKAROUND IE 8: Can't add <style> tag, so we just don't run this test.
				// Creating a new frame with media query in the CSS might be a better solution, but couldn't figure out
				// how to make that work on any browser.
				if (err.message.indexOf("Expected one element, but got 0") !== -1) return;    // Only IE8 will give this error
				else throw err;
			}

			var element = frame.add("<h1 class=header>hello</h1>");
			frame.resize(200, 500);
			assert.equal(element.getRawStyle("font-size"), "20px");

			frame.resize(800, 500);
			assert.equal(element.getRawStyle("font-size"), "40px");
		});

		// WORKAROUND Safari 13.1.0, Mobile Safari 13.0.4, Chrome Mobile 74.0.3729, Chrome 80.0.3987, IE 11, Edge 18.18362.0
		// Works fine on Firefox 75 :-)
		it("forces reflow after resizing frame so viewport-relative sizes catch up (issue #52)", function() {
			var element = frame.add("<h1 style='font-size: 10vw'>hello</h1>");

			// WORKAROUND IE 8: doesn't support viewport-relative sizes, so we don't run this test
			if (element.getRawStyle("font-size") === "2em") return;  // Only IE8 will say the size is 2em.

			frame.resize(200, 500);
			assert.equal(element.getRawStyle("font-size"), "20px");

			frame.resize(800, 500);
			assert.equal(element.getRawStyle("font-size"), "80px");
		});

		it("resets frame to original size", function() {
			frame.resize(reset.WIDTH + 100, reset.HEIGHT + 100);
			frame.reset();
			assert.equal(frame.viewport().width.diff(reset.WIDTH), "", "width");
			assert.equal(frame.viewport().height.diff(reset.HEIGHT), "", "height");
		});

		it("reloads frame to original size", function(done) {
			frame.resize(reset.WIDTH + 100, reset.HEIGHT + 100);
			frame.reload(function() {
				assert.equal(frame.viewport().width.diff(reset.WIDTH), "", "width");
				assert.equal(frame.viewport().height.diff(reset.HEIGHT), "", "height");
				done();
			});
		});

	});

});
