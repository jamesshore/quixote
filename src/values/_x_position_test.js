// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var XPosition = require("./x_position.js");


describe("X Position", function() {

	it("converts to string", function() {
		var x1 = new XPosition(10);

		assert.equal(x1.toString(), "10px");
	});

	it("checks equality", function() {
		var x1a = new XPosition(10);
		var x1b = new XPosition(10);
		var x2 = new XPosition(20);

		assert.objEqual(x1a, x1b, "same");
		assert.objNotEqual(x1a, x2, "different");
	});

});