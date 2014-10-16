// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var Descriptor = require("./descriptor.js");

var Me = module.exports = function ElementSize(element) {
	// TODO: circular dependency prevents ensure.signature

	this._element = element;
};
Descriptor.extend(Me);

Me.x = function x(element) {
	return new Me(element);
};