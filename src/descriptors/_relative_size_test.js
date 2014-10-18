// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var RelativeSize = require("./relative_size.js");
var Size = require("../values/size.js");
var Descriptor = require("./descriptor.js");

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

	it("is a descriptor", function() {
		assert.implements(x, Descriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(x.value(), new Size(125), "x");
		assert.objEqual(y.value(), new Size(70), "y");
	});

	it("converts arguments to comparable values", function() {
		assert.objEqual(x.convert(50), new Size(50), "number");
		assert.equal(x.convert(x), x, "descriptor");
	});

	it("converts to string", function() {
		assertString(element.width, 10, "10px larger than ", "larger");
		assertString(element.width, -15, "15px smaller than ", "smaller");
		assertString(element.width, 0, "", "same");

		function assertString(relativeTo, amount, expected, message) {
			assert.equal(new RelativeSize(relativeTo, amount).toString(), expected + relativeTo.toString(), message);
		}

	});


});