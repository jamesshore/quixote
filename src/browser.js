// Copyright Titanium I.T. LLC.
"use strict";

var ensure = require("./util/ensure.js");
var QFrame = require("./q_frame.js");
var Size = require("./values/size.js");

var FRAME_WIDTH = 1500;
var FRAME_HEIGHT = 200;

var features = null;

exports.enlargesFrameToPageSize = createDetectionMethod("enlargesFrame");
exports.enlargesFonts = createDetectionMethod("enlargesFonts");
exports.misreportsClipAutoProperty = createDetectionMethod("misreportsClipAuto");
exports.misreportsAutoValuesInClipProperty = createDetectionMethod("misreportsClipValues");
exports.roundsOffPixelCalculations = createDetectionMethod("roundsOffPixelCalculations");

exports.detectBrowserFeatures = function(callback) {
	var frame = QFrame.create(document.body, { width: FRAME_WIDTH, height: FRAME_HEIGHT }, function(err) {
		if (err) {
			return callback(new Error("Error while creating Quixote browser feature detection frame: " + err));
		}
		return detectFeatures(frame, function(err) {
			frame.remove();
			return callback(err);
		});
	});
};

function detectFeatures(frame, callback) {
	try {
		features = {};
		features.enlargesFrame = detectFrameEnlargement(frame, FRAME_WIDTH);
		features.misreportsClipAuto = detectReportedClipAuto(frame);
		features.misreportsClipValues = detectReportedClipPropertyValues(frame);
		features.roundsOffPixelCalculations = detectRoundsOffPixelCalculations(frame);

		detectFontEnlargement(frame, FRAME_WIDTH, function(result) {
			features.enlargesFonts = result;
			frame.remove();
			return callback(null);
		});

	}
	catch(err) {
		features = null;
		return callback(new Error("Error during Quixote browser feature detection: " + err));
	}
}

function createDetectionMethod(propertyName) {
	return function() {
		ensure.signature(arguments, []);
		ensure.that(
			features !== null,
			"Must call quixote.createFrame() before using Quixote browser feature detection."
		);

		return features[propertyName];
	};
}

function detectFrameEnlargement(frame, frameWidth) {
	frame.reset();

	frame.add("<div style='width: " + (frameWidth + 200) + "px'>force scrolling</div>");
	return !frame.viewport().width.value().equals(Size.create(frameWidth));
}

function detectReportedClipAuto(frame) {
	frame.reset();

	var element = frame.add("<div style='clip: auto;'></div>");
	var clip = element.getRawStyle("clip");

	return clip !== "auto";
}

function detectReportedClipPropertyValues(frame) {
	frame.reset();

	var element = frame.add("<div style='clip: rect(auto, auto, auto, auto);'></div>");
	var clip = element.getRawStyle("clip");

	// WORKAROUND IE 8: Provides 'clipTop' etc. instead of 'clip' property
	if (clip === "" && element.getRawStyle("clip-top") === "auto") return false;

	return clip !== "rect(auto, auto, auto, auto)" && clip !== "rect(auto auto auto auto)";
}

function detectRoundsOffPixelCalculations(frame) {
	var element = frame.add("<div style='font-size: 15px;'></div>");
	var size = element.calculatePixelValue("0.5em");

	if (size === 7.5) return false;
	if (size === 8) return true;
	ensure.unreachable("Failure in roundsOffPixelValues() detection: expected 7.5 or 8, but got " + size);
}

function detectFontEnlargement(frame, frameWidth, callback) {
	ensure.that(frameWidth >= 1500, "Detector frame width must be larger than screen to detect font enlargement");
	frame.reset();

	// WORKAROUND IE 8: we use a <div> because the <style> tag can't be added by frame.add(). At the time of this
	// writing, I'm not sure if the issue is with frame.add() or if IE just can't programmatically add <style> tags.
	frame.add("<div><style>p { font-size: 15px; }</style></div>");

	var text = frame.add("<p>arbitrary text</p>");
	frame.add("<p>must have two p tags to work</p>");

	// WORKAROUND IE 8: need to force reflow or getting font-size may fail below
	// This seems to occur when IE is running in a slow VirtualBox VM. There is no test for this line.
	frame.forceReflow();

	// WORKAROUND Safari 8.0.0: timeout required because font is enlarged asynchronously
	setTimeout(function() {
		var fontSize = text.getRawStyle("font-size");
		ensure.that(fontSize !== "", "Expected font-size to be a value");

		// WORKAROUND IE 8: ignores <style> tag we added above
		if (fontSize === "12pt") return callback(false);

		return callback(fontSize !== "15px");
	}, 0);
}
