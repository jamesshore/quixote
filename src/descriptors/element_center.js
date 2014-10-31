// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementCenter(dimension, element) {
	var QElement = require("../q_element.js");    // break circular dependency
	ensure.signature(arguments, [ String, QElement ]);

	if (dimension === X_DIMENSION) PositionDescriptor.x(this);
	else if (dimension === Y_DIMENSION) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown dimension: " + dimension);

	this._dimension = dimension;
	this._element = element;
};
PositionDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();

	if (this._dimension === X_DIMENSION) return Position.x(position.left + ((position.right - position.left) / 2));
	else return Position.y(position.top + ((position.bottom - position.top) / 2));
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var description = (this._dimension === X_DIMENSION) ? "center" : "middle";
	return description + " of " + this._element;
};

function factoryFn(dimension) {
	return function(element) {
		return new Me(dimension, element);
	};
}
