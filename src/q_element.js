// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");

var Me = module.exports = function QElement(domElement) {
	ensure.signature(arguments, [ Object ]);

	this._domElement = domElement;
};

Me.prototype.getRawStyle = function(styleName) {
	ensure.signature(arguments, [ String ]);

	var styles = window.getComputedStyle(this._domElement);
	return styles.getPropertyValue(styleName);
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);

	return this._domElement;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._domElement.outerHTML;
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);

	return this._domElement === that._domElement;
};