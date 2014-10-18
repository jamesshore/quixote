// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var Descriptor = require("./descriptor.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
	ensure.signature(arguments, [ require("../q_element.js"), String ]);

	this._element = element;
	this._value = position;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.plus = function plus(amount) {
	ensure.signature(arguments, [ Number ]);
	if (this._value === TOP || this._value === BOTTOM) return RelativePosition.y(this, amount);
	if (this._value === RIGHT || this._value === LEFT) return RelativePosition.x(this, amount);

	ensure.unreachable();
};

Me.prototype.minus = function minus(amount) {
	return this.plus(amount * -1);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var result = this._element.getRawPosition()[this._value];
	return createPosition(this, result);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);

	if (typeof arg === "number") return createPosition(this, arg);
	else return arg;
};

Me.prototype.joiner = function joiner() { return "to match"; };

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._value + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function createPosition(self, value) {
	if (self._value === TOP || self._value === BOTTOM) return Position.y(value);
	if (self._value === RIGHT || self._value === LEFT) return Position.x(value);

	ensure.unreachable();
}