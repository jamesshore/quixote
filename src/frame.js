// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var Me = module.exports = function Frame(domElement) {
	this._domElement = domElement;
	// TODO: fail fast
};

Me.create = function create(parentElement, width, height) {
	// TODO: ensure signature

	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	parentElement.appendChild(iframe);
	return new Me(iframe);
};

Me.prototype.toDomElement = function() {
	return this._domElement;
};