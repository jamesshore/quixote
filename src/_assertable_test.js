// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Assertable = require("./assertable.js");
var reset = require("./__reset.js");

describe("FOUNDATION: Assertable abstract base class", function() {

	var TOP = 10;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	var frame;
	var element;

	beforeEach(function() {
		frame = reset.frame;
		frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		element = frame.get("#element");
	});

	it("can be extended", function() {
		function Subclass() {}

		Assertable.extend(Subclass);
		assert.type(new Subclass(), Assertable);
	});

	it("diffs one property", function() {
		var expected = element.top.diff(600);
		assert.equal(element.diff({ top: 600 }), expected, "difference");
		assert.equal(element.diff({ top: TOP }), "", "no difference");
	});

	it("diffs multiple properties", function() {
		var topDiff = element.top.diff(600);
		var rightDiff = element.right.diff(400);
		var bottomDiff = element.bottom.diff(200);

		assert.equal(
			element.diff({ top: 600, right: 400, bottom: 200 }),
			topDiff + "\n" + rightDiff + "\n" + bottomDiff,
			"three differences"
		);
		assert.equal(element.diff({ top: TOP, right: RIGHT, bottom: BOTTOM }), "", "no differences");
		assert.equal(
			element.diff({ top: 600, right: RIGHT, bottom: 200}),
			topDiff + "\n" + bottomDiff,
			"two differences, with middle one okay"
		);
		assert.equal(element.diff({ top: TOP, right: RIGHT, bottom: 200}), bottomDiff, "one difference");
	});

	it("supports relative comparisons", function() {
		var two = frame.add("<div style='position: absolute; top: " + TOP + "px;'>two</div>");
		assert.equal(element.diff({ top: two.top }), "", "relative diff");
	});

	it("has variant that throws an exception when differences found", function() {
		var diff = element.diff({ top: 600 });

		assert.noException(function() {
			element.assert({ top: TOP });
		}, "same");

		assert.exception(function() {
			element.assert({ top: 600 });
		}, "Differences found:\n" + diff + "\n", "different");

		assert.exception(function() {
			element.assert({ top: 600 }, "a message");
		}, "a message:\n" + diff + "\n", "different, with a message");
	});

});