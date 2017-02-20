// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var PositionDescriptor = require("./position_descriptor.js");
	var Position = require("../values/position.js");

	var TOP = "top";
	var RIGHT = "right";
	var BOTTOM = "bottom";
	var LEFT = "left";

	var Me = module.exports = function ElementVisibleEdge(element, position) {
		var QElement = require("../q_element.js");      // break circular dependency
		ensure.signature(arguments, [ QElement, String ]);

		if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
		else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
		else unknownPosition(position);

		this._element = element;
		this._position = position;
	};
	PositionDescriptor.extend(Me);

	Me.top = factoryFn(TOP);
	Me.right = factoryFn(RIGHT);
	Me.bottom = factoryFn(BOTTOM);
	Me.left = factoryFn(LEFT);

	Me.prototype.value = function() {
		var page = this._element.frame.page();
		var pageTop = page.top.value();
		var pageLeft = page.left.value();

		var elementTop = this._element.top.value();
		var elementRight = this._element.right.value();
		var elementBottom = this._element.bottom.value();
		var elementLeft = this._element.left.value();

		if (elementIsEntirelyOffscreen()) return offscreen(this);

		switch(this._position) {
			case TOP: return (elementTop.compare(pageTop) < 0) ? pageTop : elementTop;
			case RIGHT: return elementRight;
			case BOTTOM: return elementBottom;
			case LEFT: return (elementLeft.compare(pageLeft) < 0) ? pageLeft : elementLeft;

			default: unknownPosition(this._position);
		}

		function elementIsEntirelyOffscreen() {
			if (elementBottom.compare(pageTop) < 0) return true;
			if (elementRight.compare(pageLeft) < 0) return true;
			return false;
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

	function offscreen(self) {
		switch(self._position) {
			case TOP:
			case BOTTOM:
				return Position.noY();
			case LEFT:
			case RIGHT:
				return Position.noX();

			default: unknownPosition(self._position);
		}
	}

	function unknownPosition(position) {
		ensure.unreachable("Unknown position: " + position);
	}

}());