// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");
var RelativeSize = require("./relative_size.js");
var SizeMultiple = require("./size_multiple.js");

var X_DIMENSION = "width";
var Y_DIMENSION = "height";

var Me = module.exports = function ElementSize(dimension, element) {
	var QElement = require("../q_element.js");    // break circular dependency
	ensure.signature(arguments, [ String, QElement ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._element = element;
};
SizeDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();
	return Size.create(position[this._dimension]);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._dimension + " of " + this._element;
};

function factoryFn(dimension) {
	return function factory(element) {
		return new Me(dimension, element);
	};
}