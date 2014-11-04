// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var SizeDescriptor = require("./size_descriptor.js");
var ViewportSize = require("./viewport_size.js");
var Size = require("../values/size.js");

describe("ViewportSize", function() {

	var WIDTH = reset.WIDTH;
	var HEIGHT = reset.HEIGHT;

	var frame;
	var contentDoc;
	var width;
	var height;

	beforeEach(function() {
		frame = reset.frame;
	});

	beforeEach(function() {
		contentDoc = frame.toDomElement().contentDocument;
		width = ViewportSize.x(frame);
		height = ViewportSize.y(frame);

		contentDoc.body.style.backgroundColor = "blue";
	});

	afterEach(function() {
		if (reset.DEBUG) return;

		contentDoc.body.style.backgroundColor = "";
		contentDoc.body.style.padding = "0";
		contentDoc.body.style.borderWidth = "0";
		contentDoc.body.style.margin = "0";
	});

	it("is a size descriptor", function() {
		assert.implements(width, SizeDescriptor);
	});

	it("matches frame size when everything fits in the window", function() {
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("accounts for body padding", function() {
		contentDoc.body.style.padding = "1px 2px 4px 8px";
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("accounts for body border", function() {
		contentDoc.body.style.borderWidth = "1px 2px 4px 8px";
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("accounts for body margin", function() {
		contentDoc.body.style.margin = "1px 2px 4px 8px";

		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("ignores box model", function() {
		contentDoc.body.style.padding = "1px 2px 4px 8px";
		contentDoc.body.style.margin = "16px 32px 64px 128px";

		contentDoc.body.style.boxSizing = "border-box";
		assert.objEqual(width.value(), Size.create(WIDTH), "border-box width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "border-box height");

		contentDoc.body.style.boxSizing = "content-box";
		assert.objEqual(width.value(), Size.create(WIDTH), "content-box width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "content-box height");
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
			assert.objEqual(width.value(), Size.create(WIDTH + 200), "Mobile Safari ignores frame width");
			return;
		}

		assert.objEqual(width.value(), Size.create(WIDTH), "width should not include element outside frame");
		assert.objEqual(height.value(), fullHeight.height.value(), "height should account for scrollbar");
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
			assert.objEqual(height.value(), Size.create(HEIGHT + 200), "Mobile Safari ignores frame height");
			return;
		}

		assert.objEqual(height.value(), Size.create(HEIGHT), "height should not include element outside frame");
		assert.objEqual(width.value(), fullWidth.width.value(), "width should account for scrollbar");
	});

	it("ignores elements shifted off-screen using negative margin", function() {
		frame.add(
			"<div style='margin-left: -40px; margin-top: -80px;" +
			"width: 100px; height: 100px; background-color: red;'>moved off-screen</div>"
		);

		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("ignores elements positioned off-screen using negative position", function() {
		frame.add(
			"<div style='position: absolute; left: -40px; top: -80px; " +
			"width: 100px; height: 100px; background-color: red;'>off-screen</div>"
		);
	});

	it("converts to string", function() {
		assert.equal(width.toString(), "width of viewport");
		assert.equal(height.toString(), "height of viewport");
	});

});