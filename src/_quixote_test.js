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

	describe("elementFromDom()", function() {

		var frame;
		var irreleventDomElement;

		beforeEach(function() {
			frame = reset.frame;
			irreleventDomElement = addDomElement("<div>irrelevant DOM element</div>");
		});

		it("creates QElement from DOM element", function() {
			var domElement = addDomElement("<div>my element</div>");

			var element = quixote.elementFromDom(domElement);
			assert.equal(element.toDomElement(), domElement);
		});

		it("uses provided nickname", function() {
			var element = quixote.elementFromDom(irreleventDomElement, "my nickname");
			assert.equal(element.toString(), "'my nickname'");
		});

		it("uses element ID if no nickname provided", function() {
			var element = quixote.elementFromDom(addDomElement("<div id='myId'></div>"));
			assert.equal(element.toString(), "'#myId'");
		});

		it("uses class names if no nickname or ID", function() {
			var oneClass = quixote.elementFromDom(addDomElement("<div class='myClass'></div>"));
			assert.equal(oneClass.toString(), "'.myClass'", "one class");

			var manyClasses = quixote.elementFromDom(addDomElement("<div class='one two three'></div>"));
			assert.equal(manyClasses.toString(), "'.one.two.three'", "multiple classes");

			var lotsOfWhitespace = quixote.elementFromDom(addDomElement("<div class='one  \t \n two'></div>"));
			assert.equal(lotsOfWhitespace.toString(), "'.one.two'", "lots of whitespace");
		});

		it("uses tag name if nothing else works provided", function() {
			var element = quixote.elementFromDom(addDomElement("<blockquote></blockquote>"));
			assert.equal(element.toString(), "'<blockquote>'");
		});

		function addDomElement(html) {
			return frame.add(html).toDomElement();
		}

	});

});
