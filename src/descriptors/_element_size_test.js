// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var Descriptor = require("./descriptor.js");
var ElementSize = require("./element_size.js");
var Size = require("../values/size.js");

describe("ElementSize", function() {

	var WIDTH = 130;
	var HEIGHT = 60;

	var element;
	var width;
	var height;

	beforeEach(function() {
		var frame = reset.frame;
		frame.addElement(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.getElement("#element");
		width = ElementSize.x(element);
		height = ElementSize.y(element);
	});

	it("is a descriptor", function() {
		assert.implements(width, Descriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("converts comparison arguments", function() {
		assert.objEqual(width.convert(13, "number"), Size.create(13), "converts numbers to sizes");
	});

	it("converts to string", function() {
		assert.equal(width.toString(), "width of " + element);
		assert.equal(height.toString(), "height of " + element);
	});

	it("can be arithmaticated (yes, that's a word now)", function() {
		assert.objEqual(width.plus(10).value(), Size.create(WIDTH + 10), "bigger");
		assert.objEqual(width.minus(10).value(), Size.create(WIDTH - 10), "smaller");
		assert.objEqual(width.times(3).value(), Size.create(WIDTH * 3), "multiplied");
	});

	it("can be modified (but not multiplied) by the size of another element", function() {
		assert.objEqual(width.plus(element.width).value(), Size.create(WIDTH + WIDTH), "plus");
		assert.objEqual(width.minus(element.height).value(), Size.create(WIDTH - HEIGHT), "minus");
	});

});