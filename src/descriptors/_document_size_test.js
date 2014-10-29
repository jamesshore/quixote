// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var DocumentSize = require("./document_size.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");

describe("DocumentSize", function() {

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
	var width;
	var height;

	beforeEach(function() {
		frame = reset.frame;
		width = DocumentSize.x(frame);
		height = DocumentSize.y(frame);

		var contentDocument = frame.toDomElement().contentDocument;
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

	it("is a size descriptor", function() {
		assert.implements(width, SizeDescriptor);
	});


	describe("width", function() {

		it("uses viewport width when html and body width is smaller than viewport", function() {
			//reset.DEBUG = true;

			bodyStyle.boxSizing = "content-box";
			bodyStyle.width = "75px";
			bodyStyle.height = "150px";
			htmlStyle.width = "100px";
			htmlStyle.height = "200px";

			assert.objEqual(width.value(), Size.create(FRAME_WIDTH));
		});

		it("doesn't include vertical scrollbar when content taller but narrower than viewport", function() {
			//reset.DEBUG = true;

			frame.add(
				"<div style='position: absolute; top: " + (FRAME_HEIGHT + 100) + "px; " +
				"left: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
			);

			assert.objEqual(width.value(), frame.viewport().width.value());
		});

		it("accounts for elements wider than viewport", function() {
			//reset.DEBUG = true;

			var element = frame.add(
				"<div style='width: " + (FRAME_WIDTH + 2000) + "px; height: 100px; " +
				"background-color: purple'>el</div>"
			);

			var expected = FRAME_WIDTH + 2000 + HTML_BORDER_LEFT + BODY_BORDER_LEFT;
			if (!quixote.browser.canScroll()) expected += HTML_BORDER_RIGHT + BODY_BORDER_RIGHT;
			assert.objEqual(width.value(), Size.create(expected));
		});

		it("accounts for elements relatively-positioned to right of viewport", function() {
			//reset.DEBUG = true;

			frame.add(
				"<div style='position: relative; left: " + (FRAME_WIDTH + 10) + "px; " +
				"width: 40px; height: 80px; background-color: green'>el</div>"
			);

			var expected = FRAME_WIDTH + 10 + 40 + HTML_BORDER_LEFT + BODY_BORDER_LEFT;
			assert.objEqual(width.value(), Size.create(expected));
		});

		it("accounts for elements absolutely-positioned to right of viewport", function() {
			//reset.DEBUG = true;

			frame.add(
				"<div style='position: absolute; left: " + (FRAME_WIDTH + 10) + "px; " +
				"width: 40px; height: 80px; background-color: green'>el</div>"
			);

			var expected = FRAME_WIDTH + 10 + 40;
			assert.objEqual(width.value(), Size.create(expected));
		});

		it("ignores margin extending past right edge of viewport", function() {
			//reset.DEBUG = true;

			var element = frame.add(
				"<div style='width: 100%; margin-right: 100px; height: 100px; " +
				"background-color: purple'>el</div>"
			);

			assert.objEqual(width.value(), frame.viewport().width.value());
		});

		it("ignores element positioned to left of viewport using negative margin", function() {
			//reset.DEBUG = true;

			frame.add(
				"<div style='margin-left: -40px; " +
				"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
			);

			assert.objEqual(width.value(), frame.viewport().width.value(), "width");
		});

		it("ignores element positioned to left of viewport using negative position", function() {
			//reset.DEBUG = true;

			frame.add(
				"<div style='position: relative; left: -40px; " +
				"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
			);

			assert.objEqual(width.value(), frame.viewport().width.value(), "width");
		});

	});


	describe("height", function() {

		it("uses viewport height when html and body height is smaller than viewport", function() {
			//reset.DEBUG = true;

			bodyStyle.boxSizing = "content-box";
			bodyStyle.width = "75px";
			bodyStyle.height = "150px";
			htmlStyle.width = "100px";
			htmlStyle.height = "200px";

			assert.objEqual(height.value(), Size.create(FRAME_HEIGHT));
		});

		it("doesn't include horizontal scrollbar when content wider but shorter than viewport", function() {
			//reset.DEBUG = true;

			frame.add(
				"<div style='position: absolute; left: " + (FRAME_WIDTH + 100) + "px; " +
				"top: 100px; width: 100px; height: 100px; background-color: green'>force scrolling</div>"
			);

			assert.objEqual(height.value(), frame.viewport().height.value());
		});

		it("accounts for elements taller than viewport", function() {
			//reset.DEBUG = true;

			var element = frame.add(
				"<div style='width: 100px; height: " + (FRAME_HEIGHT + 2000) + "px;" +
				"background-color: purple'>el</div>"
			);

			var expected = FRAME_HEIGHT + 2000 + HTML_BORDER_TOP + BODY_BORDER_TOP + HTML_BORDER_BOTTOM + BODY_BORDER_BOTTOM;
			assert.objEqual(height.value(), Size.create(expected));
		});

		it.only("accounts for elements relatively-positioned below viewport", function() {
			reset.DEBUG = true;

			frame.add(
				"<div style='position: relative; top: " + (FRAME_HEIGHT+ 10) + "px; " +
				"width: 40px; height: 80px; background-color: green'>el</div>"
			);

			var expected = FRAME_HEIGHT + 10 + 80 + HTML_BORDER_TOP + BODY_BORDER_TOP;
			assert.objEqual(height.value(), Size.create(expected));
		});

		//it("accounts for elements absolutely-positioned to right of viewport", function() {
		//	//reset.DEBUG = true;
		//
		//	frame.add(
		//		"<div style='position: absolute; left: " + (FRAME_WIDTH + 10) + "px; " +
		//		"width: 40px; height: 80px; background-color: green'>el</div>"
		//	);
		//
		//	var expected = FRAME_WIDTH + 10 + 40;
		//	assert.objEqual(width.value(), Size.create(expected));
		//});
		//
		//it("ignores margin extending past right edge of viewport", function() {
		//	//reset.DEBUG = true;
		//
		//	var element = frame.add(
		//		"<div style='width: 100%; margin-right: 100px; height: 100px; " +
		//		"background-color: purple'>el</div>"
		//	);
		//
		//	assert.objEqual(width.value(), frame.viewport().width.value());
		//});
		//
		//it("ignores element positioned to left of viewport using negative margin", function() {
		//	//reset.DEBUG = true;
		//
		//	frame.add(
		//		"<div style='margin-left: -40px; " +
		//		"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
		//	);
		//
		//	assert.objEqual(width.value(), frame.viewport().width.value(), "width");
		//});
		//
		//it("ignores element positioned to left of viewport using negative position", function() {
		//	//reset.DEBUG = true;
		//
		//	frame.add(
		//		"<div style='position: relative; left: -40px; " +
		//		"width: 100px; height: 100px; background-color: purple;'>off-screen</div>"
		//	);
		//
		//	assert.objEqual(width.value(), frame.viewport().width.value(), "width");
		//});

	});


});