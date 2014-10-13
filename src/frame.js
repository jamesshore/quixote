// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

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
	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._domElement.contentDocument.body.appendChild(insertedElement);
	return new QElement(insertedElement);
};

Me.prototype.getElement = function(id) {
//	frameDom.contentDocument.getElementById("foo")

	var element = this._domElement.contentDocument.getElementById("foo");

//	var element = this._domElement.contentDocument.querySelector(id);
	ensure.that(element !== null, "selector '#" + id + "' not found");
	return new QElement(element);
};

// WORKAROUND IE8: no addEventListener()
function addLoadListener(iframeDom, callback) {
	if (iframeDom.addEventListener) iframeDom.addEventListener("load", callback);
	else iframeDom.attachEvent("onload", callback);
}