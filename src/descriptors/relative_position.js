// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");
var Pixels = require("../values/pixels.js");
var ElementSize = require("./element_size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";
var PLUS = "plus";
var MINUS = "minus";

var Me = module.exports = function RelativePosition(dimension, direction, relativeTo, relativeAmount) {
	var ElementEdge = require("./element_edge.js");       // require() here to break circular dependency
	var ElementCenter = require("./element_center.js");
	ensure.signature(arguments, [ String, String, [ElementEdge, ElementCenter], [Number, Descriptor] ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._direction = direction;
	this._relativeTo = relativeTo;
	this._amount = (typeof relativeAmount === "number") ? new Size(relativeAmount) : relativeAmount;
};
Descriptor.extend(Me);

Me.right = createFn(X_DIMENSION, PLUS);
Me.down = createFn(Y_DIMENSION, PLUS);
Me.left = createFn(X_DIMENSION, MINUS);
Me.up = createFn(Y_DIMENSION, MINUS);

function createFn(dimension, direction) {
	return function create(edge, relativeAmount) {
		return new Me(dimension, direction, edge, relativeAmount);
	};
}

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var baseValue = this._relativeTo.value();
	var relativeValue = this._amount.value();

	if (this._direction === PLUS) return baseValue.plus(relativeValue);
	else return baseValue.minus(relativeValue);
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
