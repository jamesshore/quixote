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
	var bodyDom = body.toDomElement();

	var bodyPosition = body.getRawPosition();
	var marginLeft = pxToInt(body.getRawStyle("margin-left"));
	var marginRight = pxToInt(body.getRawStyle("margin-right"));
	var documentRect = docEl.getRawPosition();

	//dump("body width", bodyPosition.width);
	//dump("margin left", marginLeft);
	//dump("margin right", marginRight);
	//dump("documentElement left", documentRect.left);
	//dump("documentElement right", documentRect.right);

	//dump("documentRect.width", documentRect.width);
	//dump("client width", bodyDom.clientWidth);
	//dump("scroll width", bodyDom.scrollWidth);
	//dump("offset width", bodyDom.offsetWidth);

	//var width = bodyPosition.width + marginLeft + marginRight;

	// WORKAROUND IE 8, IE 9, IE 10: document bounding box includes vertical scrollbar
	// so this doesn't work: var width = documentRect.width;
	// WORKAROUND IE 9: body.clientWidth doesn't include margins
	// so this doesn't work: var width = bodyDom.clientWidth;
	var width = bodyDom.scrollWidth;

	// Height techniques I've tried:
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
	// html.scrollHeight
	//    works on Firefox, IE 8, 9, 10, 11
	//    fails on Safari, Mobile Safari, Chrome: only includes height of content
	// html.offsetHeight
	//    works on IE 8, 9, 10
	//    fails on IE 11, Safari, Mobile Safari, Chrome: only includes height of content
	// html.clientHeight
	//    WORKS!

	var htmlDom = this._frame.get("html").toDomElement();
	var height = htmlDom.clientHeight;



	// WORKAROUND Firefox 32: document bounding box collapses to body element
	// WORKAROUND IE 9: body.clientHeight doesn't include margins
	// ...so we try both and take whichever is larger
	// (Note: body.clientHeight *is* correct on IE 8 (!), IE 10, and IE 11.)
	//var height = Math.max(documentRect.height, bodyDom.clientHeight);



	var value = this._dimension === X_DIMENSION ? width : height;

	return Size.create(value);
};

Me.prototype.toString = function() {
	ensure.unreachable("TODO");
};

function pxToInt(px) {
	return parseInt(px, 10);
}