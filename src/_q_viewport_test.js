// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var QViewport = require("./q_viewport.js");

describe("QViewport", function() {

	var frame;
	var viewport;

	beforeEach(function() {
		frame = reset.frame;
		viewport = new QViewport(frame);
	});

	it("has size properties", function() {
		assert.equal(viewport.width.diff(reset.WIDTH), "", "width");
		assert.equal(viewport.height.diff(reset.HEIGHT), "", "height");
	});

});