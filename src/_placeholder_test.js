// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var placeholder = require("./placeholder.js");

describe("Nothing", function() {

	it("runs tests", function() {
		assert.equal(placeholder.nothing(), "nothing");
	});

});