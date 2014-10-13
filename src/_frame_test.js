// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Frame = require("./frame.js");

describe("Frame", function() {

	it("creates iframe DOM element with specified width and height", function() {
		var frame = Frame.create(window.document.body, 600, 400);
		assert.type(frame, Frame, "frame");

		var iframe = frame.toDomElement();
		assert.equal(iframe.tagName, "IFRAME", "should create an iframe tag");
		assert.equal(iframe.parentNode, window.document.body, "iframe should go inside element we provide");
		assert.equal(iframe.width, "600", "width should match provided value");
		assert.equal(iframe.height, "400", "height should match provided value");
	});

});