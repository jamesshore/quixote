// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

var Me = module.exports = function ElementSize(element) {
	// TODO: circular dependency prevents ensure.signature

	this._element = element;
};
Descriptor.extend(Me);

Me.x = function x(element) {
	return new Me(element);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();

	return new Size(position.width);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);
	if (typeof arg !== "number") return arg;

	return new Size(arg);
};

Me.prototype.describeMatch = function describeMatch() {
	return "match " + this.toString() + " (" + this.value() + ")";
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return "width of element '" + this._element.description() + "'";
};