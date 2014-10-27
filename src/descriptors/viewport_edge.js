// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ViewportEdge(position, frame) {
	var QFrame = require("../q_frame.js");    // break circular dependency
	ensure.signature(arguments, [ String, QFrame ]);
	ensure.that(
		position === TOP || position === RIGHT || position === BOTTOM || position === LEFT,
		"Unknown position: " + position
	);

	this._position = position;
	this._frame = frame;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

function factoryFn(position) {
	return function factory(frame) {
		return new Me(position, frame);
	};
}

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	switch(this._position) {
		case TOP: return Position.y(0);
		case RIGHT: return Position.x(this._frame.viewport().width.value().toPixels());
		case BOTTOM: return Position.y(this._frame.viewport().height.value().toPixels());
		case LEFT: return Position.x(0);

		default: ensure.unreachable();
	}
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return "TODO";
};
