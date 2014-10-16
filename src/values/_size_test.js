// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Size = require("./size.js");

describe("Size", function() {

	var a1 = new Size(52);
	var a2 = new Size(52);
	var b = new Size(7);

	it("responds to value()", function() {
		assert.equal(a1.value(), a1);    // note identity comparison, not objEqual()
	});

	it("determines difference", function() {
		assert.equal(a1.diff(b), "45px larger");
		assert.equal(b.diff(a1), "45px smaller");
	});

	it("equals()", function() {
		assert.objEqual(a1, a2, "same");
		assert.objNotEqual(a1, b, "different");
	});

	it("toString()", function() {
		assert.equal(a1.toString(), "52px");
	});

});