// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Value = require("../values/value.js");

describe("DESCRIPTOR: Abstract base class", function() {

	var example;

	beforeEach(function() {
		example = new Example(1);
	});

	it("can be extended", function() {
		function Subclass() {}

		Descriptor.extend(Subclass);
		assert.type(new Subclass(), Descriptor);
	});


	describe("assertions", function() {


	});


	describe("diff", function() {

		it("returns empty string when no difference", function() {
			assert.equal(example.diff(example), "");
		});

		it("describes differences between a descriptor and a value", function() {
			assert.equal(
				example.diff(2),
				"example 1 was different than expected.\n" +
					"  Expected: 2\n" +
					"  But was:  1"
			);
		});

		it("describes differences between two descriptors", function() {
			assert.equal(
				example.diff(new Example("two")),
				"example 1 was different than expected.\n" +
					"  Expected: two (example two)\n" +
					"  But was:  1"
			);
		});

		it("converts values before comparing them", function() {
			assert.equal(example.diff(1), "");
		});

	});


	describe("error handling", function() {

		it("wraps diff errors in an explanation", function() {
			var error = new ErrorDescriptor();

			assert.exception(function() {
				example.diff(error);
			}, "Can't compare " + example + " to " + error + ": ErrorDescriptor error");
		});

		it("fails nicely when diffing 'undefined' accidentally", function() {
			assert.exception(function() {
				example.diff(undefined);
			}, "Can't compare example 1 to undefined. Did you misspell a property name?");
		});

		it("fails nicely when diffing against unrecognized primitives (and similar hardcoded values)", function() {
			assertError(true, "true");
			assertError("foo", "'foo'");
			assertError(null, "null");
			assertError(function() {}, "a function");
			assertError({}, "Object instances");

			function assertError(arg, expected) {
				assert.exception(function() {
					example.diff(arg);
				}, "Can't compare example 1 to " + expected + ".");
			}
		});

		it("doesn't fail when diffing arbitrary value object", function() {
			assert.noException(function() {
				example.diff(new ExampleValue());
			});
		});

	});


	function Example(name) {
		ensure.signature(arguments, [ [String, Number] ]);
		this._name = name;
	}
	Descriptor.extend(Example);

	Example.prototype.convert = function convert(arg, type) {
		if (type === "number") return new ExampleValue(arg);
	};

	Example.prototype.value = function value() {
		return new ExampleValue(this._name);
	};

	Example.prototype.toString = function toString() {
		return "example " + this._name;
	};


	function ErrorDescriptor(name) {}
	Descriptor.extend(ErrorDescriptor);

	ErrorDescriptor.prototype.value = function value() {
		throw new Error("ErrorDescriptor error");
	};

	ErrorDescriptor.prototype.toString = function toString() {
		return "ErrorDescriptor";
	};


	function ExampleValue(name) {
		this._name = name;
	}
	Value.extend(ExampleValue);

	ExampleValue.prototype.compatibility = function compatibility() {
		return [ ExampleValue ];
	};

	ExampleValue.prototype.value = function value() {
		return this;
	};

	ExampleValue.prototype.diff = Value.safe(function diff(expected) {
		if (this._name === expected._name) return "";
		else return "different than expected";
	});

	ExampleValue.prototype.toString = function toString() {
		return this._name;
	};

});