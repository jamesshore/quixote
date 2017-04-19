// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../util/assert.js");
	var reset = require("../__reset.js");
	var SizeDescriptor = require("./size_descriptor.js");
	var PositionDescriptor = require("./position_descriptor.js");
	var Span = require("./span.js");
	var Position = require("../values/position.js");
	var Size = require("../values/size.js");

	describe("DESCRIPTOR: Span", function() {

		var IRRELEVANT = 42;

		it("is a descriptor", function() {
		  assert.implements(span(IRRELEVANT, IRRELEVANT), SizeDescriptor);
		});

		it("resolves to value", function() {
			assert.objEqual(span(10, 30).value(), Size.create(20));
		});

		it("ignores parameter order", function() {
			assert.objEqual(span(10, 30).value(), span(30, 10).value());
		});

		function span(from, to) {
			return Span.create(new TestPosition(from), new TestPosition(to));
		}
	});


	function TestPosition(position) {
		this._position = Position.x(position);
	}
	PositionDescriptor.extend(TestPosition);

	TestPosition.prototype.value = function value() {
		return this._position;
	};

	TestPosition.prototype.toString = function toString() {
		return "test position: " + this._position;
	};

}());