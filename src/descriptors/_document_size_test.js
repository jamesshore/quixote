// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset =require("../__reset.js");
var DocumentSize = require("./document_size.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");

describe("DocumentSize", function() {

	var BORDER = 4;

	var frame;
	var bodyStyle;
	var width;
	var height;

	beforeEach(function() {
		frame = reset.frame;
		width = DocumentSize.x(frame);
		height = DocumentSize.y(frame);

		bodyStyle = frame.toDomElement().contentDocument.body.style;
		bodyStyle.backgroundColor = "blue";
		bodyStyle.border = "solid 2px red";
	});

	afterEach(function() {
		if (reset.DEBUG) return;

		bodyStyle.backgroundColor = "";
		bodyStyle.border = "";
	});

	it("is a size descriptor", function() {
		assert.implements(width, SizeDescriptor);
	});

	it("handles content smaller than viewport", function() {
		frame.add(
			"<div style='width: 40px; height: 80px; background-color: green'>element</div>"
		);
		assert.objEqual(width.value(), frame.viewport().width.value(), "width should extend to edge of viewport");
		assert.objEqual(height.value(), Size.create(80 + BORDER), "height should collapse to content");
	});

	//it("handles content larger than viewport", function() {
	//
	//});
	
	//it("accounts for absolutely-positioned elements", function() {
	//	frame.add(
	//		"<div style='position: absolute; left: 10; top: 20;" +
	//		"width: 40px; height: 80px; background-color: green'>element</div>"
	//	);
	//	assert.objEqual(width.value(), frame.viewport().width.value(), "width should extend to edge of viewport");
	//	assert.objEqual(height.value(), Size.create(80 + BORDER), "height should collapse to content");
	//});

	// TODO: relative position; fixed position

});