// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QFrame = require("./q_frame.js");
var Size = require("./values/size.js");

var features = null;

exports.createFrame = function(options, callback) {
	return QFrame.create(document.body, options, function(err, callbackFrame) {
		if (features === null) {
			detectBrowserFeatures(function() {
				callback(err, callbackFrame);
			});
		}
		else {
			callback(err, callbackFrame);
		}
	});
};

exports.browser = {};

exports.browser.enlargesFrameToPageSize = createDetectionMethod("enlargesFrame");

function createDetectionMethod(propertyName) {
	return function() {
		ensure.signature(arguments, []);

		var feature = features[propertyName];
		ensure.that(feature !== undefined, "Must create a frame before using Quixote browser feature detection.");
		return feature;
	};
}

function detectBrowserFeatures(callback) {
	var FRAME_WIDTH = 300;
	var FRAME_HEIGHT = 200;

	features = {};
	var detector = QFrame.create(document.body, { width: FRAME_WIDTH, height: FRAME_HEIGHT }, function(err) {
		if (err) {
			console.log("Error during Quixote browser feature detection:", err);
			return callback();
		}

		try {
			features.enlargesFrame = resetThen(detectFrameEnlargement);
			return callback();
		}
		finally {
			detector.remove();
		}
	});

	function resetThen(fn) {
		detector.reset();
		return fn(detector, FRAME_WIDTH);
	}
}

function detectFrameEnlargement(detector, frameWidth) {
	detector.add("<div style='width: " + (frameWidth + 200) + "px'>force scrolling</div>");
	return !detector.viewport().width.value().equals(Size.create(frameWidth));
}
