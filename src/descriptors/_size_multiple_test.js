// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var SizeMultiple = require("./size_multiple.js");
var Size = require("../values/size.js");

describe("SizeMultiple", function() {

	var WIDTH = 130;
	var HEIGHT = 60;

	var element;
	var twice;

	beforeEach(function() {
		var frame = reset.frame;
		frame.addElement(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>element</p>"
		);
		element = frame.getElement("#element");
		twice = SizeMultiple.create(element.width, 2);
	});

	it("resolves to value", function() {
//		assert.objEqual(twice.value(), new Size(WIDTH * 2));
	});

});