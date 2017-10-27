// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var SizeDescriptor = require("./size_descriptor.js");
var ViewportSize = require("./viewport_size.js");
var Size = require("../values/size.js");

describe("DESCRIPTOR: ViewportSize", function() {

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

	it("converts to string", function() {
		assert.equal(width.toString(), "width of viewport");
		assert.equal(height.toString(), "height of viewport");
	});

});