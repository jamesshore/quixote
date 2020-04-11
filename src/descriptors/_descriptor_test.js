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

		it("checks equality", function() {
			assert.noException(
				function() { example.should.equal(1); },
				"equal"
			);

			assert.exception(
				function() { example.should.equal(2); },
				example.diff(2),
				"not equal"
			);

			assert.exception(
				function() { example.should.equal(2, "my message"); },
				"my message: " + example.diff(2),
				"not equal with a message"
			);
		});

	});


	describe("diff", function() {

		it("returns empty string when no difference", function() {
			assert.equal(example.diff(example), "");
		});

		it("describes differences between a descriptor and a value", function() {
			assert.equal(
				example.diff(2),
				"example 1 should be larger.\n" +
					"  Expected: 2\n" +
					"  But was:  1"
			);
		});

		it("describes differences between two descriptors", function() {
			assert.equal(
				example.diff(new Example(2)),
				"example 1 should be larger.\n" +
					"  Expected: 2 (example 2)\n" +
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


	function Example(number) {
		ensure.signature(arguments, [ [String, Number] ]);
		this.should = this.createShould();
		this._number = number;
	}
	Descriptor.extend(Example);

	Example.prototype.convert = function convert(arg, type) {
		if (type === "number") return new ExampleValue(arg);
	};

	Example.prototype.value = function value() {
		return new ExampleValue(this._number);
	};

	Example.prototype.toString = function toString() {
		return "example " + this._number;
	};


	function ErrorDescriptor(name) {}
	Descriptor.extend(ErrorDescriptor);

	ErrorDescriptor.prototype.value = function value() {
		throw new Error("ErrorDescriptor error");
	};

	ErrorDescriptor.prototype.toString = function toString() {
		return "ErrorDescriptor";
	};


	function ExampleValue(number) {
		this._number = number;
	}
	Value.extend(ExampleValue);

	ExampleValue.prototype.compatibility = function compatibility() {
		return [ ExampleValue ];
	};

	ExampleValue.prototype.value = function value() {
		return this;
	};

	ExampleValue.prototype.diff = Value.safe(function diff(expected) {
		var difference = this._number - expected._number;

		if (difference > 0) return "larger";
		else if (difference < 0) return "smaller";
		else return "";
	});

	ExampleValue.prototype.toString = function toString() {
		return this._number;
	};

});