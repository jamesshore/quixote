// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../util/assert.js");
	var reset = require("../__reset.js");
	var ElementDisplayed = require("./element_displayed.js");
	var Descriptor = require("./descriptor.js");
	var Display = require("../values/display.js");

	describe("DESCRIPTOR: ElementDisplayed", function() {

		var frame;
		var displayedElement;
		var displayNoneElement;
		var detachedElement;
		var displayed;
		var displayNone;
		var detached;

		beforeEach(function() {
			frame = reset.frame;

			displayedElement = frame.add("<p>element</p>", "displayed");
			displayNoneElement = frame.add("<p style='display:none'>display:none</p>", "display:none");
			detachedElement = frame.add("<p>detached</p>", "detached");
			detachedElement.remove();

			displayed = ElementDisplayed.create(displayedElement);
			displayNone = ElementDisplayed.create(displayNoneElement);
			detached = ElementDisplayed.create(detachedElement);
		});

		it("is a descriptor", function() {
			assert.implements(displayed, Descriptor);
		});

		it("resolves to value", function() {
			assert.objEqual(displayed.value(), Display.displayed(), "displayed");
			assert.objEqual(displayNone.value(), Display.displayNone(), "display:none");
			assert.objEqual(detached.value(), Display.detached(), "detached");

			displayNoneElement.remove();
			assert.objEqual(displayNone.value(), Display.detached(), "detached and display:none");
		});

		it("converts to string", function() {
			assert.equal(displayed.toString(), displayedElement.toString());
		});

	});

}());