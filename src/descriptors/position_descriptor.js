// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*jshint newcap:false */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

function RelativePosition() {
	return require("./relative_position.js");   	// break circular dependency
}

var Me = module.exports = function PositionDescriptor(dimension) {
	ensure.signature(arguments, [ String ]);

	this._dimension = dimension;
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

Me.X_DIMENSION = "x";
Me.Y_DIMENSION = "y";

Me.prototype.plus = function plus(amount) {
	if (this._dimension === Me.X_DIMENSION) return RelativePosition().right(this, amount);
	else return RelativePosition().down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	if (this._dimension === Me.X_DIMENSION) return RelativePosition().left(this, amount);
	else return RelativePosition().up(this, amount);
};

Me.prototype.convert = function convert(arg, type) {
	if (type !== "number") return;

	return this._dimension === Me.X_DIMENSION ? Position.x(arg) : Position.y(arg);
};

