// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var Me = module.exports = function Frame(domElement) {
	this._domElement = domElement;
	// TODO: fail fast
};

Me.create = function create() {
	var element = document.createElement("iframe");
	return new Me(element);
};

Me.prototype.toDomElement = function() {
	return this._domElement;
};