// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var CssLength = require("./css_length.js");

var Me = module.exports = function NoPixels() {
	ensure.signature(arguments, [ ]);
};
CssLength.extend(Me);

Me.create = function create() {
	return new Me();
};

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function plus(operand) {
	return new Me();
});

Me.prototype.minus = Value.safe(function minus(operand) {
	return new Me();
});

Me.prototype.times = function times(operand) {
	ensure.signature(arguments, [ Number ]);

	return new Me();
};

Me.prototype.average = Value.safe(function average(operand) {
	return new Me();
});

Me.prototype.compare = Value.safe(function compare(operand) {
	return 0;
});

Me.prototype.diff = Value.safe(function diff(expected) {
	return "";
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "no length";
};
