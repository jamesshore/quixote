// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

var Me = module.exports = function Frame(domElement) {
	ensure.signature(arguments, [ Object ]);
	ensure.that(domElement.tagName === "IFRAME", "DOM element must be an iframe");

	this._domElement = domElement;
	this._document = domElement.contentDocument;
};

Me.create = function create(parentElement, width, height, options, callback) {
	ensure.signature(arguments, [ Object, Number, Number, [ Object, Function ], [ undefined, Function ] ]);

	if (callback === undefined) {
		callback = options;
		options = {};
	}

	var iframe = document.createElement("iframe");
	addLoadListener(iframe, function() {
		// TODO: clean up
		callback(new Me(iframe));
	});
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	if (options.src) iframe.setAttribute("src", options.src);
	parentElement.appendChild(iframe);
};

Me.prototype.reset = function() {
	ensure.signature(arguments, []);

	this._document.body.innerHTML = "";
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);

	return this._domElement;
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);

	this._domElement.parentNode.removeChild(this._domElement);
};

Me.prototype.addElement = function(html) {
	ensure.signature(arguments, [ String ]);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._document.body.appendChild(insertedElement);
	return new QElement(insertedElement);
};

Me.prototype.getElement = function(selector) {
	ensure.signature(arguments, [ String ]);

	var nodes = this._document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0]);
};

// WORKAROUND IE8: no addEventListener()
function addLoadListener(iframeDom, callback) {
	if (iframeDom.addEventListener) iframeDom.addEventListener("load", callback);
	else iframeDom.attachEvent("onload", callback);
}