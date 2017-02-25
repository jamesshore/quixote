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

	function factoryFn(position) {
		return function factory(element) {
			return new Me(element, position);
		};
	}

	Me.prototype.value = function() {
		var position = this._position;
		var element = this._element;
		var page = element.frame.page();

		var bounds = findOverflowBounds(element, {
			top: page.top.value(),
			right: null,
			bottom: null,
			left: page.left.value()
		});

		bounds = findClipBounds(element, bounds);

		var edges = intersection(
			bounds,
			element.top.value(),
			element.right.value(),
			element.bottom.value(),
			element.left.value()
		);

		if (clippedOutOfExistence(bounds, edges)) return offscreen(position);
		else return edge(edges, position);
	};

	Me.prototype.toString = function() {
		ensure.unreachable();
	};

	function findClipBounds(element, bounds) {
		var clip = element.getRawStyle("clip");
		if (clip === "auto") return bounds;

		// TEMPORARY WORKAROUND: IE 8 'auto'
		if (clip === "" && element.getRawStyle("clip-top") === "auto") return bounds;

		var clipEdges = normalizeClipProperty(element, clip);
		return intersection(
			bounds,
			element.top.value().plus(clipEdges.top),
			element.left.value().plus(clipEdges.right),
			element.top.value().plus(clipEdges.bottom),
			element.left.value().plus(clipEdges.left)
		);
	}

	function normalizeClipProperty(element, clip) {
		// WORKAROUND IE 8: No 'clip' property (instead, uses clipTop, clipRight, etc.)
		var clipValues = clip === "" ? extractIe8Clip(element) : parseStandardClip(clip);
		// console.log(clipValues);

		return {
			top: Position.y(Number(clipValues[0])),
			right: Position.x(Number(clipValues[1])),
			bottom: Position.y(Number(clipValues[2])),
			left: Position.x(Number(clipValues[3]))
		};

		function parseStandardClip(clip) {
			var clipRegex = /rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)/;
			var matches = clipRegex.exec(clip);
			ensure.that(matches !== null, "Unable to parse clip property: " + clip);

			return [ matches[1], matches[2], matches[3], matches[4] ];
		}

		function extractIe8Clip(element) {
			return [
				parsePx(element.getRawStyle("clip-top")),
				parsePx(element.getRawStyle("clip-right")),
				parsePx(element.getRawStyle("clip-bottom")),
				parsePx(element.getRawStyle("clip-left"))
			];
		}

		function parsePx(pxString) {
			var pxRegex = /(\d+)px/;
			var matches = pxRegex.exec(pxString);
			ensure.that(matches !== null, "Unable to parse pixel string in clip property: " + pxString);

			return matches[1];
		}
	}

	function findOverflowBounds(element, bounds) {
		for (var container = element.parent(); container !== null; container = container.parent()) {
			if (clippedByAncestorOverflow(element, container)) {
				bounds = intersection(
					bounds,
					container.top.value(),
					container.right.value(),
					container.bottom.value(),
					container.left.value()
				);
			}
		}

		return bounds;
	}

	function clippedByAncestorOverflow(element, ancestor) {
		return hasClippablePosition(element) && hasClippingOverflow(ancestor);
	}

	function hasClippablePosition(element) {
		var position = element.getRawStyle("position");
		switch (position) {
			case "static":
			case "relative":
			case "absolute":
			case "sticky":
				return true;
			case "fixed":
				return false;
			default:
				ensure.unreachable("Unknown position property: " + position);
		}
	}

	function hasClippingOverflow(element) {
		var overflow = element.getRawStyle("overflow");
		switch (overflow) {
			case "hidden":
			case "scroll":
			case "auto":
				return true;
			case "visible":
				return false;
			default:
				ensure.unreachable("Unknown overflow property: " + overflow);
		}
	}

	function intersection(bounds, top, right, bottom, left) {
		bounds.top = bounds.top.max(top);
		bounds.right = (bounds.right === null) ? right : bounds.right.min(right);
		bounds.bottom = (bounds.bottom === null) ? bottom : bounds.bottom.min(bottom);
		bounds.left = bounds.left.max(left);

		return bounds;
	}

	function clippedOutOfExistence(bounds, edges) {
		return (bounds.top.compare(edges.bottom) > 0) ||
			(bounds.right !== null && bounds.right.compare(edges.left) < 0) ||
			(bounds.bottom !== null && bounds.bottom.compare(edges.top) < 0) ||
			(bounds.left.compare(edges.right) > 0);
	}

	function offscreen(position) {
		switch(position) {
			case TOP:
			case BOTTOM:
				return Position.noY();
			case LEFT:
			case RIGHT:
				return Position.noX();
			default: unknownPosition(position);
		}
	}

	function edge(edges, position) {
		switch(position) {
			case TOP: return edges.top;
			case RIGHT: return edges.right;
			case BOTTOM: return edges.bottom;
			case LEFT: return edges.left;
			default: unknownPosition(position);
		}
	}

	function unknownPosition(position) {
		ensure.unreachable("Unknown position: " + position);
	}

}());