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

Me.prototype.plus = wrap(function(operand) {
	return new Me(this._edge.plus(operand._edge));
});

Me.prototype.minus = wrap(function(operand) {
	return new Me(this._edge.minus(operand._edge));
});

Me.prototype.compare = wrap(function(that) {
	return this._edge.compare(that._edge);
});

Me.prototype.diff = wrap(function(expected) {
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

function wrap(fn) {
	return function() {
		ensureCompatibility(arguments);
		return fn.apply(this, arguments);
	};
}

function ensureCompatibility(args) {
	for (var i = 0; i < args.length; i++) {   // args is not an Array, can't use forEach
		if (!(args[i] instanceof Me)) {
			throw new Error(oop.className(Me) + " isn't compatible with " + oop.instanceName(args[i]));
		}
	}
}