// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");

var Me = module.exports = function ElementEdge(element, position) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	this._element = element;
	this._position = position;
};

Me.top = factoryFn("top");
Me.right = factoryFn("right");
Me.bottom = factoryFn("bottom");
Me.left = factoryFn("left");

Me.prototype.is = function is() {
	ensure.signature(arguments, []);

	var value = this._element.getRawPosition()[this._position];
	if (this._position === "top" || this._position === "bottom") return Position.y(value);
	if (this._position === "right" || this._position === "left") return new Position.x(value);

	ensure.unreachable();

	// TODO Factor out position strings into constants
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ [Number, Me] ]);

	var direction;

	var actualValue = this.is();
//	var expectedValue = (typeof expected === number) ? expected : expected.is();

	if (typeof expected === "number") {
		if (actualValue.equals(expected)) return "";

		return "Expected " + this.description() + " of element '" + this._element.description() +
			"' (" + actualValue + ") to be " + expected + "px, but was " + actualValue.diff(expected);
	}

	else {
		var expectedValue = expected.is();

		if (actualValue.equals(expectedValue)) return "";
		else return "Expected " + this.description() + " of element '" + this._element.description() +
			"' (" + actualValue + ") to match " + expected.description() + " of element '" +
			expected._element.description() + "' (" + expectedValue + "), but was " + actualValue.diff(expectedValue);
	}

};

Me.prototype.description = function description() {
	ensure.signature(arguments, []);

	return this._position + " edge";
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}
