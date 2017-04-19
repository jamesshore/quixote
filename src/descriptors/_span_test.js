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

		var IRRELEVANT_POS = 42;
		var IRRELEVANT_DESC = "irrelevant";

		it("is a descriptor", function() {
		  assert.implements(span(IRRELEVANT_POS, IRRELEVANT_POS, IRRELEVANT_DESC), SizeDescriptor);
		});

		it("resolves to value", function() {
			assert.objEqual(span(10, 30, IRRELEVANT_DESC).value(), Size.create(20), "forward");
			assert.objEqual(span(30, 10, IRRELEVANT_DESC).value(), Size.create(20), "backward");
		});

		it("renders to a string", function() {
			assert.equal(span(IRRELEVANT_POS, IRRELEVANT_POS, "my description").toString(), "my description");
		});

	});

	function span(from, to, description) {
		return Span.create(new TestPosition(from), new TestPosition(to), description);
	}

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