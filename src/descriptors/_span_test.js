// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../util/assert.js");
	var reset = require("../__reset.js");
	var SizeDescriptor = require("./size_descriptor.js");
	var PositionDescriptor = require("./position_descriptor.js");
	var Span = require("./span.js");

	describe("DESCRIPTOR: Span", function() {

		it("runs tests", function() {
			span(10, 20);
		});

		function span(from, to) {
			Span.create(new TestPosition(from), new TestPosition(to));
		}

	});


	function TestPosition(position) {
		this._position = this.convert(position);
	}
	PositionDescriptor.extend(TestPosition);

	TestPosition.prototype.value = function value() {
		assert.fail("TestPosition.value() not implemented");
	};

	TestPosition.prototype.toString = function toString() {
		return "test position: " + this._position;
	};

}());