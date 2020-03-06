// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");

var Me = module.exports = function QContent(contentDocument) {
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

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
    ensure.signature(arguments, []);

	return {
		x: shim.Window.pageXOffset(this._window, this.document),
		y: shim.Window.pageYOffset(this._window, this.document)
	};
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
