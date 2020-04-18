// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint new-cap: "off" */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

// break circular dependencies
function RelativePosition() {
	return require("./relative_position.js");
}
function AbsolutePosition() {
	return require("./absolute_position.js");
}
function Span() {
	return require("./span.js");
}

var X_DIMENSION = "X";
var Y_DIMENSION = "Y";

var Me = module.exports = function PositionDescriptor(dimension) {
	ensure.signature(arguments, [ String ]);
	ensure.unreachable("PositionDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

function factoryFn(dimension) {
	return function factory(self) {
		// _pdbc: "PositionDescriptor base class." An attempt to prevent name conflicts.
		self._pdbc = { dimension: dimension };
	};
}

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.createShould = function() {
	var self = this;
	var noX = Position.noX();
	var noY = Position.noY();

	var should = Descriptor.prototype.createShould.call(this);
	should.beAbove = assertFn("beAbove", "beLeftOf", Y_DIMENSION, false);
	should.beBelow = assertFn("beBelow", "beRightOf", Y_DIMENSION, true);
	should.beLeftOf = assertFn("beLeftOf", "beAbove", X_DIMENSION, false);
	should.beRightOf = assertFn("beRightOf", "beBelow", X_DIMENSION, true);
	return should;

	function assertFn(functionName, otherAxisName, dimension, shouldBeBigger) {
		return function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				if (self._pdbc.dimension !== dimension) {
					throwCoordinateError(functionName, otherAxisName);
				}
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

	function throwCoordinateError(functionName, recommendedName) {
		throw new Error(
			"Can't use 'should." + functionName + "()' on " + self._pdbc.dimension +
			" coordinates. Did you mean 'should." + recommendedName + "()'?"
		);
	}

	function errorMessage(message, shouldBe, expected, actual) {
		return message + self + " should be " + shouldBe + ".\n" +
			"  Expected: " + expected + "\n" +
			"  But was:  " + actual;
	}
};

Me.prototype.plus = function(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().right(this, amount);
	else return RelativePosition().down(this, amount);
};

Me.prototype.minus = function(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().left(this, amount);
	else return RelativePosition().up(this, amount);
};

Me.prototype.to = function(position, nickname) {
	ensure.signature(arguments, [[ Me, Number ], [ undefined, String ]]);

	if (typeof position === "number") {
		if (this._pdbc.dimension === X_DIMENSION) position = AbsolutePosition().x(position);
		else position = AbsolutePosition().y(position);
	}
	if (this._pdbc.dimension !== position._pdbc.dimension) {
		throw new Error("Can't span between an X coordinate and a Y coordinate");
	}

	if (nickname === undefined) nickname = "span from " + this + " to " + position;
	return Span().create(this, position, nickname);
};

Me.prototype.convert = function(arg, type) {
	switch (type) {
		case "number": return this._pdbc.dimension === X_DIMENSION ? Position.x(arg) : Position.y(arg);
		case "string":
			if (arg === "none") return this._pdbc.dimension === X_DIMENSION ? Position.noX() : Position.noY();
			else return undefined;
			break;
		default: return undefined;
	}
};
