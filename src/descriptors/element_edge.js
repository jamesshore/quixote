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
	return createPosition(this, value);
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ [Number, Me] ]);

	var actualValue = this.is();
	var expectedValue = (typeof expected === "number") ? createPosition(this, expected) : expected.is();

	if (actualValue.equals(expectedValue)) return "";

	if (typeof expected === "number") {
		return "Expected " + this.toString(actualValue) + " to be " + expectedValue +
			", but was " + actualValue.diff(expectedValue);
	}

	else {
		return "Expected " + this.toString(actualValue) + " to match " +
			expected.toString(expectedValue) + ", but was " + actualValue.diff(expectedValue);
	}

};

Me.prototype.description = function description() {
	ensure.signature(arguments, []);

	return this._position + " edge";
};

Me.prototype.toString = function toString(value) {
//	ensure.signature(arguments, [ [undefined, Object] ]);

	var result = this.description() + " of element '" + this._element.description() + "'";
	if (value) result += " (" + value + ")";
	return result;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function createPosition(self, value) {
	if (self._position === "top" || self._position === "bottom") return Position.y(value);
	if (self._position === "right" || self._position === "left") return new Position.x(value);

	ensure.unreachable();
}