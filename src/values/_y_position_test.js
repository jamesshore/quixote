// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var YPosition = require("./y_position.js");


describe("Y Position", function() {

	it("converts to string", function() {
		var y1 = new YPosition(10);

		assert.equal(y1.toString(), "10px");
	});

	it("checks equality", function() {
		var y1a = new YPosition(10);
		var y1b = new YPosition(10);
		var y2 = new YPosition(20);

		assert.objEqual(y1a, y1b, "same");
		assert.objNotEqual(y1a, y2, "different");
	});

});