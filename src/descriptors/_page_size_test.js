// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var Descriptor = require("./descriptor.js");
var PageSize = require("./page_size.js");
var Size = require("../values/size.js");

describe("PageSize", function() {

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
		width = PageSize.x(contentDoc);
		height = PageSize.y(contentDoc);
	});

	it("is a descriptor", function() {
		assert.implements(width, Descriptor);
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

	//it("resolves to value", function() {
	//	assert.objEqual(width.value(), Size.create(WIDTH), "width");
	//	assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	//});
	//
	//it("converts comparison arguments", function() {
	//	assert.objEqual(width.convert(13, "number"), Size.create(13), "converts numbers to sizes");
	//});
	//
	//it("converts to string", function() {
	//	assert.equal(width.toString(), "width of " + element);
	//	assert.equal(height.toString(), "height of " + element);
	//});
	//
	//it("can be arithmaticated (yes, that's a word now)", function() {
	//	assert.objEqual(width.plus(10).value(), Size.create(WIDTH + 10), "bigger");
	//	assert.objEqual(width.minus(10).value(), Size.create(WIDTH - 10), "smaller");
	//	assert.objEqual(width.times(3).value(), Size.create(WIDTH * 3), "multiplied");
	//});
	//
	//it("can be modified (but not multiplied) by the size of another element", function() {
	//	assert.objEqual(width.plus(element.width).value(), Size.create(WIDTH + WIDTH), "plus");
	//	assert.objEqual(width.minus(element.height).value(), Size.create(WIDTH - HEIGHT), "minus");
	//});

});