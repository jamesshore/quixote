// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var RelativeSize = require("./relative_size.js");
var Size = require("../values/size.js");

describe("RelativeSize", function() {

	var element;
	var x;
	var y;

	beforeEach(function() {
		var frame = reset.frame;
		frame.addElement(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.getElement("#element");
		x = new RelativeSize(element.width, -5);
		y = new RelativeSize(element.height, 10);
	});

	it("resolves to value", function() {
		assert.objEqual(x.value(), new Size(125), "x");
//		assert.objEqual(y.value(), Position.y(70), "y");
	});

});