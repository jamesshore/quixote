// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var ViewportEdge = require("./viewport_edge.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var Size = require("../values/size.js");

describe("DESCRIPTOR: ViewportEdge", function() {

	var WIDTH = reset.WIDTH;
	var HEIGHT = reset.HEIGHT;

	var frame;
	var top;
	var right;
	var bottom;
	var left;

	beforeEach(function() {
		frame = reset.frame;
		var browsingContext = frame.toBrowsingContext();

		top = ViewportEdge.top(browsingContext);
		right = ViewportEdge.right(browsingContext);
		bottom = ViewportEdge.bottom(browsingContext);
		left = ViewportEdge.left(browsingContext);
	});

	it("is a position descriptor", function() {
		assert.implements(top, PositionDescriptor);
	});

	it("values match viewport size", function() {
		assert.objEqual(left.value(), Position.x(0), "left");
		assert.objEqual(top.value(), Position.y(0), "top");

		assert.objEqual(right.value(), Position.x(WIDTH), "right");
		assert.objEqual(bottom.value(), Position.y(HEIGHT), "bottom");
	});

	it("values account for scrolling", function() {
		if (quixote.browser.enlargesFrameToPageSize()) return;

		frame.add(
			"<div style='position: absolute; left: " + (WIDTH + 100) + "px; top: " + (HEIGHT + 100) + "px; " +
			"width: 100px; height: 100px; background-color: green'>scroll enabler</div>"
		);
		frame.scroll(10, 20);

		assert.objEqual(left.value(), Position.x(10), "left");
		assert.objEqual(top.value(), Position.y(20), "top");

		assert.objEqual(right.value(), Position.x(10).plus(frame.viewport().width.value()), "right");
		assert.objEqual(bottom.value(), Position.y(20).plus(frame.viewport().height.value()), "bottom");
	});

	it("converts comparison arguments", function() {
		assert.objEqual(top.convert(13, "number"), Position.y(13), "top");
		assert.objEqual(right.convert(13, "number"), Position.x(13), "right");
		assert.objEqual(bottom.convert(13, "number"), Position.y(13), "bottom");
		assert.objEqual(left.convert(13, "number"), Position.x(13), "left");
	});

	it("converts to string", function() {
		assert.equal(top.toString(), "top edge of viewport");
		assert.equal(right.toString(), "right edge of viewport");
		assert.equal(bottom.toString(), "bottom edge of viewport");
		assert.equal(left.toString(), "left edge of viewport");
	});

	it("has assertions", function() {
		assert.exception(
			function() { left.should.equal(30); },
			"left edge of viewport should be 30px to right.\n" +
			"  Expected: 30px\n" +
			"  But was:  0px"
		);
	});

	it("works end-to-end with fixed-position element", function() {
		if (quixote.browser.enlargesFrameToPageSize()) return;

		frame.add(
			"<div style='position: absolute; left: " + (WIDTH + 100) + "px; top: " + (HEIGHT + 100) + "px; " +
			"width: 100px; height: 100px; background-color: green'>scroll enabler</div>"
		);
		var sticky = frame.add(
			"<div style='position: fixed; width: 100%; height: 20px; background-color: red;'>Sticky</div>",
			"sticky"
		);

		sticky.assert({
			top: top,
			left: left,
			right: right
		}, "should start at top");

		frame.scroll(10, 20);
		sticky.assert({
			top: top,
			left: left,
			right: right
		}, "should stay stuck to top even after scrolling");
	});

	describe("size calculation", function() {

		var WIDTH = reset.WIDTH;
		var HEIGHT = reset.HEIGHT;

		var frame;
		var contentDoc;
		var right;
		var bottom;

		beforeEach(function() {
			frame = reset.frame;
		});

		beforeEach(function() {
			contentDoc = frame.toDomElement().contentDocument;
			var browsingContext = frame.toBrowsingContext();

			right = ViewportEdge.right(browsingContext);
			bottom = ViewportEdge.bottom(browsingContext);

			contentDoc.body.style.backgroundColor = "blue";
		});

		afterEach(function() {
			if (reset.DEBUG) return;

			contentDoc.body.style.backgroundColor = "";
			contentDoc.body.style.padding = "0";
			contentDoc.body.style.borderWidth = "0";
			contentDoc.body.style.margin = "0";
		});

		it("matches frame size when everything fits in the window", function() {
			assert.objEqual(width(), Size.create(WIDTH), "width");
			assert.objEqual(height(), Size.create(HEIGHT), "height");
		});

		it("accounts for body padding", function() {
			contentDoc.body.style.padding = "1px 2px 4px 8px";
			assert.objEqual(width(), Size.create(WIDTH), "width");
			assert.objEqual(height(), Size.create(HEIGHT), "height");
		});

		it("accounts for body border", function() {
			contentDoc.body.style.borderWidth = "1px 2px 4px 8px";
			assert.objEqual(width(), Size.create(WIDTH), "width");
			assert.objEqual(height(), Size.create(HEIGHT), "height");
		});

		it("accounts for body margin", function() {
			contentDoc.body.style.margin = "1px 2px 4px 8px";

			assert.objEqual(width(), Size.create(WIDTH), "width");
			assert.objEqual(height(), Size.create(HEIGHT), "height");
		});

		it("ignores box model", function() {
			contentDoc.body.style.padding = "1px 2px 4px 8px";
			contentDoc.body.style.margin = "16px 32px 64px 128px";

			contentDoc.body.style.boxSizing = "border-box";
			assert.objEqual(width(), Size.create(WIDTH), "border-box width");
			assert.objEqual(height(), Size.create(HEIGHT), "border-box height");

			contentDoc.body.style.boxSizing = "content-box";
			assert.objEqual(width(), Size.create(WIDTH), "content-box width");
			assert.objEqual(height(), Size.create(HEIGHT), "content-box height");
		});

		it("accounts for effects of elements to right of viewport", function() {
			frame.add(
				"<div style='position: absolute; left: " + (WIDTH + 100) + "px; " +
				"top: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
			);
			var fullHeight = frame.add(
				"<div style='position: absolute; top: 0px; bottom: 0px; " +
				"width: 100px; background-color: red;'>full height</div>"
			);

			if (quixote.browser.enlargesFrameToPageSize()) {
				// WORKAROUND Mobile Safari 7.0.0: ignores frame width and height
				assert.objEqual(width(), Size.create(WIDTH + 200), "Mobile Safari ignores frame width");
				return;
			}

			assert.objEqual(width(), Size.create(WIDTH), "width should not include element outside frame");
			assert.objEqual(height(), fullHeight.height.value(), "height should account for scrollbar");
		});

		it("accounts for effects of elements below viewport", function() {
			frame.add(
				"<div style='position: absolute; top: " + (HEIGHT + 100) + "px; " +
				"left: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
			);
			var fullWidth = frame.add(
				"<div style='width: 100%; background-color: red;'>full width</div>"
			);

			if (quixote.browser.enlargesFrameToPageSize()) {
				// WORKAROUND Mobile Safari 7.0.0: ignores frame width and height
				assert.objEqual(height(), Size.create(HEIGHT + 200), "Mobile Safari ignores frame height");
				return;
			}

			assert.objEqual(height(), Size.create(HEIGHT), "height should not include element outside frame");
			assert.objEqual(width(), fullWidth.width.value(), "width should account for scrollbar");
		});

		it("ignores elements shifted off-screen using negative margin", function() {
			frame.add(
				"<div style='margin-left: -40px; margin-top: -80px;" +
				"width: 100px; height: 100px; background-color: red;'>moved off-screen</div>"
			);

			assert.objEqual(width(), Size.create(WIDTH), "width");
			assert.objEqual(height(), Size.create(HEIGHT), "height");
		});

		it("ignores elements positioned off-screen using negative position", function() {
			frame.add(
				"<div style='position: absolute; left: -40px; top: -80px; " +
				"width: 100px; height: 100px; background-color: red;'>off-screen</div>"
			);
		});

		function width() {
			return Size.create(right.value().toPixels());
		}

		function height() {
			return Size.create(bottom.value().toPixels());
		}

	});
});