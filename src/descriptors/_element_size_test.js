// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var Descriptor = require("./descriptor.js");
var ElementSize = require("./element_size.js");

describe("ElementSize", function() {

	var WIDTH = 130;
	var HEIGHT = 60;

	var frame;
	var element;
	var width;

	before(function(done) {
		frame = quixote.createFrame(500, 500, { stylesheet: "/base/src/__reset.css" }, done);
	});

	after(function() {
		frame.remove();
	});

	beforeEach(function() {
		frame.reset();

		frame.addElement(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		element = frame.getElement("#one");
		width = ElementSize.x(element);
	});

	it("is a descriptor", function() {
		assert.type(width, Descriptor);
	});

});