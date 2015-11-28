// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");
var RelativeSize = require("./relative_size.js");
var SizeMultiple = require("./size_multiple.js");

var X_DIMENSION = "width";
var Y_DIMENSION = "height";

var Me = module.exports = function ElementClipSize(dimension, position1, position2, description) {
	var QElement = require("../q_element.js");    // break circular dependency
	ensure.signature(arguments, [ String, PositionDescriptor, PositionDescriptor, String ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._position1 = position1;
	this._position2 = position2;
	this._description = description;
};
SizeDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);
	return this._position2.value().minus(this._position1.value());
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._description;
};

function factoryFn(dimension) {
	return function factory(position1, position2, description) {
		return new Me(dimension, position1, position2, description);
	};
}
