// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var QViewport = require("./q_viewport.js");
var Assertable = require("./assertable.js");

describe("FOUNDATION: QViewport", function() {

	var frame;
	var viewport;

	beforeEach(function() {
		frame = reset.frame;
		viewport = new QViewport(frame.toBrowsingContext());
	});

	it("is Assertable", function() {
		assert.implements(viewport, Assertable);
	});

	it("has size properties", function() {
		assert.equal(viewport.width.diff(reset.WIDTH), "", "width");
		assert.equal(viewport.height.diff(reset.HEIGHT), "", "height");
		assert.equal(viewport.width.toString(), "width of viewport", "width description");
		assert.equal(viewport.height.toString(), "height of viewport", "height description");
	});

	it("has edge properties", function() {
		assert.equal(viewport.top.diff(0), "", "top");
		assert.equal(viewport.right.diff(reset.WIDTH), "", "right");
		assert.equal(viewport.bottom.diff(reset.HEIGHT), "", "bottom");
		assert.equal(viewport.left.diff(0), "", "left");
	});

	it("has center properties", function() {
		assert.equal(viewport.center.diff(reset.WIDTH / 2), "", "center");
		assert.equal(viewport.middle.diff(reset.HEIGHT / 2), "", "middle");
		assert.equal(viewport.center.toString(), "center of viewport", "center description");
		assert.equal(viewport.middle.toString(), "middle of viewport", "middle description");
	});

});