// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");

var Me = module.exports = function Frame(domElement) {
	ensure.signature(arguments, [ Object ]);
	ensure.that(domElement.tagName === "IFRAME", "DOM element must be an iframe");

	this._domElement = domElement;
};

Me.create = function create(parentElement, width, height, callback) {
	ensure.signature(arguments, [ Object, Number, Number, Function ]);

	var iframe = document.createElement("iframe");
	addLoadListener(iframe, function() {
		// TODO: clean up
		callback(new Me(iframe));
	});
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	parentElement.appendChild(iframe);
};

Me.prototype.toDomElement = function() {
	return this._domElement;
};

Me.prototype.remove = function() {
	this._domElement.parentNode.removeChild(this._domElement);
};

Me.prototype.addElement = function(html) {
	var element = document.createElement("div");
	element.innerHTML = html;
	this._domElement.contentDocument.body.appendChild(element.childNodes[0]);
};

// WORKAROUND IE8: no addEventListener()
function addLoadListener(iframeDom, callback) {
	if (iframeDom.addEventListener) iframeDom.addEventListener("load", callback);
	else iframeDom.attachEvent("onload", callback);
}