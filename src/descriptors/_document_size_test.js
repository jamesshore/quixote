// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset =require("../__reset.js");
var DocumentSize = require("./document_size.js");
var SizeDescriptor = require("./size_descriptor.js");

describe("DocumentSize", function() {

	var frame;
	var bodyStyle;
	var width;

	beforeEach(function() {
		frame = reset.frame;
		width = DocumentSize.x(frame);

		bodyStyle = frame.toDomElement().contentDocument.body.style;
		bodyStyle.backgroundColor = "blue";
		bodyStyle.border = "solid 1px red";
	});

	afterEach(function() {
		if (reset.DEBUG) return;

		bodyStyle.backgroundColor = "";
		bodyStyle.border = "";
	});

	it("is a size descriptor", function() {
		assert.implements(width, SizeDescriptor);
	});

	it("extends width of viewport even when element is smaller than viewport", function() {
		assert.objEqual(width.value(), frame.viewport().width.value());
	});

});