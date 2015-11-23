// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var shim = require("../util/shim.js");
var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var PositionDescriptor = require("./position_descriptor.js");
var ElementSize = require("./element_size.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

/**
 * ElementClipEdge normalizes the computed style of an element's clip rect, if one is set.
 * Attempts to access ElementClipEdge instances on an element where clip is not applied will result
 * in {@link ClipNotAppliedException} being thrown
 *
 * @param {QElement} element
 * @param {string} position the "top", "bottom", "left" or "right" of a clip's rect
 * @constructor
 */
function ElementClipEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement, String ]);

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._element = element;
	this._position = position;
}

PositionDescriptor.extend(ElementClipEdge);

ElementClipEdge.top = factoryFn(TOP);
ElementClipEdge.right = factoryFn(RIGHT);
ElementClipEdge.bottom = factoryFn(BOTTOM);
ElementClipEdge.left = factoryFn(LEFT);

ElementClipEdge.prototype.value = function value() {
	ensure.signature(arguments, []);

	var clipPosition = this._element.getRawClipPosition();

	if (!clipPosition) {
		throw new ClipNotAppliedException(ElementClipEdge.prototype.value,
			"clip " + this._position + " css style not applied to " + this._element);
	}

	var edge = clipPosition[this._position];
	var scroll = this._element.frame.getRawScrollPosition();

	if (this._position === RIGHT || this._position === LEFT) return Position.x(edge + scroll.x);
	else return Position.y(edge + scroll.y);
};

ElementClipEdge.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "clip " + this._position + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new ElementClipEdge(element, position);
	};
}

/**
 * <strong>require('./descriptors/element_clip_edge')</strong> &rArr; {@link ElementClipEdge}
 *
 * @module descriptors/element_clip_edge
 */
module.exports = ElementClipEdge;

/**
 * Thrown when {@link ElementClipEdge} is accessed on a {@link QElement} that has no <code>clip</code> css
 * style set
 *
 * @param {Function} fnToRemoveFromStackTrace
 * @param {string} message
 * @constructor
 */
function ClipNotAppliedException(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
}

ClipNotAppliedException.prototype = shim.Object.create(Error.prototype);
ClipNotAppliedException.prototype.constructor = ClipNotAppliedException;
ClipNotAppliedException.prototype.name = "ClipNotAppliedException";

exports.ClipNodeAppliedException = ClipNotAppliedException;
