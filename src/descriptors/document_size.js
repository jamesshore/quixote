// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var QFrame = require("../q_frame.js");
var SizeDescriptor = require("./size_descriptor.js");

var X_DIMENSION = "width";
var Y_DIMENSION = "height";

var Me = module.exports = function DocumentSize(dimension, frame) {
	ensure.signature(arguments, [ String, QFrame ]);

	this._frame = frame;
};
SizeDescriptor.extend(Me);

Me.x = function x(frame) {
	return new Me(X_DIMENSION, frame);
};

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	return this._frame.viewport().width.value();
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	ensure.unreachable();
};