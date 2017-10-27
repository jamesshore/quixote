// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var quixote = require("./quixote.js");
var QFrame = require("./q_frame.js");
var QElement = require("./q_element.js");
var QViewport = require("./q_viewport.js");
var QPage = require("./q_page.js");

describe("FOUNDATION: QFrame", function() {
	this.timeout(10000);

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
				stylesheet: [ "/base/src/_q_frame_test.css", "/base/src/_q_frame_test2.css" ]
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

		// WORKAROUND IE 8: getClientRect() includes frame border in positions
		it("creates iframe without border to prevent IE 8 positioning problems", function(done) {
			frame = QFrame.create(window.document.body, { stylesheet: "/base/src/__reset.css" }, function() {
				var element = frame.add("<p>Foo</p>");
				assert.equal(element.getRawPosition().top, 0, "top should account for body margin, but not frame border");
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
				stylesheet: [ "/base/src/_q_frame_test.css", "non_existing.css" ]
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
			assert.exception(function() { frame.reset(); }, expected, "resetting frame should be a no-op");
			assert.noException(
				function() { frame.toDomElement(); },
				"toDomElement() should be okay because the iframe element exists even if it isn't loaded"
			);
			assert.exception(
				function() { frame.remove(); },
				expected,
				"technically, removing the frame works, but it's complicated, so it should just fail"
			);
			assert.exception(function() { frame.add("<p></p>"); }, expected, "add()");
			assert.exception(function() { frame.get("foo"); }, expected, "get()");
			assert.exception(function() { frame.viewport(); }, expected, "viewport()");
			assert.exception(function() { frame.page(); }, expected, "page()");
			assert.exception(function() { frame.body(); }, expected, "body()");
		});

		it("fails fast if frame is used after it's removed", function(done) {
			var expected = /Attempted to use frame after it was removed/;

			frame = QFrame.create(window.document.body, function() {
				frame.remove();
				assert.exception(function() { frame.reset(); }, expected, "reset()");
				assert.exception(function() { frame.toDomElement(); }, expected, "toDomElement()");
				assert.exception(function() { frame.add("<p></p>"); }, expected, "add()");
				assert.exception(function() { frame.get("foo"); }, expected, "get()");
				assert.exception(function() { frame.viewport(); }, expected, "viewport()");
				assert.exception(function() { frame.page(); }, expected, "page()");
				assert.exception(function() { frame.body(); }, expected, "body()");

				done();
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

		it("provides access to viewport descriptors", function() {
			assert.type(frame.viewport(), QViewport);
		});

		it("provides access to page descriptors", function() {
			assert.type(frame.page(), QPage);
		});

		it("retrieves body element", function() {
			assert.objEqual(frame.body(), new QElement(frameDom.contentDocument.body, frame, "body"), "body element");
			assert.equal(frame.body().toString(), "'body'", "body description");
		});

		it("adds an element", function() {
			var element = frame.add("<p>foo</p>");
			var body = frame.body();

			assert.objEqual(element.parent(), body, "element should be present in frame body");
			assert.equal(element.toString(), "'<p>foo</p>'", "name should match the HTML created");
		});

		it("uses optional nickname to describe added elements", function() {
			var element = frame.add("<p>foo</p>", "my element");
			assert.equal(element.toString(), "'my element'");
		});

		it("retrieves an element by selector", function() {
			var expected = frame.add("<div id='foo' class='bar' baz='boo'>Irrelevant text</div>");
			var byId = frame.get("#foo");
			var byClass = frame.get(".bar");
			var byAttribute = frame.get("[baz]");

			assert.objEqual(byId, expected, "should get element by ID");
			assert.objEqual(byClass, expected, "should get element by class");
			assert.objEqual(byAttribute, expected, "should get element by attribute");

			assert.equal(byId.toString(), "'#foo'", "should describe element by selector used");
		});

		it("uses optional nickname to describe retrieved elements", function() {
			frame.add("<div id='foo'>Irrelevant text</div>");
			var element = frame.get("#foo", "Bestest Element Ever!!");
			assert.equal(element.toString(), "'Bestest Element Ever!!'");
		});

		it("fails fast when retrieving non-existant element", function() {
			assert.exception(function() {
				frame.get(".blah");
			}, /Expected one element to match '\.blah', but found 0/);
		});

		it("fails fast when retrieving too many elements", function() {
			frame.add("<div><p>One</p><p>Two</p></div>");

			assert.exception(function() {
				frame.get("p");
			}, /Expected one element to match 'p', but found 2/);
		});

		it("retrieves a list of elements", function() {
			frame.add("<div><p id='p1'>One</p><p>Two</p><p>Three</p></div>");
			var some = frame.getAll("p");
			var named = frame.getAll("p", "my name");

			assert.objEqual(some.at(0), frame.get("#p1"), "should get a working list");
			assert.equal(some.toString(), "'p' list", "should describe it by its selector");
			assert.equal(named.toString(), "'my name' list", "should use nickname when provided");
		});

		it("resets frame without src document", function() {
			frame.add("<div>Foo</div>");
			frame.reset();

			assert.equal(frameDom.contentDocument.body.innerHTML, "", "frame body");
		});

		it("scrolls", function() {
			frame.add("<div style='position: absolute; left: 5000px; top: 5000px; width: 60px'>scroll enabler</div>");

			assert.deepEqual(frame.getRawScrollPosition(), { x: 0, y: 0}, "should start at (0, 0)");

			frame.scroll(150, 300);
			var position = frame.getRawScrollPosition();
			if (quixote.browser.enlargesFrameToPageSize()) {
				assert.equal(position.x, 0, "should not have scrolled horizontally because whole page is displayed");
				assert.equal(position.y, 0, "should not have scrolled vertically because whole page is displayed");
			}
			else {
				assert.equal(position.x, 150, "should have scrolled right");
				assert.equal(position.y, 300, "should have scrolled down");
			}

			frame.reset();
			assert.equal(frame.getRawScrollPosition().x, 0, "should have reset X scroll position");
			assert.equal(frame.getRawScrollPosition().y, 0, "should have reset Y scroll position");
		});

		it("can resize frame", function() {
			frame.resize(reset.WIDTH - 100, reset.HEIGHT - 100);
			assert.equal(frame.viewport().width.diff(reset.WIDTH - 100), "", "width");
			assert.equal(frame.viewport().height.diff(reset.HEIGHT - 100), "", "height");
		});

    it("resets frame to original size", function() {
      frame.resize(reset.WIDTH + 100, reset.HEIGHT + 100);
      frame.reset();
      assert.equal(frame.viewport().width.diff(reset.WIDTH), "", "width");
      assert.equal(frame.viewport().height.diff(reset.HEIGHT), "", "height");
    });

    it("reloads frame to original size", function(done) {
      frame.resize(reset.WIDTH + 100, reset.HEIGHT + 100);
      frame.reload(function () {
        assert.equal(frame.viewport().width.diff(reset.WIDTH), "", "width");
        assert.equal(frame.viewport().height.diff(reset.HEIGHT), "", "height");
        done();
      });
	});

  });

});
