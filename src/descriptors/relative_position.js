// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");
var Pixels = require("../values/pixels.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function RelativePosition(dimension, relativeTo, relativeAmount) {
	var ElementEdge = require("./element_edge.js");
	var ElementCenter = require("./element_center.js");
	ensure.signature(arguments, [ String, [ElementEdge, ElementCenter], [Number, Size] ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._relativeTo = relativeTo;
	this._amount = (typeof relativeAmount === "number") ? new Size(relativeAmount) : relativeAmount;
};
Descriptor.extend(Me);

Me.x = function x(edge, relativeAmount) {
	return new Me(X_DIMENSION, edge, relativeAmount);
};

Me.y = function y(edge, relativeAmount) {
	return new Me(Y_DIMENSION, edge, relativeAmount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this._relativeTo.value().plus(this._amount);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);

	if (typeof arg === "number") return createPosition(this, arg);
	else return arg;
};

Me.prototype.joiner = function joiner() { return "to be"; };

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var pixels = this._amount.toPixels();
	var zero = new Pixels(0);
	var comparison = pixels.compare(zero);

	var description = "";
	if (comparison !== 0) {
		description = pixels.diff(zero);
		if (this._dimension === X_DIMENSION) description += (comparison < 0) ? " left of " : " right of ";
		else description += (comparison < 0) ? " above " : " below ";
	}
	return description + this._relativeTo.toString();
};

function createPosition(self, value) {
	if (self._dimension === X_DIMENSION) return Position.x(value);
	else return Position.y(value);
}
