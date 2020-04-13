// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var reset = require("../src/__reset.js");
var assert = require("../src/util/assert.js");

describe("END-TO-END: Assertion rendering", function() {

	var frame;
	var element;

	beforeEach(function() {
		frame = reset.frame;
		frame.add(
			"<p id='element' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		element = frame.get("#element");
	});

	it("handles fractions well", function() {
		frame.add(
			"<p id='golden' style='position: absolute; left: 20px; width: 162px; top: 10px; height: 100px'>golden</p>"
		);
		var goldenRect = frame.get("#golden");
		var goldenRatio = 1.6180339887;

		goldenRect.assert({
			width: goldenRect.height.times(goldenRatio)
		});
	});

	it("provides nice explanation when descriptor doesn't match a hand-coded value", function() {
		assert.equal(
			element.width.diff(60),
			"width of '#element' should be 70px smaller.\n" +
			"  Expected: 60px\n" +
			"  But was:  130px"
		);
	});

	it("provides nice explanation when relative difference between elements", function() {
		assert.equal(
			element.width.diff(element.height),
			"width of '#element' should be 70px smaller.\n" +
			"  Expected: 60px (height of '#element')\n" +
			"  But was:  130px"
		);
	});

	it("renders multiple differences nicely", function() {
		assert.equal(
			element.diff({
				width: element.height,
				top: 13
			}),
			"width of '#element' should be 70px smaller.\n" +
			"  Expected: 60px (height of '#element')\n" +
			"  But was:  130px\n" +
			"top edge of '#element' should be 3px lower.\n" +
			"  Expected: 13px\n" +
			"  But was:  10px"
		);
	});

	it("fails nicely when invalid property is diff'd", function() {
		assert.exception(function() {
			element.diff({ XXX: "non-existant" });
		}, "'#element' doesn't have a property named 'XXX'. Did you misspell it?");
	});

});