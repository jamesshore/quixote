// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var PositionDescriptor = require("./position_descriptor.js");
var shim = require("../util/shim.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [QElement, String]);

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._element = element;
	this._position = position;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var rawPosition = this._element.getRawPosition();

	var edge = rawPosition[this._position];
	var scroll = getRawScrollPosition(this);

	if (this._position === RIGHT || this._position === LEFT) {
		if (!elementRendered(this, rawPosition)) return Position.noX();
		return Position.x(edge + scroll.x);
	}
	else {
		if (!elementRendered(this, rawPosition)) return Position.noY();
		return Position.y(edge + scroll.y);
	}
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._position + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function elementRendered(self, rawPosition) {
	var element = self._element;

	var inDom = element.parentDocument().body.contains(element.toDomElement());
	var displayNone = element.getRawStyle("display") === "none";

	return inDom && !displayNone;
}

function getRawScrollPosition(self) {
	return {
		x: shim.Window.pageXOffset(self._element.parentWindow(), self._element.parentDocument()),
		y: shim.Window.pageYOffset(self._element.parentWindow(), self._element.parentDocument())
	};
}
