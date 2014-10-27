// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*jshint newcap:false */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

function RelativeSize() {
	return require("./relative_size.js");   	// break circular dependency
}

function SizeMultiple() {
	return require("./size_multiple.js");   	// break circular dependency
}

var Me = module.exports = function SizeDescriptor() {
	ensure.unreachable("SizeDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

Me.prototype.plus = function plus(amount) {
	return RelativeSize().larger(this, amount);
};

Me.prototype.minus = function minus(amount) {
	return RelativeSize().smaller(this, amount);
};

Me.prototype.times = function times(amount) {
	return SizeMultiple().create(this, amount);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return Size.create(arg);
};
