// Copyright Titanium I.T. LLC.
"use strict";

var assert = require("./util/assert.js");
var quixote = require("./quixote.js");

describe("FOUNDATION: Browser capability", function() {

	var mobileSafari;
	var chromeMobile;
	var ie8;
	var ie11;

	beforeEach(function() {
		var userAgent = navigator.userAgent;

		// These user agent strings may be brittle. It's okay because we only use them in the tests. Modify them
		// as needed to make sure tests match real-world behavior.
		mobileSafari = userAgent.match(/(iPad|iPhone|iPod touch);/i) !== null;
		chromeMobile = userAgent.match(/Android/) !== null;
		ie8 = userAgent.match(/MSIE 8\.0/) !== null;
		ie11 = userAgent.match(/rv:11\.0/) !== null;
	});

	it("detects whether browser expands frame to fit size of page", function() {
		assert.equal(
			quixote.browser.enlargesFrameToPageSize(),
			false,
			"everything should respect frame size"
		);
	});

	it("detects whether browser expands size of font when frame is large", function() {
		assert.equal(
			quixote.browser.enlargesFonts(),
			mobileSafari,
			"everything but Mobile Safari should respect frame size"
		);
	});

	it("detects whether browser can detect `clip: auto` value", function() {
		assert.equal(
			quixote.browser.misreportsClipAutoProperty(),
			ie8,
			"everything but IE 8 should calculate 'clip: auto' properly"
		);
	});

	it("detects whether browser computes `clip: rect(auto, ...)` value correctly", function() {
		assert.equal(
			quixote.browser.misreportsAutoValuesInClipProperty(),
			ie11,
			"everything but IE 11 should calculate clip values properly"
		);
	});

	it("detects whether browser rounds off floating-point pixel values", function() {
		assert.equal(
			quixote.browser.roundsOffPixelCalculations(),
			ie8 || ie11,
			"only IE 8 and IE 11 should round off pixel values"
		);
	});

});