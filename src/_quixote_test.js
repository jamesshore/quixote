// Copyright Titanium I.T. LLC.
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
