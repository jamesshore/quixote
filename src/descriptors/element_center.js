// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

var Me = module.exports = function ElementCenter(element) {
	// TODO: ensure.signature (circular dependency)

	this._element = element;
};
Descriptor.extend(Me);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();
	return Position.x(position.left + ((position.right - position.left) / 2));
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor ]]);

	if (typeof arg === "number") return Position.x(arg);
	else return arg;
};

Me.prototype.toString = function toString() {
	return "center of element '" + this._element.description() + "'";
};