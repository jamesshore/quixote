// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var PageSize = require("./page_size.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");

describe("DESCRIPTOR: PageSize", function() {

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
		width = PageSize.x(frame);
		height = PageSize.y(frame);

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

	it("converts to string", function() {
		assert.equal(width.toString(), "width of page");
		assert.equal(height.toString(), "height of page");
	});

});