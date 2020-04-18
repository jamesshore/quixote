// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var SizeDescriptor = require("./size_descriptor.js");
var PositionDescriptor = require("./position_descriptor.js");
var GenericSize = require("./generic_size.js");
var Position = require("../values/position.js");
var Size = require("../values/size.js");

describe("DESCRIPTOR: GenericSize", function() {

	var IRRELEVANT_POSITION = 42;
	var IRRELEVANT_DESCRIPTION = "irrelevant";

	it("is a descriptor", function() {
		assert.implements(genericSize(IRRELEVANT_POSITION, IRRELEVANT_POSITION, IRRELEVANT_DESCRIPTION), SizeDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(genericSize(10, 30, IRRELEVANT_DESCRIPTION).value(), Size.create(20), "forward");
		assert.objEqual(genericSize(30, 10, IRRELEVANT_DESCRIPTION).value(), Size.create(20), "backward");
	});

	it("renders to a string", function() {
		assert.equal(genericSize(IRRELEVANT_POSITION, IRRELEVANT_POSITION, "my description").toString(), "my description");
	});

	it("has assertions", function() {
		assert.exception(
			function() { genericSize(10, 30, "size").should.equal(30); },
			"size should be 10px bigger.\n" +
			"  Expected: 30px\n" +
			"  But was:  20px"
		);
	});

});

function genericSize(from, to, description) {
	return GenericSize.create(new TestPosition(from), new TestPosition(to), description);
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
