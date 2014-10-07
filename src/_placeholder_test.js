// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var placeholder = require("./placeholder.js");

describe("Arithmetic", function() {

	it("adds numbers", function() {
		assert.equal(7, placeholder.arithmetic(3, 4), "arithmetic");
	});

});