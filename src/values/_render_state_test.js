// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var RenderState = require("./render_state.js");
var Value = require("./value.js");

describe("VALUE: RenderState", function() {

	var rendered = RenderState.rendered();
	var notRendered = RenderState.notRendered();

	it("is a value object", function() {
		assert.implements(rendered, Value);
	});

	it("is a boolean reflecting whether element is rendered or not", function() {
		assert.objEqual(RenderState.rendered(), rendered, "rendered");
		assert.objEqual(RenderState.notRendered(), notRendered, "not rendered");
	});

	it("describes difference", function() {
		assert.equal(rendered.diff(rendered), "");
		assert.equal(rendered.diff(notRendered), "rendered");

		assert.equal(notRendered.diff(rendered), "not rendered");
		assert.equal(notRendered.diff(notRendered), "");
	});

	it("converts to string", function() {
		assert.equal(rendered.toString(), "rendered");
		assert.equal(notRendered.toString(), "not rendered");
	});

});
