// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

// Example Quixote unit tests. We're using Mocha as our test framework and Chai for assertions.
// These tests check the our media object CSS, which is defined in `screen.css`.

(function() {
	"use strict";

	// Load an assertion library. You can use any assertion library you want. Here, we use a lightly-modified
	// version of Chai.
	var assert = require("./assert.js");

	// Load Quixote.
	var quixote = require("../vendor/quixote.js");

	// Define a test suite using Mocha's standard `define` function.
	describe("Media Object CSS", function() {

		// Variables used by our tests. They're populated in the `before()` and `beforeEach()` functions.
		var frame;      // The Quixote test frame.
		var media;      // The media object element.
		var figure;     // The figure element inside the media object. (The icon.)
		var content;    // The content element inside the media object. (The paragraph.)

		// Use Mocha's standard `before` function to set up our Quixote test frame before the tests run.
		before(function(done) {
			// Create the frame and load our stylesheet.
			frame = quixote.createFrame({
				// The URL of our stylesheet. It's served by Karma and configured in `build/config/karma.conf.js`.
				stylesheet: "/base/src/screen.css"
			}, done);   // This is an asynchronous operation, so we pass in Mocha's `done` callback.
		});

		// Use Mocha's standard `after` function to clean up our Quixote test frame after all the tests are done.
		// We create and remove the test frame only once for the entire suite because it's a relatively expensive
		// operation.
		after(function() {
			frame.remove();
		});

		// Use Mocha's standard `beforeEach()` function to set up the HTML elements we'll use to test our
		// media object CSS.
		beforeEach(function() {
			// Reset Quixote's test frame to a pristine state. This ensures that any DOM changes we made in our
			// tests don't affect other tests. We do it in the `beforeEach()` function rather than `afterEach()`
			// to make debugging easier.
			frame.reset();

			// Create the HTML needed for our media object. This also acts as documentation for how the media
			// object CSS is supposed to be used. Quixote will return an object we can use to make assertions about
			// how the media element is styled.
			media = frame.add(
				// There's a containing <div>...
				"<div class='media'>" +
				// ...a figure...
				"  <div id='figure' class='media__figure' style='width:100px; height:100px'>figure</div>" +
				// ...and content.
				"  <div id='content' class='media__content'>content</div>" +
				"</div>",
				// Give the HTML a name so Quixote's error messages are more readable. If we don't provide a name,
				// Quixote will use the HTML by default. That would be pretty ugly.
				"media object"
			);

			// Get the media element's figure and content elements. Quixote gives us an object we can use to make
			// assertions about how the elements are styled.
			figure = frame.get("#figure");
			content = frame.get("#content");
		});

		// Our first test. We use Mocha's standard `it()` function to define the test. Here, we're checking that
		// the `figure` element in our media element is positioned to the left.
		it("positions figure flush to the left of its container", function() {
			// Check that the left edge of the figure is the same as the left edge of the test frame's <body> element.
			figure.left.should.equal(frame.body().left);
		});

		// Another test. We want to make sure that the media object's icon (figure) and text (content) are both top-aligned.
		it("aligns top edge of figure and content", function() {
			// Tell Quixote to make an assertion about the media object's `content` element.
			content.top.should.equal(figure.top);
		});

		// Another test. Make sure the media object's text (content) is located to the right of the icon (figure) with
		// ten pixels of white space in between.
		it("positions content to right of figure", function() {
			// Check that the left edge of the content is 10 pixels to the right of the right edge of the figure.
			content.left.should.equal(figure.right.plus(10));
		});

		// This test confirms that any elements added after the media object are positioned after the element. It's
		// basically ensuring that the figure's float has been cleared.
		it("positions subsequent elements below media object", function() {
			// Add an element after the media object. This will automatically get cleaned up before the next test
			// by the `frame.reset()` line in the `beforeEach()` function above.
			var subsequent = frame.add("<div>subsequent element</div>", "subsequent");

			// Check that the left edge of the new element is the same as the left edge of the test frame's <body>
			// element (in other words, make sure it isn't positioned to the right of the media object).
			subsequent.left.should.equal(frame.body().left);

			// Check that the top edge of the new element is the same as the bottom edge of the figure (in other words,
			// make sure it's positioned below the media object).
			subsequent.top.should.equal(figure.bottom);
		});

		// This test checks that margins used in the media object's content element will collapse.
		it("allows elements' margins to extend outside media object", function() {
			// Add a margin to the content element. The `content` variable is a Quixote object, so to style it, first we
			// get the underlying DOM object by calling `toDomElement()`. Then we set the style on the DOM object
			// as normal.
			content.toDomElement().style.marginTop = "15px";

			// Check that the top edge of the content element is the same as the top edge of the figure, even though it has
			// a 15-pixel margin. (The edge of the element includes border and padding, but ignores margin.) If it's
			// the same, that means that the margin is extending above the media object, and therefore collapsing
			// correctly.
			content.top.should.equal(figure.top);
		});

	});

}());