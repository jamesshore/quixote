// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var ElementEdge = require("./element_edge.js");

describe.only("ElementEdge", function() {

	var frame;
	var element;

	before(function(done) {
		quixote.createFrame(500, 500, { stylesheet: "/base/src/__reset.css" }, function(theFrame) {
			frame = theFrame;
			done();
		});
	});

	after(function() {
		frame.remove();
	});

	beforeEach(function() {
		frame.reset();
		element = frame.addElement(
			"<p style='position: absolute; left: 20px; width: 30px; top: 10px; height: 60px'>foo</p>"
		);
	});

	it("diffs against expected value", function() {
		var edge = ElementEdge.top(element);
		assert.equal(edge.diff(13), "Element top edge expected 13, but was 10", "difference");
		assert.equal(edge.diff(10), "", "no difference");
	});

	it("checks every edge", function() {
		var top = ElementEdge.top(element);
		var right = ElementEdge.right(element);
		var bottom = ElementEdge.bottom(element);
		var left = ElementEdge.left(element);

		assert.equal(top.diff(10), "", "top");
		assert.equal(right.diff(50), "", "right");
		assert.equal(bottom.diff(70), "", "bottom");
		assert.equal(left.diff(20), "", "left");


		//TODO: factor out expected values
	});

});