// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ Number ]);
	ensure.that(value >= 0, "Doesn't make sense to have negative size, but got " + value);

	this._value = value;
};

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	return this;
};

Me.prototype.diff = function(expected) {
	ensure.signature(arguments, [ Me ]);

	var actualValue = this._value;
	var expectedValue = expected._value;

	var desc = actualValue > expectedValue ? "px larger" : "px smaller";
	return Math.abs(actualValue - expectedValue) + desc;
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);

	return this._value === that._value;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._value + "px";
};