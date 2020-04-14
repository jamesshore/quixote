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
function GenericSize() {
	return require("./generic_size.js");
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
	var should = Descriptor.prototype.createShould.call(this);

	should.beAbove = function(expected, message) {
		self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
			if (self._pdbc.dimension !== Y_DIMENSION) {
				throwCoordinateError("beAbove", "beLeftOf");
			}
			if (actualValue.compare(expectedValue) >= 0) {
				return errorMessage(1, actualValue, expectedValue, expectedDesc, message);
			}
		});
	};

	should.beBelow = function(expected, message) {
		self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
			if (self._pdbc.dimension !== Y_DIMENSION) {
				throwCoordinateError("beBelow", "beRightOf");
			}
			if (actualValue.compare(expectedValue) <= 0) {
				return errorMessage(-1, actualValue, expectedValue, expectedDesc, message);
			}
		});
	};

	should.beLeftOf = function(expected, message) {
		self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
			if (self._pdbc.dimension !== X_DIMENSION) {
				throwCoordinateError("beLeftOf", "beAbove");
			}
			if (actualValue.compare(expectedValue) >= 0) {
				return errorMessage(1, actualValue, expectedValue, expectedDesc, message);
			}
		});
	};

	should.beRightOf = function(expected, message) {
		self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
			if (self._pdbc.dimension !== X_DIMENSION) {
				throwCoordinateError("beRightOf", "beBelow");
			}
			if (actualValue.compare(expectedValue) <= 0) {
				return errorMessage(-1, actualValue, expectedValue, expectedDesc, message);
			}
		});
	};

	return should;

	function throwCoordinateError(functionName, recommendedName) {
		throw new Error(
			"Can't use 'should." + functionName + "()' on " + self._pdbc.dimension +
			" coordinates. Did you mean 'should." + recommendedName + "()'?"
		);
	}

	function errorMessage(direction, actualValue, expectedValue, expectedDesc, message) {
		var moreThanLessThan = direction === -1 ? "more than" : "less than";
		return message + self + " should be at least " + expectedValue.diff(self.plus(direction).value()) + ".\n" +
			"  Expected: " + moreThanLessThan + " " + expectedDesc + "\n" +
			"  But was:  " + actualValue;
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

Me.prototype.to = function(position) {
	ensure.signature(arguments, [[ Me, Number ]]);
	if (typeof position === "number") {
		if (this._pdbc.dimension === X_DIMENSION) position = AbsolutePosition().x(position);
		else position = AbsolutePosition().y(position);
	}
	if (this._pdbc.dimension !== position._pdbc.dimension) {
		throw new Error("Can't calculate distance between an X coordinate and a Y coordinate");
	}

	return GenericSize().create(this, position, "distance from " + this + " to " + position);
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
