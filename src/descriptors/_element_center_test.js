// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var Descriptor = require("./descriptor.js");
var ElementCenter = require("./element_center.js");
var Position = require("../values/position.js");

describe.only("ElementCenter", function() {

	var TOP = 10;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	var frame;
	var element;
	var center;

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
		center = new ElementCenter(element);
	});

	it("is a descriptor", function() {
		assert.type(center, Descriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(center.value(), Position.x(85));
	});

	it("converts comparison arguments", function() {
		assert.objEqual(center.convert(13), Position.x(13), "should convert numbers to positions");
		assert.equal(center.convert(center), center, "should return descriptors as-is");
	});

	it("converts to string", function() {
		assert.equal(center.toString(), "center of element '" + element.description() + "'");
	});

});