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
	var QElement = require("../q_element.js");

	var frameDoc = this._frame.toDomElement().contentDocument;
	var docEl = new QElement(frameDoc.documentElement, this._frame, "doc element");
	var body = this._frame.get("body");

	var bodyPosition = body.getRawPosition();
	var marginLeft = pxToInt(body.getRawStyle("margin-left"));
	var marginRight = pxToInt(body.getRawStyle("margin-right"));
	var documentRect = docEl.getRawPosition();

	//dump("body width", bodyPosition.width);
	//dump("margin left", marginLeft);
	//dump("margin right", marginRight);
	//dump("documentElement left", documentRect.left);
	//dump("documentElement right", documentRect.right);

	//var width = bodyPosition.width + marginLeft + marginRight;

	var width = documentRect.width;

	// WORKAROUND Firefox 32: document bounding box collapses to body element
	// WORKAROUND IE 9: body.clientHeight doesn't include margins
	// ...so we try both and take whichever is larger
	// (Note: body.clientHeight *is* correct on IE 8 (!), IE 10, and IE 11.)
	var height = Math.max(documentRect.height, body.toDomElement().clientHeight);



	var value = this._dimension === X_DIMENSION ? width : height;

	return Size.create(value);
};

Me.prototype.toString = function() {
	ensure.unreachable("TODO");
};

function pxToInt(px) {
	return parseInt(px, 10);
}