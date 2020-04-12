// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var PageEdge = require("./page_edge.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var Size = require("../values/size.js");
var quixote = require("../quixote.js");

describe("DESCRIPTOR: PageEdge", function() {

	describe("basics", function() {
		var top;
		var right;
		var bottom;
		var left;

		beforeEach(function() {
			var frame = reset.frame;
			var browsingContext = frame.toBrowsingContext();

			top = PageEdge.top(browsingContext);
			right = PageEdge.right(browsingContext);
			bottom = PageEdge.bottom(browsingContext);
			left = PageEdge.left(browsingContext);

			frame.add(
				"<div style='position: absolute; left: " + (reset.WIDTH + 100) + "px; top: " + (reset.HEIGHT + 100) + "px; " +
				"width: 100px; height: 100px; background-color: green;'>force scroll</div>"
			);
		});

		it("is a position descriptor", function() {
			assert.implements(top, PositionDescriptor);
		});

		it("values match page size", function() {
			assert.objEqual(top.value(), Position.y(0), "top");
			assert.objEqual(right.value(), Position.x(reset.WIDTH + 100 + 100), "right");
			assert.objEqual(bottom.value(), Position.y(reset.HEIGHT + 100 + 100), "bottom");
			assert.objEqual(left.value(), Position.x(0), "left");
		});

		it("converts comparison arguments", function() {
			assert.objEqual(top.convert(13, "number"), Position.y(13), "top");
			assert.objEqual(right.convert(13, "number"), Position.x(13), "right");
			assert.objEqual(bottom.convert(13, "number"), Position.y(13), "bottom");
			assert.objEqual(left.convert(13, "number"), Position.x(13), "left");
		});

		it("converts to string", function() {
			assert.equal(top.toString(), "top of page");
			assert.equal(right.toString(), "right side of page");
			assert.equal(bottom.toString(), "bottom of page");
			assert.equal(left.toString(), "left side of page");
		});

		it("has assertions", function() {
			assert.exception(
				function() { left.should.equal(30); },
				"left side of page should be 30px to right.\n" +
				"  Expected: 30px\n" +
				"  But was:  0px"
			);
		});

	});


	describe("size calculation for", function() {

		var FRAME_WIDTH = reset.WIDTH;
		var FRAME_HEIGHT = reset.HEIGHT;
		var HTML_BORDER_LEFT = 1;
		var HTML_BORDER_TOP = 1;
		var HTML_BORDER_RIGHT = 2;
		var HTML_BORDER_BOTTOM = 2;
		var BODY_BORDER_LEFT = 4;
		var BODY_BORDER_TOP = 4;
		var BODY_BORDER_RIGHT = 8;
		var BODY_BORDER_BOTTOM = 8;

		var frame;
		var htmlStyle;
		var bodyStyle;
		var right;
		var bottom;

		beforeEach(function() {
			frame = reset.frame;
			var contentDocument = frame.toDomElement().contentDocument;
			var browsingContext = frame.toBrowsingContext();

			right = PageEdge.right(browsingContext);
			bottom = PageEdge.bottom(browsingContext);

			htmlStyle = contentDocument.documentElement.style;
			htmlStyle.borderLeft = "solid " + HTML_BORDER_LEFT + "px green";
			htmlStyle.borderRight = "solid " + HTML_BORDER_RIGHT + "px green";
			htmlStyle.borderTop = "solid " + HTML_BORDER_TOP + "px green";
			htmlStyle.borderBottom = "solid " + HTML_BORDER_BOTTOM + "px green";

			bodyStyle = contentDocument.body.style;
			bodyStyle.backgroundColor = "blue";
			bodyStyle.borderLeft = "solid " + BODY_BORDER_LEFT + "px red";
			bodyStyle.borderRight = "solid " + BODY_BORDER_RIGHT + "px red";
			bodyStyle.borderTop = "solid " + BODY_BORDER_TOP + "px red";
			bodyStyle.borderBottom = "solid " + BODY_BORDER_BOTTOM + "px red";
		});

		afterEach(function() {
			if (reset.DEBUG) return;

			bodyStyle.backgroundColor = "";
			bodyStyle.border = "";
			bodyStyle.width = "";
			bodyStyle.height = "";
			bodyStyle.boxSizing = "";

			htmlStyle.width = "";
			htmlStyle.height = "";
			htmlStyle.border = "";
		});

		describe("width", function() {

			it("uses viewport width when html and body width is smaller than viewport", function() {
				//reset.DEBUG = true;

				bodyStyle.boxSizing = "content-box";
				bodyStyle.width = "75px";
				bodyStyle.height = "150px";
				htmlStyle.width = "100px";
				htmlStyle.height = "200px";

				assert.objEqual(width(), Size.create(FRAME_WIDTH));
			});

			it("doesn't include vertical scrollbar when content taller but narrower than viewport", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: absolute; top: " + (FRAME_HEIGHT + 100) + "px; " +
					"left: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
				);

				assert.objEqual(width(), frame.viewport().width.value());
			});

			it("accounts for elements wider than viewport", function() {
				//reset.DEBUG = true;

				var element = frame.add(
					"<div style='width: " + (FRAME_WIDTH + 2000) + "px; height: 100px; " +
					"background-color: purple'>el</div>"
				);

				var expected = FRAME_WIDTH + 2000 + HTML_BORDER_LEFT + BODY_BORDER_LEFT;
				if (quixote.browser.enlargesFrameToPageSize()) expected += HTML_BORDER_RIGHT + BODY_BORDER_RIGHT;
				assert.objEqual(width(), Size.create(expected));
			});

			it("accounts for elements relatively-positioned to right of viewport", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: relative; left: " + (FRAME_WIDTH + 10) + "px; " +
					"width: 40px; height: 80px; background-color: green'>el</div>"
				);

				var expected = FRAME_WIDTH + 10 + 40 + HTML_BORDER_LEFT + BODY_BORDER_LEFT;
				assert.objEqual(width(), Size.create(expected));
			});

			it("accounts for elements absolutely-positioned to right of viewport", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: absolute; left: " + (FRAME_WIDTH + 10) + "px; " +
					"width: 40px; height: 80px; background-color: green'>el</div>"
				);

				var expected = FRAME_WIDTH + 10 + 40;
				assert.objEqual(width(), Size.create(expected));
			});

			it("ignores margin extending past right edge of viewport", function() {
				//reset.DEBUG = true;

				var element = frame.add(
					"<div style='width: 100%; margin-right: 100px; height: 100px; " +
					"background-color: purple'>el</div>"
				);

				assert.objEqual(width(), frame.viewport().width.value());
			});

			it("ignores element positioned to left of viewport using negative margin", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='margin-left: -40px; " +
					"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
				);

				assert.objEqual(width(), frame.viewport().width.value());
			});

			it("ignores element positioned to left of viewport using negative position", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: relative; left: -40px; " +
					"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
				);

				assert.objEqual(width(), frame.viewport().width.value());
			});

			function width() {
				return Size.create(right.value().toPixels());
			}

		});


		describe("height", function() {

			it("uses viewport height when html and body height is smaller than viewport", function() {
				//reset.DEBUG = true;

				bodyStyle.boxSizing = "content-box";
				bodyStyle.width = "75px";
				bodyStyle.height = "150px";
				htmlStyle.width = "100px";
				htmlStyle.height = "200px";

				assert.objEqual(height(), Size.create(FRAME_HEIGHT));
			});

			it("doesn't include horizontal scrollbar when content wider but shorter than viewport", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: absolute; left: " + (FRAME_WIDTH + 100) + "px; " +
					"top: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
				);

				assert.objEqual(height(), frame.viewport().height.value());
			});

			it("accounts for elements taller than viewport", function() {
				//reset.DEBUG = true;

				var element = frame.add(
					"<div style='width: 100px; height: " + (FRAME_HEIGHT + 2000) + "px;" +
					"background-color: purple'>el</div>"
				);

				var expected = FRAME_HEIGHT + 2000 + HTML_BORDER_TOP + BODY_BORDER_TOP + HTML_BORDER_BOTTOM + BODY_BORDER_BOTTOM;
				assert.objEqual(height(), Size.create(expected));
			});

			it("accounts for elements relatively-positioned below viewport", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: relative; top: " + (FRAME_HEIGHT + 10) + "px; " +
					"width: 40px; height: 80px; background-color: green'>el</div>"
				);

				var expected = FRAME_HEIGHT + 10 + 80 + HTML_BORDER_TOP + BODY_BORDER_TOP;
				assert.objEqual(height(), Size.create(expected));
			});

			it("accounts for elements absolutely-positioned below viewport", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: absolute; top: " + (FRAME_HEIGHT + 10) + "px; " +
					"width: 40px; height: 80px; background-color: green'>el</div>"
				);

				var expected = FRAME_HEIGHT + 10 + 80;
				assert.objEqual(height(), Size.create(expected));
			});

			it("INCLUDES margin extending below viewport", function() {
				//reset.DEBUG = true;

				htmlStyle.border = "";
				bodyStyle.border = "";

				var element = frame.add(
					"<div style='height: " + FRAME_HEIGHT + "px; margin-bottom: 100px; width: 100px; " +
					"background-color: purple'>el</div>"
				);

				var expected = FRAME_HEIGHT + 100;
				assert.objEqual(height(), Size.create(expected));
			});

			it("ignores element positioned above viewport using negative margin", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='margin-top: -40px; " +
					"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
				);

				assert.objEqual(height(), frame.viewport().height.value());
			});

			it("ignores element positioned above viewport using negative position", function() {
				//reset.DEBUG = true;

				frame.add(
					"<div style='position: relative; top: -40px; " +
					"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
				);

				assert.objEqual(height(), frame.viewport().height.value());
			});

			function height() {
				return Size.create(bottom.value().toPixels());
			}

		});

	});
});