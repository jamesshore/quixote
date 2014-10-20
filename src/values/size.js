// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var shim = require("../util/shim.js");
var Pixels = require("./pixels.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ [Number, Pixels] ]);

	this._edge = (typeof value === "number") ? new Pixels(value) : value;
};

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	return this;
};

Me.prototype.plus = function(operand) {
	ensureCompatibility(arguments, Me, "add");
	return new Me(this._edge.plus(operand._edge));
};

Me.prototype.minus = function(operand) {
	ensure.signature(arguments, [ Me ]);
	return new Me(this._edge.minus(operand._edge));
};

Me.prototype.compare = function(that) {
	ensure.signature(arguments, [ Me ]);
	return this._edge.compare(that._edge);
};

Me.prototype.diff = function(expected) {
	ensure.signature(arguments, [ Me ]);

	var actualValue = this._edge;
	var expectedValue = expected._edge;

	if (actualValue.equals(expectedValue)) return "";

	var desc = actualValue.compare(expectedValue) > 0 ? " larger" : " smaller";
	return actualValue.diff(expectedValue) + desc;
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);

	return this._edge.equals(that._edge);
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "be " + this;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._edge.toString();
};

Me.prototype.toPixels = function() {
	ensure.signature(arguments, []);

	return this._edge;
};

function ensureCompatibility(args) {
	if (!(args[0] instanceof Me)) {
		throw new Error(shim.Function.name(Me) + " isn't compatible with " + shim.Function.name(args[0].constructor));
	}

	ensure.signature(args, [ Me ]);
}