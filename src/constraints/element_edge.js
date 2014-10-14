// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var QElement = require("../q_element.js");

var Me = module.exports = function ElementEdge(element, position) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	this._element = element;
	this._position = position;
};

Me.top = function top(element) {
	return new Me(element, "top");
};

Me.right = function(element) {
	return new Me(element, "right");
};

Me.bottom = function(element) {
	return new Me(element, "bottom");
};

Me.left = function(element) {
	return new Me(element, "left");
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Number ]);

	var actual = value(this);
	if (expected === actual) return "";
	else return "Element top edge expected " + expected + ", but was " + actual;
};

function value(self) {
	return self._element.getRawPosition()[self._position];
}