// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var quixote = require("../quixote.js");
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
		if (clip === "" && element.getRawStyle("clip-top") === "auto") {
			return bounds;
		}

		var clipEdges = normalizeClipProperty(element, clip);
		return intersection(
			bounds,
			clipEdges.top === "auto" ? element.top.value() : element.top.value().plus(Position.y(Number(clipEdges.top))),
			clipEdges.right === "auto" ? element.right.value() : element.left.value().plus(Position.x(Number(clipEdges.right))),
			clipEdges.bottom === "auto" ? element.bottom.value() : element.top.value().plus(Position.y(Number(clipEdges.bottom))),
			clipEdges.left === "auto" ? element.left.value() : element.left.value().plus(Position.x(Number(clipEdges.left)))
		);
	}

	function normalizeClipProperty(element, clip) {
		// WORKAROUND IE 8: No 'clip' property (instead, uses clipTop, clipRight, etc.)
		var clipValues = clip === "" ? extractIe8Clip(element) : parseStandardClip(element, clip);

		return {
			top: clipValues[0],
			right: clipValues[1],
			bottom: clipValues[2],
			left: clipValues[3]
		};

		function parseStandardClip(element, clip) {
			// WORKAROUND IE 11, Chrome Mobile 44: Reports 0px instead of 'auto' when computing rect() in clip property.
			ensure.that(!quixote.browser.misreportsAutoValuesInClipProperty(),
				"Can't determine element clipping values on this browser because it misreports the value of the `clip`" +
				" property. You can use `quixote.browser.misreportsAutoValuesInClipProperty()` to skip this browser."
			);

			var clipRegex = /rect\((\d+px|auto),? (\d+px|auto),? (\d+px|auto),? (\d+px|auto)\)/;
			var matches = clipRegex.exec(clip);
			ensure.that(matches !== null, "Unable to parse clip property: " + clip);

			return [
				parsePx(matches[1]),
				parsePx(matches[2]),
				parsePx(matches[3]),
				parsePx(matches[4])
			];
		}

		function extractIe8Clip(element) {
			var result = [
				calculatePixelValue(element, element.getRawStyle("clip-top")),
				calculatePixelValue(element, element.getRawStyle("clip-right")),
				calculatePixelValue(element, element.getRawStyle("clip-bottom")),
				calculatePixelValue(element, element.getRawStyle("clip-left"))
			];
			console.log(result);
			return result;
		}

		function parsePx(pxString) {
			if (pxString === "auto") return pxString;

			var pxRegex = /(\d+)px/;
			var matches = pxRegex.exec(pxString);
			ensure.that(matches !== null, "Unable to parse pixel string in clip property: " + pxString);

			return matches[1];
		}
	}

	function calculatePixelValue(element, clipStr) {
		var elementDom = element.toDomElement();

		// Based on code by Dean Edwards: http://disq.us/p/myl99x
		var runtimeStyle = elementDom.runtimeStyle.left;
		var style = elementDom.style.left;

		elementDom.runtimeStyle.left = elementDom.currentStyle.left;
		elementDom.style.left = clipStr;
		var result = elementDom.style.pixelLeft;

		elementDom.runtimeStyle.left = runtimeStyle;
		elementDom.style.left = style;
		return result;
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