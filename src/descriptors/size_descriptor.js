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

	var should = Descriptor.prototype.createShould.call(this);
	should.beBiggerThan = assertFn(-1, true);
	should.beSmallerThan = assertFn(1, false);
	return should;

	function assertFn(direction, shouldBeBigger) {
		return function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				if (expectedValue.isNone()) {
					throw new Error("'expected' value is not rendered, so relative comparisons aren't possible.");
				}

				var expectedMsg = (shouldBeBigger ? "more than" : "less than") + " " + expectedDesc;

				if (actualValue.isNone()) {
					return errorMessage(message, "rendered", expectedMsg, actualValue);
				}

				var compare = actualValue.compare(expectedValue);
				if ((shouldBeBigger && compare <= 0) || (!shouldBeBigger && compare >= 0)) {
					var nudge = shouldBeBigger ? -1 : 1;
					var shouldBe = "at least " + expectedValue.diff(self.plus(nudge).value());
					return errorMessage(message, shouldBe, expectedMsg, actualValue);
				}
			});
		};
	}

	function errorMessage(message, shouldBe, expected, actual) {
		return message + self + " should be " + shouldBe + ".\n" +
			"  Expected: " + expected + "\n" +
			"  But was:  " + actual;
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
