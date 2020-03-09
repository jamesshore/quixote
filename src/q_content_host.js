// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");

var Me = module.exports = function QContentHost(contentDocument) {
	// Cannot check against HTMLDocument directly because most browsers define HTMLDocument on the Window type
	// Since the document is in an iFrame its HTMLDocument definition is the iFrame window's HTMLDocument and
	// not the top level window's version.
	ensure.signature(arguments, [ Object ]);

    this._window = contentDocument.defaultView || contentDocument.parentWindow;

	// properties
    this.document = contentDocument;
};

Me.prototype.toDomElement = function toDomElement() {
    ensure.signature(arguments, []);

    return this._window;
};

Me.prototype.elementRendered = function elementRendered(element) {
    var QElement = require("./q_element.js");      // break circular dependency
    ensure.signature(arguments, [ QElement ]);

	var inDom = this.document.body.contains(element.toDomElement());
	var displayNone = element.getRawStyle("display") === "none";

	return inDom && !displayNone;
};

Me.prototype.getComputedStyle = function getComputedStyle(element) {
    var QElement = require("./q_element.js");      // break circular dependency
    ensure.signature(arguments, [ QElement ]);

	return this._window.getComputedStyle(element.toDomElement());
};

Me.prototype.body = function body() {
	var QElement = require("./q_element.js");      // break circular dependency
	ensure.signature(arguments, []);

	return new QElement(this.document.body, "body");
};

Me.prototype.viewport = function viewport() {
	var QViewport = require("./q_viewport.js");      // break circular dependency
	ensure.signature(arguments, []);
	
	return new QViewport(this);
};

Me.prototype.page = function page() {
	var QPage = require("./q_page.js");      // break circular dependency
	ensure.signature(arguments, []);
	
	return new QPage(this);
};

Me.prototype.add = function add(html, nickname) {
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = html;

	return this.body().add(html, nickname);
};

Me.prototype.get = function get(selector, nickname) {
	var QElement = require("./q_element.js");      // break circular dependency
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = selector;

	var nodes = this.document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0], nickname);
};

Me.prototype.getAll = function getAll(selector, nickname) {
	var QElementList = require("./q_element_list.js");      // break circular dependency
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = selector;

	return new QElementList(this.document.querySelectorAll(selector), nickname);
};

Me.prototype.scroll = function scroll(x, y) {
	ensure.signature(arguments, [Number, Number]);

	this._window.scroll(x, y);
};

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
    ensure.signature(arguments, []);

	return {
		x: shim.Window.pageXOffset(this._window, this.document),
		y: shim.Window.pageYOffset(this._window, this.document)
	};
};
