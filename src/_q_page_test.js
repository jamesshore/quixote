// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var QPage = require("./q_page.js");

describe("QPage", function() {

	var frame;
	var page;

	beforeEach(function() {
		frame = reset.frame;
		page = new QPage(frame);

		frame.add("<div style='position: absolute; left: 1000px; top: 1200px; width: 100px; height: 100px;'>element</div>");
	});

	it("has size properties", function() {
		assert.equal(page.width.diff(1100), "", "width");
		assert.equal(page.height.diff(1300), "", "height");
	});

	//it("has edge properties", function() {
	//	assert.equal(page.top.diff(0), "", "top");
	//	assert.equal(page.right.diff(reset.WIDTH), "", "right");
	//	assert.equal(page.bottom.diff(reset.HEIGHT), "", "bottom");
	//	assert.equal(page.left.diff(0), "", "left");
	//});

});