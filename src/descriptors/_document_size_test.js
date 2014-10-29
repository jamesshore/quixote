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
	var HTML_BORDER_RIGHT = 2;
	var BODY_BORDER_LEFT = 4;
	var BODY_BORDER_RIGHT = 8;

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
		htmlStyle.border = "solid 7px green";
		htmlStyle.borderLeft = "solid " + HTML_BORDER_LEFT + "px green";
		htmlStyle.borderRight = "solid " + HTML_BORDER_RIGHT + "px green";

		bodyStyle = contentDocument.body.style;
		bodyStyle.backgroundColor = "blue";
		bodyStyle.border = "solid 7px red";
		bodyStyle.borderLeft = "solid " + BODY_BORDER_LEFT + "px red";
		bodyStyle.borderRight = "solid " + BODY_BORDER_RIGHT + "px red";
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

	it("uses viewport width when html and body width is smaller than viewport", function() {
		//reset.DEBUG = true;

		bodyStyle.boxSizing = "content-box";
		bodyStyle.width = "75px";
		bodyStyle.height = "150px";
		htmlStyle.width = "100px";
		htmlStyle.height = "200px";

		assert.objEqual(width.value(), Size.create(FRAME_WIDTH));
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

	//it("doesn't include vertical scrollbar", function() {
	//	assert.fail("continue here");
	//});
	//
	//it("accounts for margin", function() {
	//	frame.add(
	//		"<div style='width: " + FRAME_WIDTH + "px; background-color: green; height: 100px; margin-left: 10px; margin-right: 20px;'>el</div>"
	//	);
	//
	//});

	// TODO: fixed position

	// TODO: padding, margin, border  (on element AND on body)

	// TODO: negative margin; negative absolute position

	// TODO: test case of <html> tag styled with width smaller than viewport

});