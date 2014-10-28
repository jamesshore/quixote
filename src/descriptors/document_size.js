// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var QFrame = require("../q_frame.js");
var SizeDescriptor = require("./size_descriptor.js");

var X_DIMENSION = "width";
var Y_DIMENSION = "height";

var Me = module.exports = function DocumentSize(dimension, frame) {
	ensure.signature(arguments, [ String, QFrame ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._frame = frame;
};
SizeDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	// Height techniques I've tried:
	// body.getBoundingClientRect().height
	//    fails on all browsers: doesn't account for relative or absolutely positioned elements


	// documentElement.getBoundingClientRect().height
	//    works on IE 8, 9, 10, 11;
	//    fails on Safari, Mobile Safari, Chrome, Firefox: only includes height of content
	// body.clientHeight
	// body.offsetHeight
	// body.getBoundingClientRect().height
	//    fails on all browsers: only includes height of content
	// body getComputedStyle("height")
	//    fails on all browsers: IE8 returns "auto"; others only include height of content
	// body.scrollHeight
	//    works on Safari, Mobile Safari, Chrome;
	//    fails on Firefox, IE 8, 9, 10, 11: only includes height of content
	// documentElement.clientHeight, offsetHeight, scrollHeight
	//    no such property (undefined)
	// html.offsetHeight
	//    works on IE 8, 9, 10
	//    fails on IE 11, Safari, Mobile Safari, Chrome: only includes height of content
	// html.scrollHeight
	//    works on Firefox, IE 8, 9, 10, 11
	//    fails on Safari, Mobile Safari, Chrome: only includes height of content
	// html.clientHeight
	//    WORKS! Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11
	// not yet tried: contentWindow.*


	if (this._dimension === X_DIMENSION) return this._frame.viewport().width.value();
	else return this._frame.body().height.value();
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	ensure.unreachable();
};

function factoryFn(dimension) {
	return function factory(frame) {
		return new Me(dimension, frame);
	};
}