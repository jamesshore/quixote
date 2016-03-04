// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var Value = require("./value.js");

describe("VALUE: abstract base class", function() {

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

	describe("safety check", function() {

		it("does nothing when object is in compatibility list", function() {
			assert.noException(function() {
				a1.diff(new Example2());
			}, "in compatibility list");
		});

		it("fails fast when operating on incompatible types", function() {
			check(undefined, "undefined");
			check(null, "null");
			check(true, "boolean");
			check("foo", "string");
			check(function() {}, "function");
			check({}, "Object");

			function check(arg, expected) {
				assert.exception(function() {
					a1.diff(arg);
				}, "Example isn't compatible with " + expected, expected);
			}
		});

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