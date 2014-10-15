// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var ElementEdge = require("./element_edge.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementPosition(dimension, edge, relativeAmount) {
//	ensure.signature(arguments, [ ElementEdge, Number ]);   // TODO: resolve circular dependency
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._edge = edge;
	this._amount = relativeAmount;
};

Me.x = function x(edge, relativeAmount) {
	return new Me(X_DIMENSION, edge, relativeAmount);
};

Me.y = function y(edge, relativeAmount) {
	return new Me(Y_DIMENSION, edge, relativeAmount);
};

Me.prototype.description = function description() {
	ensure.signature(arguments, []);

	if (this._amount === 0) return this._edge.description();

	var direction;
	if (this._dimension === X_DIMENSION) direction = (this._amount < 0) ? "left of" : "right of";
	else direction = (this._amount < 0) ? "above" : "below";

	return Math.abs(this._amount) + "px " + direction + " " + this._edge.description();
};