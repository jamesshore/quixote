// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Frame = require("./frame.js");

describe("Frame", function() {

	describe("creation and removal", function() {

		it("creates iframe DOM element with specified width and height", function(done) {
			Frame.create(window.document.body, 600, 400, function(frame) {
				assert.type(frame, Frame, "frame");

				var iframe = frame.toDomElement();
				assert.equal(iframe.tagName, "IFRAME", "should create an iframe tag");
				assert.equal(iframe.parentNode, window.document.body, "iframe should go inside element we provide");
				assert.equal(iframe.width, "600", "width should match provided value");
				assert.equal(iframe.height, "400", "height should match provided value");

				done();
			});
		});

		it("destroys itself", function(done) {
			Frame.create(window.document.body, 800, 1000, function(frame) {
				var numChildren = document.body.childNodes.length;

				frame.remove();
				assert.equal(document.body.childNodes.length, numChildren - 1, "# of document child nodes");

				done();
			});
		});

	});

	describe("instance", function() {

		var frame;

		beforeEach(function() {
//			frame = Frame.create(window.document.body, 800, 1000);
		});


	});

});