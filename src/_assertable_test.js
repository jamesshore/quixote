// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Assertable = require("./assertable.js");

describe("Assertable abstract base class", function() {

	it("can be extended", function() {
		function Subclass() {}

		Assertable.extend(Subclass);
		assert.type(new Subclass(), Assertable);
	});

});