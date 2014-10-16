// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Descriptor = require("./descriptor.js");
var shim = require("../util/shim.js");

describe("Descriptor abstract base class", function() {

	it("can be extended", function() {
		function Subclass() {}

		Descriptor.extend(Subclass);
		assert.type(new Subclass(), Descriptor);
	});

	it("ensures that subclasses implement all required methods", function() {
		var desc = new Descriptor();
		assertEnsure(desc.value, "value");
		assertEnsure(desc.convert, "convert");
		assertEnsure(desc.describeMatch, "describeMatch");
		assertEnsure(desc.toString, "toString");

		function assertEnsure(fn, name) {
			assert.exception(function() {
				fn.call(desc);
			}, "Descriptor subclasses must implement " + name + "() method", name + "()");
		}
	});

});