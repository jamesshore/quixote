// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var XPosition = require("./x_position.js");

describe("X Position", function() {

	var x1a = new XPosition(10);
	var x1b = new XPosition(10);
	var x2 = new XPosition(20);

	it("converts to string", function() {
		assert.equal(x1a.toString(), "10px");
	});

	it("is comparable to itself", function() {
		assert.objEqual(x1a, x1b, "same");
		assert.objNotEqual(x1a, x2, "different");
	});

	it("is comparable to number", function() {
		assert.objEqual(x1a, 10, "same");
		assert.objNotEqual(x1a, 20, "different");
	});

});