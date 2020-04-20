// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var quixote = require("../quixote.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var QPage = require("../q_page.js");
var Size = require("../values/size.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementVisibleEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement, String ]);

	this.should = this.createShould();

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

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._position + " rendered edge of " + this._element;
};

Me.prototype.value = function() {
	var position = this._position;
	var element = this._element;
	var page = element.context().page();

	if (element.top.value().equals(Position.noY())) return notRendered(position);
	if (element.width.value().equals(Size.create(0))) return notRendered(position);
	if (element.height.value().equals(Size.create(0))) return notRendered(position);

	ensure.that(
		!hasClipPathProperty(element),
		"Can't determine element rendering because the element is affected by the 'clip-path' property, " +
		"which Quixote doesn't support."
	);

	var bounds = {
		top: page.top.value(),
		right: null,
		bottom: null,
		left: page.left.value()
	};

	bounds = intersectionWithOverflow(element, bounds);
	bounds = intersectionWithClip(element, bounds);

	var edges = intersection(
		bounds,
		element.top.value(),
		element.right.value(),
		element.bottom.value(),
		element.left.value()
	);

	if (isClippedOutOfExistence(bounds, edges)) return notRendered(position);
	else return edge(edges, position);
};

function hasClipPathProperty(element) {
	var clipPath = element.getRawStyle("clip-path");
	return clipPath !== "none" && clipPath !== "";
}

function intersectionWithOverflow(element, bounds) {
	for (var container = element.parent(); container !== null; container = container.parent()) {
		if (isClippedByAncestorOverflow(element, container)) {
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

function intersectionWithClip(element, bounds) {
	// WORKAROUND IE 8: Doesn't have any way to detect 'clip: auto' value.
	ensure.that(!quixote.browser.misreportsClipAutoProperty(),
		"Can't determine element rendering on this browser because it misreports the value of the" +
		" `clip: auto` property. You can use `quixote.browser.misreportsClipAutoProperty()` to skip this browser."
	);

	for ( ; element !== null; element = element.parent()) {
		var clip = element.getRawStyle("clip");
		if (clip === "auto" || !canBeClippedByClipProperty(element)) continue;

		var clipEdges = normalizeClipProperty(element, clip);
		bounds = intersection(
			bounds,
			clipEdges.top,
			clipEdges.right,
			clipEdges.bottom,
			clipEdges.left
		);
	}

	return bounds;
}

function normalizeClipProperty(element, clip) {
	var clipValues = parseClipProperty(element, clip);

	return {
		top: clipValues[0] === "auto" ?
			element.top.value() :
			element.top.value().plus(Position.y(Number(clipValues[0]))),
		right: clipValues[1] === "auto" ?
			element.right.value() :
			element.left.value().plus(Position.x(Number(clipValues[1]))),
		bottom: clipValues[2] === "auto" ?
			element.bottom.value() :
			element.top.value().plus(Position.y(Number(clipValues[2]))),
		left: clipValues[3] === "auto" ?
			element.left.value() :
			element.left.value().plus(Position.x(Number(clipValues[3])))
	};

	function parseClipProperty(element, clip) {
		// WORKAROUND IE 11, Chrome Mobile 44: Reports 0px instead of 'auto' when computing rect() in clip property.
		ensure.that(!quixote.browser.misreportsAutoValuesInClipProperty(),
			"Can't determine element rendering on this browser because it misreports the value of the `clip`" +
			" property. You can use `quixote.browser.misreportsAutoValuesInClipProperty()` to skip this browser."
		);

		var clipRegex = /rect\((.*?),? (.*?),? (.*?),? (.*?)\)/;
		var matches = clipRegex.exec(clip);
		ensure.that(matches !== null, "Unable to parse clip property: " + clip);

		return [
			parseLength(matches[1], clip),
			parseLength(matches[2], clip),
			parseLength(matches[3], clip),
			parseLength(matches[4], clip)
		];
	}

	function parseLength(pxString, clip) {
		if (pxString === "auto") return pxString;

		var pxRegex = /^(.*?)px$/;
		var matches = pxRegex.exec(pxString);
		ensure.that(matches !== null, "Unable to parse '" + pxString + "' in clip property: " + clip);

		return matches[1];
	}
}

function isClippedByAncestorOverflow(element, ancestor) {
	return canBeClippedByOverflowProperty(element) && hasClippingOverflow(ancestor);
}

function canBeClippedByOverflowProperty(element) {
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
	return clips("overflow-x") || clips("overflow-y");

	function clips(style) {
		var overflow = element.getRawStyle(style);
		switch (overflow) {
			case "hidden":
			case "scroll":
			case "auto":
				return true;
			case "visible":
				return false;
			default:
				ensure.unreachable("Unknown " + style + " property: " + overflow);
		}
	}
}

function canBeClippedByClipProperty(element) {
	var position = element.getRawStyle("position");
	switch (position) {
		case "absolute":
		case "fixed":
			return true;
		case "static":
		case "relative":
		case "sticky":
			return false;
		default:
			ensure.unreachable("Unknown position property: " + position);
	}
}

function intersection(bounds, top, right, bottom, left) {
	bounds.top = bounds.top.max(top);
	bounds.right = (bounds.right === null) ? right : bounds.right.min(right);
	bounds.bottom = (bounds.bottom === null) ? bottom : bounds.bottom.min(bottom);
	bounds.left = bounds.left.max(left);

	return bounds;
}

function isClippedOutOfExistence(bounds, edges) {
	return (bounds.top.compare(edges.bottom) >= 0) ||
		(bounds.right !== null && bounds.right.compare(edges.left) <= 0) ||
		(bounds.bottom !== null && bounds.bottom.compare(edges.top) <= 0) ||
		(bounds.left.compare(edges.right) >= 0);
}

function notRendered(position) {
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