// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Assertable = require("./assertable.js");
var reset = require("./__reset.js");

describe("Assertable abstract base class", function() {

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

	describe("clip", function() {
		it("supports assertions in nested expected with clip object", function() {
			var domElement = element.toDomElement();

			domElement.setAttribute("style", [
				"position: absolute",
				"left: 20px",
				"top: 10px",
				"margin-top: 35px",
				"margin-left: 14px",
				"margin-bottom: 102px",
				"margin-right: 900px",
				"width: 130px",
				"height: 60px",
				"clip: rect(5px 120px 45px 20px)",
				"clip: rect(5px, 120px, 45px, 20px)"
			].join(";"));

			element.assert({
				clip: {
					top: 5 + 10 + 35,       // clip top + top + margin-top
					bottom: 45 + 10 + 35,   // clip bottom + top + margin-top
					left: 20 + 20 + 14,     // clip left + left + margin-left
					right: 120 + 20 + 14,   // clip right + left + margin-left
					width: 100,
					height: 40
				}
			}, "nested expected clip object works");
		});

		it("can compare ElementClipEdge against like-directioned ElementEdges", function() {
			// bottom of two should be 100
			var two = frame.add("<div style='position: absolute; top: 25px; margin-top: 35px; height: 40px;'>two</div>");

			// top of element's clip rect should be at 100
			var domElement = element.toDomElement();
			domElement.setAttribute("style", [
				"position: absolute",
				"top: 60px",
				"margin-top: 25px",
				"height: 60px",
				"clip: rect(15px auto auto auto)",
				"clip: rect(15px, auto, auto, auto)"
			].join(";"));

			element.assert({
				clip: {
					top: two.bottom
				}
			}, "element's clipTop equals the bottom of two");
		});

		it("will throw a ClipNotAppliedException when asserting clip on an element that is not position: absolute or fixed", function() {
			var domElement = element.toDomElement();

			domElement.setAttribute("style", [
				"position: relative",   // clip styles should be ignored because position: relative is used instead of absolute
				"left: 20px",
				"top: 10px",
				"width: 130px",
				"height: 60px",
				"clip: rect(5px 120px 45px 20px)",
				"clip: rect(5px, 120px, 45px, 20px)"
			].join(";"));

			var ClipNotAppliedException = require("./descriptors/element_clip_edge").ClipNotAppliedException;
			assert.exception(
				function() {
					element.assert({
						clip: {
							top: 25       // clip top + top
						}
					});
				},
				ClipNotAppliedException,
				"element.assert will fail with a ClipNotAppliedException because a clip style could not be computed");
		});
	});

});
