// Copyright Titanium I.T. LLC.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require('./q_element.js');
var QFrame = require("./q_frame.js");
var browser = require("./browser.js");

exports.browser = browser;

exports.createFrame = function(options, callback) {
	return QFrame.create(document.body, options, function(err, callbackFrame) {
		if (err) return callback(err);
		browser.detectBrowserFeatures(function(err) {
			callback(err, callbackFrame);
		});
	});
};

exports.elementFromDom = function(domElement, nickname) {
	ensure.signature(arguments, [ Object, [ undefined, String ] ]);

	if (nickname === undefined) {
		if (domElement.id !== "") nickname = "#" + domElement.id;
		else if (domElement.className !== "") nickname = "." + domElement.className.split(/\s+/).join(".");
		else nickname = "<" + domElement.tagName.toLowerCase() + ">";
	}
	return QElement.create(domElement, nickname);
};
