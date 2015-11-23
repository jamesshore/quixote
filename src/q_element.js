// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementClipEdge = require("./descriptors/element_clip_edge.js");
var Center = require("./descriptors/center.js");
var ElementSize = require("./descriptors/element_size.js");
var Assertable = require("./assertable.js");

var Me = module.exports = function QElement(domElement, frame, nickname) {
	var QFrame = require("./q_frame.js");    // break circular dependency
	ensure.signature(arguments, [ Object, QFrame, String ]);

	this._domElement = domElement;
	this._nickname = nickname;

	this.frame = frame;

	// properties
	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.clip = {
		top: ElementClipEdge.top(this),
		right: ElementClipEdge.right(this),
		bottom: ElementClipEdge.bottom(this),
		left: ElementClipEdge.left(this)
	};

	this.center = Center.x(this.left, this.right, "center of '" + nickname + "'");
	this.middle = Center.y(this.top, this.bottom, "middle of '" + nickname + "'");

	this.width = ElementSize.x(this);
	this.height = ElementSize.y(this);
};
Assertable.extend(Me);

Me.prototype.getRawStyle = function getRawStyle(styleName) {
	ensure.signature(arguments, [ String ]);

	var styles;
	var result;

	// WORKAROUND IE 8: no getComputedStyle()
	if (window.getComputedStyle) {
		// WORKAROUND Firefox 40.0.3: must use frame's contentWindow (ref https://bugzilla.mozilla.org/show_bug.cgi?id=1204062)
		styles = this.frame.toDomElement().contentWindow.getComputedStyle(this._domElement);
		result = styles.getPropertyValue(styleName);
	}
	else {
		styles = this._domElement.currentStyle;
		result = styles[camelcase(styleName)];
	}
	if (result === null || result === undefined) result = "";
	return result;
};

Me.prototype.getRawPosition = function getRawPosition() {
	ensure.signature(arguments, []);

	// WORKAROUND IE 8: No TextRectangle.height or .width
	var rect = this._domElement.getBoundingClientRect();
	return {
		left: rect.left,
		right: rect.right,
		width: rect.width !== undefined ? rect.width : rect.right - rect.left,

		top: rect.top,
		bottom: rect.bottom,
		height: rect.height !== undefined ? rect.height : rect.bottom - rect.top
	};
};

var PX_TEST_CSS_STYLES = "padding: 0; margin: 0; border: 0; visibility: hidden; position: absolute; height: 0";

/**
 * Given an element in the DOM, compute the ratio of px to a css length unit in the context of element's parent
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length for discussion of CSS length
 * @param {(Element|Node)} element a DOM element
 * @param {string} unit a css length unit code: "px", "em", "pt", "rem", etc
 * @returns {number} multiplier yielding the number of css px for 1 of unit
 */
function computeCssUnitToCssPxRatio(element, unit) {
	var parent = element.parentNode;

	if(unit !== "px" && parent) {
		var testEl = element.ownerDocument.createElement("div");
		testEl.setAttribute("style", PX_TEST_CSS_STYLES + "; width: 100" + unit + ";");
		parent.appendChild(testEl);
		var ratio = testEl.offsetWidth / 100;
		parent.removeChild(testEl);
		return ratio;
	}

	return 1;
}

var LENGTH_EXPR_PATTERN = /([0-9\.]+)([a-zA-Z]+)/;

/**
 * Calculate a number of px given an element and a CSS length expression
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length for discussion of CSS length
 * @param {(Element|Node)} element The element context under which the CSS length will be computed
 * @param {string} lengthExpr a CSS length expr
 * @returns {number} computed length of lengthExpr in CSS px units
 */
function computeCssPxForLengthInElement(element, lengthExpr) {
	var matches = lengthExpr.match(LENGTH_EXPR_PATTERN);

	if(!matches) {
		ensure.unreachable("CSS length expression expected, got " + lengthExpr);
	}

	// convert the parsed number part of the lengthExpr to px by multiplying it by the computed ratio of lengthExpr's
	// css unit to css px units.
	return parseFloat(matches[1]) * computeCssUnitToCssPxRatio(element, matches[2]);
}

/**
 * Compute the top component of a CSS clip's rect in px units
 *
 * @param {(Element|Node)} element
 * @param {string} lengthExpr
 * @returns {number} top component in css px units
 */
