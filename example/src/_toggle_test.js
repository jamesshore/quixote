// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

// Example JavaScript tests. We're using Mocha as our test framework and Chai for assertions.
// There's nothing related to Quixote in this file. It's just an example of testing JavaScript.

(function() {
	"use strict";

	var assert = require("./assert.js");
	var toggle = require("./toggle.js");

	describe("Toggle", function() {

		var container;

		beforeEach(function() {
			container = document.createElement("div");
			document.body.appendChild(container);
		});

		afterEach(function() {
			container.parentNode.removeChild(container);
		});

		it("toggle CSS class on an element when another element is clicked", function() {
			var clickMe = addDiv();
			var target = addDiv();
			var cssClass = "someClassName";

			toggle.init(clickMe, target, cssClass);
			assert.isFalse(hasClass(target, cssClass), "should not contain class before click");

			clickMe.click();
			assert.isTrue(hasClass(target, cssClass), "should contain class after click");

			clickMe.click();
			assert.isFalse(hasClass(target, cssClass), "should not contain class after another click");
		});

		function hasClass(target, cssClass) {
			return target.classList.contains(cssClass);
		}

		function addDiv() {
			var element = document.createElement("div");
			container.appendChild(element);
			return element;
		}

	});

}());