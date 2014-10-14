// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var QElement = require("../q_element.js");

var Me = module.exports = function ElementEdge(element) {
	this._element = element;
};

Me.top = function top(element) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	return new Me(element);
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Number ]);

	return "Element top edge expected " + expected + ", but was " + value(this);
};

function value(self) {
	return self._element.getRawPosition().top;
}