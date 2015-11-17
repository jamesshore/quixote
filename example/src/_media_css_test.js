// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("./assert.js");
	var quixote = require("../vendor/quixote.js");

	describe("Media Object CSS", function() {

		var frame;
		var media;
		var figure;
		var body;

		before(function(done) {
			frame = quixote.createFrame({
				stylesheet: "/base/src/screen.css"
			}, done);
		});

		after(function() {
			frame.remove();
		});

		beforeEach(function() {
			frame.reset();
			media = frame.add(
				"<div class='media'>" +
				" <div id='figure' class='media__figure' style='width:100px; height:100px'>figure</div>" +
				" <div id='body' class='media__body'>body</div>" +
				"</div>",
				"media object"
			);
			figure = frame.get("#figure");
			body = frame.get("#body");
		});

		it("positions figure flush to the left of container", function() {
			figure.assert({
				left: frame.body().left
			});
		});

		it("aligns top edge of figure and body", function() {
			body.assert({
				top: figure.top
			});
		});

		it("positions body to right of figure", function() {
			body.assert({
				left: figure.right.plus(10)
			});
		});

		it("positions subsequent elements below media object", function() {
			var subsequent = frame.add("<div>subsequent element</div>", "subsequent");
			subsequent.assert({
				left: frame.body().left,
				top: figure.bottom
			});
		});

		it("allows elements' margins to extend outside media object", function() {
			body.toDomElement().style.marginTop = "15px";
			body.assert({
				top: figure.top
			});
		});

	});

}());