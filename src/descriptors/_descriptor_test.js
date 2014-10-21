// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");

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

		it("wraps diff errors in an explanation", function() {
			var example = new Example(1);
			var error = new ErrorDescriptor();

			assert.exception(function() {
				example.diff(error);
			}, "Can't compare " + example + " to " + error + ": ErrorDescriptor error");
		});

	});


	function Example(name) {
		ensure.signature(arguments, [ [String, Number] ]);
		this._name = name;
	}
	Descriptor.extend(Example);

	Example.prototype.convert = function convert(arg) {
		ensure.signature(arguments, [ [Descriptor, Number ]]);

		if (typeof arg === "number") return new Value(arg);
		else return arg;
	};

	Example.prototype.value = function value() {
		return new Value(this._name);
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


	function Value(name) {
		this._name = name;
	}

	Value.prototype.value = function value() {
		return this;
	};

	Value.prototype.diff = function diff(expected) {
		if (this.equals(expected)) return "";
		else return "different";
	};

	Value.prototype.equals = function equals(that) {
		ensure.signature(arguments, [ Value ]);

		return this._name === that._name;
	};

	Value.prototype.toString = function toString() {
		return this._name;
	};

});