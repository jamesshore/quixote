// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var ElementEdge = require("./element_edge.js");

describe.only("ElementEdge", function() {

	var frame;

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
	});

	it("diffs against expected value", function() {
		var element = frame.addElement("<p>foo</p>");

		var edge = ElementEdge.top(element);
		var diff = edge.diff(13);
		assert.equal(diff, "Element top edge expected 13, but was 0");
	});

});