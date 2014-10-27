// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var SizeDescriptor = require("./size_descriptor.js");
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
		frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.get("#element");
		width = ElementSize.x(element);
		height = ElementSize.y(element);
	});

	it("is a size descriptor", function() {
		assert.implements(width, SizeDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(width.value(), Size.create(WIDTH), "width");
		assert.objEqual(height.value(), Size.create(HEIGHT), "height");
	});

	it("converts to string", function() {
		assert.equal(width.toString(), "width of " + element);
		assert.equal(height.toString(), "height of " + element);
	});

});