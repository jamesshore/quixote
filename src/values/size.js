// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Pixels = require("./pixels.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ [Number, Pixels] ]);

	this._value = (typeof value === "number") ? new Pixels(value) : value;
};

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	return this;
};

Me.prototype.plus = function(operand) {
	ensure.signature(arguments, [ Me ]);
	return new Me(this._value.plus(operand._value));
};

Me.prototype.minus = function(operand) {
	ensure.signature(arguments, [ Me ]);
	return new Me(this._value.minus(operand._value));
};

Me.prototype.compare = function(that) {
	ensure.signature(arguments, [ Me ]);
	return this._value.compare(that._value);
};

Me.prototype.diff = function(expected) {
	ensure.signature(arguments, [ Me ]);

	var actualValue = this._value;
	var expectedValue = expected._value;

	if (actualValue.equals(expectedValue)) return "";

	var desc = actualValue.compare(expectedValue) > 0 ? " larger" : " smaller";
	return actualValue.diff(expectedValue) + desc;
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);

	return this._value.equals(that._value);
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "be " + this;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._value.toString();
};

Me.prototype.toPixels = function() {
	ensure.signature(arguments, []);

	return this._value;
};