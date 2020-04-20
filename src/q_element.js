// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementRender = require("./descriptors/element_render.js");
var ElementEdge = require("./descriptors/element_edge.js");
var Center = require("./descriptors/center.js");
var Span = require("./descriptors/span.js");
var Assertable = require("./assertable.js");

var Me = module.exports = function QElement(domElement, nickname) {
	ensure.signature(arguments, [ Object, String ]);

	this._domElement = domElement;
	this._nickname = nickname;

	// properties
	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.center = Center.x(this.left, this.right, "center of " + this);
	this.middle = Center.y(this.top, this.bottom, "middle of " + this);

	this.width = Span.create(this.left, this.right, "width of " + this);
	this.height = Span.create(this.top, this.bottom, "height of " + this);

	this.render = ElementRender.create(this);
	this.rendered = this.render;    // deprecated
};
Assertable.extend(Me);

Me.create = function(domElement, nickname) {
	ensure.signature(arguments, [ Object, [ undefined, String ] ]);

	if (nickname === undefined) {
		if (domElement.id !== "") nickname = "#" + domElement.id;
		else if (domElement.className !== "") nickname = "." + domElement.className.split(/\s+/).join(".");
		else nickname = "<" + domElement.tagName.toLowerCase() + ">";
	}
	return new Me(domElement, nickname);
};

Me.prototype.getRawStyle = function(styleName) {
	ensure.signature(arguments, [String]);

	var styles;
	var result;

	// WORKAROUND IE 8: no getComputedStyle()
	if (window.getComputedStyle) {
		// WORKAROUND Firefox 40.0.3: must use frame's contentWindow (ref https://bugzilla.mozilla.org/show_bug.cgi?id=1204062)
		styles = this.context().contentWindow.getComputedStyle(this._domElement);
		result = styles.getPropertyValue(styleName);
	}
	else {
		styles = this._domElement.currentStyle;
		result = styles[camelcase(styleName)];
	}
	if (result === null || result === undefined) result = "";
	return result;
};

Me.prototype.getRawPosition = function() {
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

Me.prototype.calculatePixelValue = function(sizeString) {
	var dom = this._domElement;
	if (dom.runtimeStyle !== undefined) return ie8Workaround();

	var result;
	var style = dom.style;
	var oldPosition = style.position;
	var oldLeft = style.left;

	style.position = "absolute";
	style.left = sizeString;
	result = parseFloat(this.getRawStyle("left"));    // parseInt strips off 'px' value

	style.position = oldPosition;
	style.left = oldLeft;
	return result;

	// WORKAROUND IE 8: getRawStyle() doesn't normalize values to px
	// Based on code by Dean Edwards: http://disq.us/p/myl99x
	function ie8Workaround() {
		var runtimeStyleLeft = dom.runtimeStyle.left;
		var styleLeft = dom.style.left;

		dom.runtimeStyle.left = dom.currentStyle.left;
		dom.style.left = sizeString;
		result = dom.style.pixelLeft;

		dom.runtimeStyle.left = runtimeStyleLeft;
		dom.style.left = styleLeft;
		return result;
	}
};

Me.prototype.parent = function(nickname) {
	ensure.signature(arguments, [[ undefined, String ]]);

	var parentBody = this.context().body();
	if (this.equals(parentBody)) return null;

	var parent = this._domElement.parentElement;
	if (parent === null) return null;

	return Me.create(parent, nickname);
};

Me.prototype.add = function(html, nickname) {
	ensure.signature(arguments, [ String, [ undefined, String ] ]);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = shim.String.trim(html);
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._domElement.appendChild(insertedElement);
	return Me.create(insertedElement, nickname);
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	shim.Element.remove(this._domElement);
};

Me.prototype.contains = function(element) {
	ensure.signature(arguments, [ Me ]);
	return this.toDomElement().contains(element.toDomElement());
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	return this._domElement;
};

Me.prototype.context = function() {
	ensure.signature(arguments, []);

	var BrowsingContext = require("./browsing_context.js");   // break circular dependency
	return new BrowsingContext(this._domElement.ownerDocument);
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return "'" + this._nickname + "'";
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);
	return this._domElement === that._domElement;
};
