// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Value = require("./value.js");

describe("Value abstract base class", function() {

	var a1;
	var a2;
	var b;

	beforeEach(function() {
		a1 = new Example("a");
		a2 = new Example("a");
		b = new Example("b");
	});

	it("can be extended", function() {
		function Subclass() {}

		Value.extend(Subclass);
		assert.type(new Subclass(), Value);
	});

	it("responds to value() with itself", function() {
		assert.equal(a1.value(), a1);    // note identity comparison, not objEqual()
	});

	it("determines equality (relies on `diff()`)", function() {
		assert.objEqual(a1, a2, "same");
		assert.objNotEqual(a1, b, "different");
	});

	it("provides way to fail fast when operating on incompatible objects", function() {
		assert.noException(function() {
			a1.diff(new Example2());
		}, "in compatibility list");

		assert.exception(function() {
			a1.diff({});
		}, /Example isn't compatible with Object/, "not compatible");
	});


	function Example(value) {
		this._value = value;
	}
	Value.extend(Example);

	Example.prototype.compatibility = function compatibility() {
		return [ Example, Example2 ];
	};

	Example.prototype.diff = Value.safe(function diff(expected) {
		return (this._value === expected._value) ? "" : "different";
	});

	Example.prototype.toString = function toString() {
		return "" + this._value;
	};

	function Example2() {}

});