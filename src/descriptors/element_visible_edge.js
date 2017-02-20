// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var PositionDescriptor = require("./position_descriptor.js");

	var TOP = "top";
	var RIGHT = "right";
	var BOTTOM = "bottom";
	var LEFT = "left";

	var Me = module.exports = function ElementVisibleEdge(element, position) {
		var QElement = require("../q_element.js");      // break circular dependency
		ensure.signature(arguments, [ QElement, String ]);

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

	Me.prototype.value = function() {
		switch(this._position) {
			case TOP: return this._element.top.value();
			case RIGHT: return this._element.right.value();
			case BOTTOM: return this._element.bottom.value();
			case LEFT: return this._element.left.value();

			default:
				ensure.unreachable("Unknown position: " + this._position);
		}
	};

	Me.prototype.toString = function() {
		ensure.unreachable();
	};

	function factoryFn(position) {
		return function factory(element) {
			return new Me(element, position);
		};
	}

}());