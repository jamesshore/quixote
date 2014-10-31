// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var QPage = require("./q_page.js");

describe("QPage", function() {

	var WIDTH = reset.WIDTH + 200;
	var HEIGHT = reset.HEIGHT + 200;

	var frame;
	var page;

	beforeEach(function() {
		frame = reset.frame;
		page = new QPage(frame);

		frame.add(
			"<div style='position: absolute; left: " + (WIDTH - 100) + "px; top: " + (HEIGHT - 100) + "px; " +
			"width: 100px; height: 100px;'>element</div>"
		);
	});

	it("has size properties", function() {
		assert.equal(page.width.diff(WIDTH), "", "width");
		assert.equal(page.height.diff(HEIGHT), "", "height");
	});

	it("has edge properties", function() {
		assert.equal(page.top.diff(0), "", "top");
		assert.equal(page.right.diff(WIDTH), "", "right");
		assert.equal(page.bottom.diff(HEIGHT), "", "bottom");
		assert.equal(page.left.diff(0), "", "left");
	});

	it("has center properties", function() {
		assert.equal(page.center.diff(WIDTH / 2), "", "center");
		assert.equal(page.middle.diff(HEIGHT / 2), "", "middle");
		assert.equal(page.center.toString(), "center of page", "center description");
		assert.equal(page.middle.toString(), "middle of page", "middle description");
	});

});