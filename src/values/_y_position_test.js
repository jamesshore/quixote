// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var YPosition = require("./y_position.js");

describe.only("Y Position", function() {

	var y1a = new YPosition(10);
	var y1b = new YPosition(10);
	var y2 = new YPosition(20);

	it("converts to string", function() {
		assert.equal(y1a.toString(), "10px");
	});

	it("is comparable to itself", function() {
		assert.objEqual(y1a, y1b, "same");
		assert.objNotEqual(y1a, y2, "different");
	});

	it("is comparable to number", function() {
		assert.objEqual(y1a, 10, "same");
		assert.objNotEqual(y1a, 20, "different");
	});

});