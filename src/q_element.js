// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var Me = module.exports = function QElement(domElement) {
	this._domElement = domElement;
};

Me.prototype.toDomElement = function() {
	return this._domElement;
};

Me.prototype.equals = function(that) {
	return this._domElement === that._domElement;
};