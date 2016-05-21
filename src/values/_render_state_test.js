// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../util/assert.js");
	var RenderState = require("./render_state.js");
	var Value = require("./value.js");

	describe("VALUE: RenderState", function() {

		var rendered = RenderState.rendered();
		var notRendered = RenderState.notRendered();
		var displayNone = RenderState.displayNone();
		var detached = RenderState.detached();

		it("is a value object", function() {
			assert.implements(rendered, Value);
		});

		it("has multiple states reflecting ways elements can be rendered or not", function() {
			assert.objEqual(RenderState.rendered(), rendered, "rendered");
			assert.objEqual(RenderState.notRendered(), notRendered, "not rendered, details unspecified");
			assert.objEqual(RenderState.displayNone(), displayNone, "not rendered, display:none property");
			assert.objEqual(RenderState.detached(), detached, "not rendered, detached from DOM");
		});

		it("describes difference", function() {
			var EQUAL = "";
			var EXPECT_NON_DISPLAY = "different than expected";
			var EXPECT_DISPLAY = "different than expected";
			var EXPECT_DIFFERENT_NON_DISPLAY = "achieved differently than expected";

			assert.equal(rendered.diff(rendered), EQUAL);
			assert.equal(rendered.diff(notRendered), EXPECT_NON_DISPLAY);
			assert.equal(rendered.diff(displayNone), EXPECT_NON_DISPLAY);
			assert.equal(rendered.diff(detached), EXPECT_NON_DISPLAY);

			assert.equal(notRendered.diff(rendered), EXPECT_DISPLAY);
			assert.equal(notRendered.diff(notRendered), EQUAL);
			assert.equal(notRendered.diff(displayNone), EQUAL);
			assert.equal(notRendered.diff(detached), EQUAL);

			assert.equal(displayNone.diff(rendered), EXPECT_DISPLAY);
			assert.equal(displayNone.diff(notRendered), EQUAL);
			assert.equal(displayNone.diff(displayNone), EQUAL);
			assert.equal(displayNone.diff(detached), EXPECT_DIFFERENT_NON_DISPLAY);

			assert.equal(detached.diff(rendered), EXPECT_DISPLAY);
			assert.equal(detached.diff(notRendered), EQUAL);
			assert.equal(detached.diff(detached), EQUAL);
			assert.equal(detached.diff(displayNone), EXPECT_DIFFERENT_NON_DISPLAY);
		});

		it("converts to string", function() {
			assert.equal(rendered.toString(), "rendered");
			assert.equal(notRendered.toString(), "not rendered");
			assert.equal(displayNone.toString(), "not rendered due to display:none property");
			assert.equal(detached.toString(), "not rendered due to being detached from DOM");
		});

	});

}());