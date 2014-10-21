// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ [Number, Pixels] ]);

	this._edge = (typeof value === "number") ? new Pixels(value) : value;
};
Value.extend(Me);

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function(operand) {
	return new Me(this._edge.plus(operand._edge));
});

Me.prototype.minus = Value.safe(function(operand) {
	return new Me(this._edge.minus(operand._edge));
});

Me.prototype.compare = Value.safe(function(that) {
	return this._edge.compare(that._edge);
});

Me.prototype.diff = Value.safe(function(expected) {
	var actualValue = this._edge;
	var expectedValue = expected._edge;

	if (actualValue.equals(expectedValue)) return "";

	var desc = actualValue.compare(expectedValue) > 0 ? " larger" : " smaller";
	return actualValue.diff(expectedValue) + desc;
});

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return this._edge.toString();
};

Me.prototype.toPixels = function() {
	ensure.signature(arguments, []);
	return this._edge;
};
