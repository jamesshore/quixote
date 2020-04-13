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

	it("determines if two instances are compatible", function() {
		var example = new Example("example");

		assert.equal(example.isCompatibleWith(new Example("")), true, "same type");
		assert.equal(example.isCompatibleWith(new CompatibleExample()), true, "compatible");
		assert.equal(example.isCompatibleWith(new IncompatibleExample()), false, "incompatible");
		assert.equal(example.isCompatibleWith("primitive"), false, "primitives always incompatible");
	});

	describe("safety check", function() {

		it("does nothing when object is compatible", function() {
			assert.noException(function() {
				a1.diff(new CompatibleExample());
			}, "in compatibility list");
		});

		it("fails fast when operating on incompatible types", function() {
			check(undefined, "undefined");
			check(null, "null");
			check(true, "boolean");
			check("foo", "string");
			check(function() {}, "function");
			check({}, "Object");
			check(new IncompatibleExample(), "IncompatibleExample");

			function check(arg, expected) {
				assert.exception(function() {
					a1.diff(arg);
				}, "A descriptor doesn't make sense. (Example can't combine with " + expected + ")", expected);
			}
		});

	});

	function Example(value) {
		this._value = value;
	}
	Value.extend(Example);

	Example.prototype.compatibility = function compatibility() {
		return [ Example, CompatibleExample ];
	};

	Example.prototype.diff = Value.safe(function diff(expected) {
		return (this._value === expected._value) ? "" : "different";
	});

	Example.prototype.toString = function toString() {
		return "" + this._value;
	};

	function CompatibleExample() {}
	function IncompatibleExample() {}

});