// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../util/assert.js");
	var reset = require("../__reset.js");
	var ElementRendered = require("./element_rendered.js");
	var Descriptor = require("./descriptor.js");
	var RenderState = require("../values/render_state.js");

	describe("DESCRIPTOR: ElementRendered", function() {

		var frame;
		var renderedElement;
		var displayNoneElement;
		var detachedElement;
		var rendered;
		var displayNone;
		var detached;

		beforeEach(function() {
			frame = reset.frame;

			renderedElement = frame.add("<p>element</p>", "displayed");
			displayNoneElement = frame.add("<p style='display:none'>display:none</p>", "display:none");
			detachedElement = frame.add("<p>detached</p>", "detached");
			detachedElement.remove();

			rendered = ElementRendered.create(renderedElement);
			displayNone = ElementRendered.create(displayNoneElement);
			detached = ElementRendered.create(detachedElement);
		});

		it("is a descriptor", function() {
			assert.implements(rendered, Descriptor);
		});

		it("resolves to value", function() {
			assert.objEqual(rendered.value(), RenderState.rendered(), "displayed");
			assert.objEqual(displayNone.value(), RenderState.displayNone(), "display:none");
			assert.objEqual(detached.value(), RenderState.detached(), "detached");

			displayNoneElement.remove();
			assert.objEqual(displayNone.value(), RenderState.detached(), "detached and display:none");
		});

		it("converts to string", function() {
			assert.equal(rendered.toString(), "display status of " + renderedElement.toString());
		});

		it("converts comparison arguments", function() {
		  assert.objEqual(rendered.convert(true, "boolean"), RenderState.rendered());
		  assert.objEqual(rendered.convert(false, "boolean"), RenderState.notRendered());
		  assert.objEqual(rendered.convert("none", "string"), RenderState.displayNone());
		  assert.objEqual(rendered.convert("detached", "string"), RenderState.detached());
		});

	});

}());