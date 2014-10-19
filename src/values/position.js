// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Pixels = require("./pixels.js");
var Size = require("./size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Position(dimension, value) {
	ensure.signature(arguments, [ String, [Number, Pixels] ]);

	this._dimension = dimension;
	this._edge = (typeof value === "number") ? new Pixels(value) : value;
};

Me.x = function x(value) {
	return new Me(X_DIMENSION, value);
};

Me.y = function y(value) {
	return new Me(Y_DIMENSION, value);
};

Me.prototype.plus = function plus(operand) {
	ensure.signature(arguments, [ [Me, Size] ]);

	if (operand instanceof Me) ensureComparable(this, operand);
	return new Me(this._dimension, this._edge.plus(operand.toPixels()));
};

Me.prototype.minus = function minus(operand) {
	ensure.signature(arguments, [ [Me, Size] ]);

	if (operand instanceof Me) ensureComparable(this, operand);
	return new Me(this._dimension, this._edge.minus(operand.toPixels()));
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this;
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Me ]);
	ensureComparable(this, expected);

	var actualValue = this._edge;
	var expectedValue = expected._edge;
	if (actualValue.equals(expectedValue)) return "";

	var direction;
	var comparison = actualValue.compare(expectedValue);
	if (this._dimension === X_DIMENSION) direction = comparison < 0 ? "to the left" : "to the right";
	else direction = comparison < 0 ? "lower" : "higher";

	return actualValue.diff(expectedValue) + " " + direction;
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);

	return (this.diff(that) === "");
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "be " + this;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._edge.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);

	return this._edge;
};

function ensureComparable(self, other) {
	ensure.that(self._dimension === other._dimension, "Can't compare X dimension to Y dimension");
}
