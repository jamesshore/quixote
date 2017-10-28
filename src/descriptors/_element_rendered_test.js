// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../util/assert.js");
	var quixote = require("../quixote.js");
	var reset = require("../__reset.js");
	var ElementRendered = require("./element_rendered.js");
	var Descriptor = require("./descriptor.js");
	var RenderState = require("../values/render_state.js");
	var Size = require("../values/size.js");

	describe("DESCRIPTOR: ElementRendered", function() {

		var frame;
		var renderedElement;
		var displayNoneElement;
		var detachedElement;
		var rendered;
		var displayNone;
		var detached;
		var offscreen;
		var noSize;

		beforeEach(function() {
			frame = reset.frame;

			renderedElement = frame.add("<p>element</p>", "displayed");
			rendered = ElementRendered.create(renderedElement);

			displayNoneElement = frame.add("<p style='display:none'>display:none</p>", "display:none");
			displayNone = ElementRendered.create(displayNoneElement);

			detachedElement = frame.add("<p>detached</p>", "detached");
			detachedElement.remove();
			detached = ElementRendered.create(detachedElement);

			offscreen = ElementRendered.create(frame.add("<div style='position:absolute; left: -100px; width: 10px;'></div>"));

			noSize = ElementRendered.create(frame.add("<div style='position:absolute; left: 10px; width: 0px;'></div>"));
		});

		it("is a descriptor", function() {
			assert.implements(rendered, Descriptor);
		});

		it("resolves to value", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			assert.objEqual(rendered.value(), RenderState.rendered(), "rendered");
			assert.objEqual(displayNone.value(), RenderState.notRendered(), "display:none");
			assert.objEqual(detached.value(), RenderState.notRendered(), "detached");
			assert.objEqual(offscreen.value(), RenderState.notRendered(), "offscreen");
			assert.objEqual(noSize.value(), RenderState.notRendered(), "no size");

			displayNoneElement.remove();
			assert.objEqual(displayNone.value(), RenderState.notRendered(), "detached and display:none");
		});

		it("converts to string", function() {
			assert.equal(rendered.toString(), "render status of " + renderedElement.toString());
		});

		it("converts comparison arguments", function() {
		  assert.objEqual(rendered.convert(true, "boolean"), RenderState.rendered());
		  assert.objEqual(rendered.convert(false, "boolean"), RenderState.notRendered());
		});

		it("has size descriptors", function() {
			if (quixote.browser.misreportsClipAutoProperty()) return;

			assert.objEqual(rendered.width.value(), renderedElement.width.value(), "rendered width");
			assert.objEqual(displayNone.width.value(), Size.createNone(), "non-rendered width");
			assert.objEqual(noSize.width.value(), Size.createNone(), "zero width");

			assert.objEqual(rendered.height.value(), renderedElement.height.value(), "rendered height");
			assert.objEqual(displayNone.height.value(), Size.createNone(), "non-rendered height");
			assert.objEqual(noSize.height.value(), Size.createNone(), "zero height");

			assert.equal(rendered.width.toString(), "rendered width of " + renderedElement, "width description");
			assert.equal(rendered.height.toString(), "rendered height of " + renderedElement, "height description");
		});

	});

}());