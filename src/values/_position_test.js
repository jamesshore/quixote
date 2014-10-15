// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Position = require("./position.js");

describe.only("Position", function() {

	var x1 = Position.x(10);
	var x2 = Position.x(20);
	var x1b = Position.x(10);

	var y1 = Position.y(50);
	var y2 = Position.y(80);

	it("computes difference", function() {
		assert.equal(x1.diff(x1b), "", "same");

		assert.equal(x1.diff(x2), "10px to the left", "left");
		assert.equal(x2.diff(x1), "10px to the right", "right");

		assert.equal(y1.diff(y2), "30px lower", "lower");
		assert.equal(y2.diff(y1), "30px higher", "higher");
	});

	it("fails fast when computing difference between incompatible dimensions", function() {
		assert.exception(function() {
			x1.diff(y1);
		}, /Cannot compare X dimension to Y dimension/);
	});

	it("converts to string", function() {
		assert.equal(x1.toString(), "10px");
	});

	it("is comparable to itself", function() {
		assert.objEqual(x1, x1b, "same");
		assert.objNotEqual(x1, x2, "different");
	});

	it("is comparable to number", function() {
		assert.objEqual(x1, 10, "same");
		assert.objNotEqual(x1, 20, "different");
	});

	it("is not comparable to opposite dimension", function() {
		assert.exception(function() {
			x1.equals(y1);
		}, /Cannot compare X dimension to Y dimension/);
	});

});