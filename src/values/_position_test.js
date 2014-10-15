// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Position = require("./position.js");

describe("X Position", function() {

	var x1a = Position.x(10);
	var x1b = Position.x(10);
	var x2 = Position.x(20);

	var y1a = Position.y(50);

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

	it("is not comparable to opposite dimension", function() {
		assert.exception(function() {
			x1a.equals(y1a);
		}, /Cannot compare X dimension to Y dimension/);
	});

});