// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Size = require("../values/size.js");
var Descriptor = require("./descriptor.js");

var Me = module.exports = function RelativeSize(relativeTo, amount) {
	var ElementSize = require("./element_size.js");
	ensure.signature(arguments, [  ElementSize, Number ]);

	this._relativeTo = relativeTo;
	this._amount = amount;
};
Descriptor.extend(Me);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);
	return this._relativeTo.value().plus(new Size(this._amount));
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);

	if (typeof arg === "number") return new Size(arg);
	else return arg;
};

Me.prototype.joiner = function joiner() {
	return "to be";
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var desc = "";
	if (this._amount > 0) desc = this._amount + "px larger than ";
	else if (this._amount < 0) desc = Math.abs(this._amount) + "px smaller than ";

	return desc + this._relativeTo;
};