// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementEdge = require("./descriptors/element_edge.js");
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
