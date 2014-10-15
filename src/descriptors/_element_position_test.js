// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var quixote = require("../quixote.js");
var ElementPosition = require("./element_position.js");

describe.only("ElementPosition", function() {

	var frame;
	var one;
	var y;

	var TOP = 10;
	var RIGHT = 150;
	var BOTTOM = 70;
	var LEFT = 20;

	before(function(done) {
		frame = quixote.createFrame(500, 500, { stylesheet: "/base/src/__reset.css" }, done);
	});

	after(function() {
		frame.remove();
	});

	beforeEach(function() {
		frame.reset();
		frame.addElement(
			"<p id='one' style='position: absolute; left: 20px; width: 130px; top: 10px; height: 60px'>one</p>"
		);
		one = frame.getElement("#one");
		y = ElementPosition.y(one.top, 10);
	});

	it("describes itself", function() {
		assert.equal(descriptionX(one.left, 10), "10px right of left edge", "right");
		assert.equal(descriptionX(one.left, -15), "15px left of left edge", "left");
		assert.equal(descriptionX(one.left, 0), "left edge", "same x");

		assert.equal(descriptionY(one.top, 20), "20px below top edge", "below");
		assert.equal(descriptionY(one.top, -20), "20px above top edge", "above");
		assert.equal(descriptionY(one.top, 0), "top edge", "same y");

		function descriptionX(edge, amount) {
			return ElementPosition.x(edge, amount).description();
		}

		function descriptionY(edge, amount) {
			return ElementPosition.y(edge, amount).description();
		}
	});

	it("converts to string", function() {
		assert.equal(y.toString(), "10px below top edge of element '#one'");
	});

	it("describes match", function() {
//		assert.equal(top.describeMatch(), "match top edge of element '#one' (10px)");
	});

});