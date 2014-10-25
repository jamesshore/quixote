// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function PageSize(dimension, document) {
	ensure.signature(arguments, [ String, Object ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._document = document;
};
Descriptor.extend(Me);

Me.x = function x(document) {
	return new Me(X_DIMENSION, document);
};

Me.y = function y(document) {
	return new Me(Y_DIMENSION, document);
};

Me.prototype.value = function() {
	var width = this._document.body.clientWidth;
	var height = this._document.body.clientHeight;
	var value = this._dimension === X_DIMENSION ? width : height;

	return Size.create(value);
};

Me.prototype.toString = function() {
	ensure.unreachable("TODO");
};