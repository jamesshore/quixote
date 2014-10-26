// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function PageSize(dimension, frame) {
	ensure.signature(arguments, [ String, Object ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._frame = frame;
};
Descriptor.extend(Me);

Me.x = function x(frame) {
	return new Me(X_DIMENSION, frame);
};

Me.y = function y(frame) {
	return new Me(Y_DIMENSION, frame);
};

Me.prototype.value = function() {
	var html = this._frame.get("html").toDomElement();

	// Width techniques I've tried: (Note that results are different in quirks mode)
	// documentElement.getBoundingClientRect().width
	//    works on Safari, Mobile Safari, Chrome, Firefox
	//    fails on IE 8, 9, 10: includes scrollbar
	// body.clientWidth
	// body.offsetWidth
	// body.getBoundingClientRect().width
	//    fails on all browsers: doesn't include margin
	// body.scrollWidth
	//    works on Safari, Mobile Safari, Chrome
	//    fails on Firefox, IE 8, 9, 10, 11: doesn't include margin
	// html.getBoundingClientRect().width
	// html.offsetWidth
	//    works on Safari, Mobile Safari, Chrome, Firefox
	//    fails on IE 8, 9, 10: includes scrollbar
	// html.clientWidth
	// html.scrollWidth
	//    WORKS!
	// not yet tried: contentWindow.*

	// Height techniques I've tried: (Note that results are different in quirks mode)
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

	var value = (this._dimension === X_DIMENSION) ? html.clientWidth : html.clientHeight;
	return Size.create(value);
};

Me.prototype.convert = function(value, type) {
	if (type === "number") return Size.create(value);
};

Me.prototype.toString = function() {
	var desc = (this._dimension === X_DIMENSION) ? "width" : "height";
	return desc + " of viewport";
};