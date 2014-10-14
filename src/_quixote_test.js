// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var quixote = require("./quixote.js");
var Frame = require("./frame.js");

describe("Quixote", function() {

	it("creates frame", function(done) {
		var frame = quixote.createFrame(600, 400, { src: "/base/src/_frame_test.html" }, function(err, callbackFrame) {
			assert.noException(function() {
				callbackFrame.getElement("#exists");
			});
			done(err);
		});
		assert.type(frame, Frame, "createFrame() returns frame object immediately");
	});

});