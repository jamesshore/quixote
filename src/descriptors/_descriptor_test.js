// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Value = require("../values/value.js");

describe("Descriptor abstract base class", function() {

	it("can be extended", function() {
		function Subclass() {}

		Descriptor.extend(Subclass);
		assert.type(new Subclass(), Descriptor);
	});

	describe("diff", function() {

		it("returns empty string when no difference", function() {
			var example = new Example("one");
			assert.equal(example.diff(example), "");
		});

		it("describes differences when descriptors resolve to different value", function() {
			var example1 = new Example("one");
			var example2 = new Example("two");

			assert.equal(
				example1.diff(example2),
				"Expected example one (one) to be same as example two (two), but was different"
			);
		});

		it("converts values before comparing them", function() {
			var example = new Example(1);
			assert.equal(example.diff(1), "");
		});

	});

	describe("error handling", function() {

		var example;

		beforeEach(function() {
			example = new Example(1);
		});

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

		it("fails nicely when diffing unsupported types", function() {
			assertPrimitiveError(true, "boolean");
			assertPrimitiveError("foo", "string");
			assertPrimitiveError(function() {}, "function");
			assertPrimitiveError(null, "null");
			assertPrimitiveError({}, "Object instances");

			function assertPrimitiveError(arg, expected) {
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

	Example.prototype.convert = function convert(arg) {
		if (typeof arg === "number") return new ExampleValue(arg);
		else return arg;
	};

	Example.prototype.value = function value() {
		return new ExampleValue(this._name);
	};

	Example.prototype.joiner = function joiner() { return "to be same as"; };

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
		else return "different";
	});

	ExampleValue.prototype.toString = function toString() {
		return this._name;
	};

});