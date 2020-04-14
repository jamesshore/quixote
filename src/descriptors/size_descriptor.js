// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint new-cap: "off" */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

function RelativeSize() {
	return require("./relative_size.js");   	// break circular dependency
}

function SizeMultiple() {
	return require("./size_multiple.js");   	// break circular dependency
}

var Me = module.exports = function SizeDescriptor() {
	ensure.unreachable("SizeDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

Me.prototype.createShould = function() {
	var self = this;
	var notRendered = Size.createNone();
	var should = Descriptor.prototype.createShould.call(this);

	should.beBiggerThan = function(expected, message) {
		self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
			if (expectedValue.equals(notRendered)) {
				throwBadExpectation();
			}
			if (actualValue.equals(notRendered) || actualValue.compare(expectedValue) <= 0) {
				return errorMessage(-1, actualValue, expectedValue, expectedDesc, message);
			}
		});
	};

	should.beSmallerThan = function(expected, message) {
		self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
			if (expectedValue.equals(notRendered)) {
				throwBadExpectation();
			}
			if (actualValue.equals(notRendered) || actualValue.compare(expectedValue) >= 0) {
				return errorMessage(1, actualValue, expectedValue, expectedDesc, message);
			}
		});
	};

	return should;

	function throwBadExpectation() {
		throw new Error("'expected' value is not rendered, so relative comparisons aren't possible.");
	}

	function errorMessage(direction, actualValue, expectedValue, expectedDesc, message) {
		var moreThanLessThan = direction === -1 ? "more than" : "less than";
		var atLeast = actualValue.equals(notRendered) ? "" : "at least ";
		return message + self + " should be " + atLeast + expectedValue.diff(self.plus(direction).value()) + ".\n" +
			"  Expected: " + moreThanLessThan + " " + expectedDesc + "\n" +
			"  But was:  " + actualValue;
	}
};

Me.prototype.plus = function plus(amount) {
	return RelativeSize().larger(this, amount);
};

Me.prototype.minus = function minus(amount) {
	return RelativeSize().smaller(this, amount);
};

Me.prototype.times = function times(amount) {
	return SizeMultiple().create(this, amount);
};

Me.prototype.convert = function convert(arg, type) {
	switch(type) {
		case "number": return Size.create(arg);
		case "string": return arg === "none" ? Size.createNone() : undefined;
		default: return undefined;
	}
};
