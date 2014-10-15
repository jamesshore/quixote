// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var XPosition = require("../values/x_position.js");
var YPosition = require("../values/y_position.js");

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
	if (this._position === "top" || this._position === "bottom") return new YPosition(value);
	if (this._position === "right" || this._position === "left") return new XPosition(value);

	ensure.unreachable();

	// TODO Factor out position strings into constants
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ [Number, Me] ]);

	var direction;

	var actualValue = this.is();
	if (typeof expected === "number") {
		if (actualValue.equals(expected)) return "";
		else return "Element '" + this._element.description() + "' " + this.description() + " expected " +
			expected + ", but was " + actualValue;
	}

	else {
		var expectedValue = expected.is();

		if (expected._position === "top" || expected._position === "bottom") {
			ensure.that(
				this._position === "top" || this._position === "bottom",
				"Can't compare " + this.description() + " to " + expected.description()
			);

			if (actualValue._position < expectedValue._position) direction = "higher";
			else direction = "lower";
		}
		else {
			ensure.that(
				this._position === "left" || this._position === "right",
				"Can't compare " + this.description() + " to " + expected.description()
			);

			if (actualValue._position < expectedValue._position) direction = "to the left";
			else direction = "to the right";
		}

		if (actualValue.equals(expectedValue)) return "";
		else return "Expected " + this.description() + " of element '" + this._element.description() +
			"' (" + actualValue + ") to match " + expected.description() + " of element '" +
			expected._element.description() + "' (" + expectedValue + "), but was " +
			Math.abs(expectedValue._position - actualValue._position) + "px " + direction;
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
