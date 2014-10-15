// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	this._element = element;
	this._position = position;
};

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.is = function is() {
	ensure.signature(arguments, []);

	var value = this._element.getRawPosition()[this._position];
	return createPosition(this, value);
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ [Number, Me] ]);
	if (typeof expected === "number") expected = createPosition(this, expected);

	var actualValue = this.is();
	var expectedValue = expected.is();

	if (actualValue.equals(expectedValue)) return "";

	return "Expected " + this.toString(actualValue) +
		" to " + expected.describeMatch() +
		", but was " + actualValue.diff(expectedValue);
};

Me.prototype.description = function description() {
	ensure.signature(arguments, []);

	return this._position + " edge";
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "match " + this.toString(this.is());
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
	if (self._position === TOP || self._position === BOTTOM) return Position.y(value);
	if (self._position === RIGHT || self._position === LEFT) return new Position.x(value);

	ensure.unreachable();
}