// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var ViewportEdge = require("./viewport_edge.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

describe("ViewportEdge", function() {

	var top;
	var right;
	var bottom;
	var left;

	beforeEach(function() {
		var frame = reset.frame;

		top = ViewportEdge.top(frame);
		right = ViewportEdge.right(frame);
		bottom = ViewportEdge.bottom(frame);
		left = ViewportEdge.left(frame);
	});

	it("is a descriptor", function() {
		assert.implements(top, Descriptor);
	});

	it("default values match viewport size", function() {
		assert.objEqual(left.value(), Position.x(0), "left");
		assert.objEqual(top.value(), Position.y(0), "top");

		assert.objEqual(right.value(), Position.x(reset.WIDTH), "right");
		assert.objEqual(bottom.value(), Position.y(reset.HEIGHT), "bottom");
	});


});