function computeClipTopPxHeight(element, lengthExpr) {
	return computeCssPxForLengthInElement(element, (lengthExpr === "auto") ? "0px" : lengthExpr);
}

/**
 * Compute the right component of a CSS clip's rect in px units
 *
 * @param {(Element|Node)} element
 * @param {string} lengthExpr
 * @returns {number} right component in css px units
 */
function computeClipRightPxWidth(element, lengthExpr) {
	if(lengthExpr === "auto") {
		// "auto" for clip rect's right component will be the width of the element, enclosing the borders but not the
		// margins.  offsetWidth gives us this value

		return element.offsetWidth;
	}

	return computeCssPxForLengthInElement(element, lengthExpr);
}

/**
 * Compute the bottom component of a CSS clip's rect in px units
 *
 * @param {(Element|Node)} element
 * @param {string} lengthExpr
 * @returns {number} bottom component in css px units
 */
function computeClipBottomPxHeight(element, lengthExpr) {
	if(lengthExpr === "auto") {
		// "auto" for clip rect's bottom component will be the height of the element, enclosing the borders but not the
		// margins.  offsetHeight gives us this value

		return element.offsetHeight;
	}

	return computeCssPxForLengthInElement(element, lengthExpr);
}

/**
 * Compute the left component of a CSS clip's rect in px units
 *
 * @param {(Element|Node)} element
 * @param {string} lengthExpr
 * @returns {number} right component in css px units
 */
function computeClipLeftPxWidth(element, lengthExpr) {
	return computeCssPxForLengthInElement(element, (lengthExpr === "auto") ? "0px" : lengthExpr);
}


/**
 * Relative offsets from top-left of an element's padding box representing the computed rect for its CSS clip style
 *
 * <p>Computed width between top/bottom and left/right edges also included
 *
 * @name ClipRect
 * @typedef {Object}
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 * @property {number} left
 * @property {number} width
 * @property {number} height
 */

var UNSET_CLIP_STYLES = [ "", "auto", "unset", "initial" ];
var CLIP_RECT_PATTERN = /[\s]*rect[\s]*\([\s]*([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s,]+)[\s,]+([^\s,]+)[\s]*\)[\s]*/;

/**
 * Get the computed clip rect for a QElement
 *
 * @returns {(ClipRect|null)} If clip is set on this QElement returns an {@link ClipRect}, otherwise null
 */
Me.prototype.getRawClipPosition = function getRawClipPosition() {
	ensure.signature(arguments, []);

	var rect = this.getRawStyle("clip");

	if(rect === "") {
		// As a fallback for IE8 for when it can't fork over the original clip css style, try generating a clip rect
		// using clip components that currentStyle may have.  If we see non-empty strings for all four components, we'll
		// build out a clip rect expression here ...

		var clipLeft = this.getRawStyle("clip-left");
		var clipRight = this.getRawStyle("clip-right");
		var clipBottom = this.getRawStyle("clip-bottom");
		var clipTop = this.getRawStyle("clip-top");

		if(clipLeft && clipRight && clipBottom && clipTop) {
			rect = "rect(" + clipTop + " " + clipRight + " " + clipBottom + " " + clipLeft + ")";
		}
	}

	for (var i = 0, ii = UNSET_CLIP_STYLES.length; i < ii; i++) {
		if (UNSET_CLIP_STYLES[i] === rect) {
			return null;
		}
	}

	var matches = rect.match(CLIP_RECT_PATTERN);
	if(!matches) {
		ensure.unreachable("Unknown clip css style: " + rect);
	}

	// values in a clip's rect may be a css length or "auto" which means "clip over the edge's border"
	var topPx = computeClipTopPxHeight(this._domElement, matches[1]);
	var rightPx = computeClipRightPxWidth(this._domElement, matches[2]);
	var bottomPx = computeClipBottomPxHeight(this._domElement, matches[3]);
	var leftPx = computeClipLeftPxWidth(this._domElement, matches[4]);

	return {
		left: leftPx,
		right: rightPx,
		width: rightPx - leftPx,

		top: topPx,
		bottom: bottomPx,
		height: bottomPx - topPx
	};
};

Me.prototype.toDomElement = function toDomElement() {
	ensure.signature(arguments, []);
	return this._domElement;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "'" + this._nickname + "'";
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);
	return this._domElement === that._domElement;
};
