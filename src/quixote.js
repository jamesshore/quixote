// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QFrame = require("./q_frame.js");

exports.createFrame = function(options, callback) {
	return QFrame.create(document.body, options, callback);
};

exports.browser = {};

exports.browser.enlargesFrameToPageSize = function canScroll() {
	ensure.signature(arguments, []);

	// It would be nice if this used feature detection rather than browser detection
	return (isMobileSafari());
};

function isMobileSafari() {
	return navigator.userAgent.match(/(iPad|iPhone|iPod touch);/i);
}
