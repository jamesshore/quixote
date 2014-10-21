// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Value = require("./value.js");

describe("Value abstract base class", function() {

	it("can be extended", function() {
		function Subclass() {}

		Value.extend(Subclass);
		assert.type(new Subclass(), Value);
	});

	it("responds to value() with itself", function() {
		var a = new Example();
		assert.equal(a.value(), a);    // note identity comparison, not objEqual()
	});

	it("determines equality (relies on `diff()`)", function() {
		var a1 = new Example("a");
		var a2 = new Example("a");
		var b = new Example("b");

		assert.objEqual(a1, a2, "same");
		assert.objNotEqual(a1, b, "different");
	});


	function Example(value) {
		this._value = value;
	}
	Value.extend(Example);

	Example.prototype.diff = function diff(expected) {
		return (this._value === expected._value) ? "" : "different";
	};

	Example.prototype.toString = function toString() {
		return "" + this._value;
	};

});