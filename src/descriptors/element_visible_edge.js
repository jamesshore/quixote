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
		var element = this._element;
		var edge = elementEdge(this);
		var page = element.frame.page();

		if (element.bottom.value().compare(page.top.value()) < 0) return offscreen(this);

		return edge;
	};

	Me.prototype.toString = function() {
		ensure.unreachable();
	};

	function factoryFn(position) {
		return function factory(element) {
			return new Me(element, position);
		};
	}

	function elementEdge(self) {
		switch(self._position) {
			case TOP: return self._element.top.value();
			case RIGHT: return self._element.right.value();
			case BOTTOM: return self._element.bottom.value();
			case LEFT: return self._element.left.value();

			default:
				ensure.unreachable("Unknown position: " + self._position);
		}
	}

	function pageTopLeft(self) {
		var page = self._element.frame.page();
		switch(self._position) {
			case TOP:
			case BOTTOM:
				return page.top.value();
			case LEFT:
			case RIGHT:
				return page.left.value();

			default:
				ensure.unreachable("Unknown position: " + self._position);
		}
	}

	function offscreen(self) {
		switch(self._position) {
			case TOP:
			case BOTTOM:
				return Position.noY();
			case LEFT:
			case RIGHT:
				return Position.noX();

			default:
				ensure.unreachable("Unknown position: " + self._position);
		}
	}

}());