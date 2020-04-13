// Copyright Titanium I.T. LLC.
"use strict";

var assert = require("./util/assert.js");
var quixote = require("./quixote.js");
var QFrame = require("./q_frame.js");
var reset = require("./__reset.js");

describe("FOUNDATION: Quixote", function() {

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

	it("creates QElement from DOM element", function() {
		var domElement = reset.frame.add("<div>my element</div>").toDomElement();

		var element = quixote.elementFromDom(domElement);
		assert.equal(element.toDomElement(), domElement);
	});

});
