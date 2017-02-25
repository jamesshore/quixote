// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var quixote = require("./quixote.js");
var QFrame = require("./q_frame.js");

describe("FOUNDATION: Quixote", function() {
	this.timeout(10000);

	it("creates frame", function(done) {
		var frame = quixote.createFrame({ src: "/base/src/_q_frame_test.html" }, function(err, callbackFrame) {
			assert.noException(function() {
				callbackFrame.get("#exists");
			});
			frame.remove();
			done(err);
		});
		assert.type(frame, QFrame, "createFrame() returns frame object immediately");
	});

});

describe("FOUNDATION: Browser capability", function() {

	var frame;

	var mobileSafari;
	var chromeMobile;
	var ie11;

	beforeEach(function() {
		var userAgent = navigator.userAgent;

		// These user agent strings may be brittle. It's okay because we only use them in the tests. Modify them
		// as needed to make sure tests match real-world behavior.
		mobileSafari = userAgent.match(/(iPad|iPhone|iPod touch);/i) !== null;
		chromeMobile = userAgent.match(/Android/) !== null;
		ie11 = userAgent.match(/rv:11\.0/) !== null;
	});

	it("detects whether browser expands frame to fit size of page", function() {
		assert.equal(
			quixote.browser.enlargesFrameToPageSize(),
			mobileSafari,
			"everything but Mobile Safari should respect frame size"
		);
	});

	it("detects whether browser expands size of font when frame is large", function() {
		assert.equal(
			quixote.browser.enlargesFonts(),
			mobileSafari,
			"everything but Mobile Safari should respect frame size"
		);
	});

	it("detects whether browser computes `clip: rect(auto, ...)` value correctly", function() {
		assert.equal(
			quixote.browser.miscalculatesAutoValuesInClipProperty(),
			chromeMobile || ie11,
			"everything but Android Mobile and IE 11 should calculate clip values properly"
		);
	});

});