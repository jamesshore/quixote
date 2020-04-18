// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var SizeDescriptor = require("./size_descriptor.js");
var PositionDescriptor = require("./position_descriptor.js");
var Span = require("./span.js");
var Position = require("../values/position.js");
var Size = require("../values/size.js");

var IRRELEVANT_POSITION = 42;
var IRRELEVANT_DESCRIPTION = "irrelevant";

describe("DESCRIPTOR: Span", function() {

	it("is a descriptor", function() {
		assert.implements(xSpan(IRRELEVANT_POSITION, IRRELEVANT_POSITION), SizeDescriptor);
	});

	it("resolves to value", function() {
		assert.objEqual(xSpan(10, 30).value(), Size.create(20), "forward");
		assert.objEqual(xSpan(30, 10).value(), Size.create(20), "backward");
	});

	it("renders to a string", function() {
		assert.equal(xSpan(IRRELEVANT_POSITION, IRRELEVANT_POSITION, "my description").toString(), "my description");
	});

	it("has assertions", function() {
		assert.exception(
			function() { xSpan(10, 30, "size").should.equal(30); },
			"size should be 10px bigger.\n" +
			"  Expected: 30px\n" +
			"  But was:  20px"
		);
	});

	it("has horizontal center", function() {
		var center = xSpan(10, 30, "my description").center;

		assert.objEqual(center.value(), Position.x(20), "value");
		assert.equal(center.toString(), "center of my description", "description");

		// if (quixote.browser.misreportsClipAutoProperty()) return;
		//
		// assert.objEqual(rendered.center.value(), renderedElement.center.value(), "rendered center");
		// assert.objEqual(displayNone.center.value(), Position.noX(), "non-rendered center");
		// assert.objEqual(noSize.center.value(), Position.noX(), "zero-width center");
		//
		// assert.objEqual(rendered.middle.value(), renderedElement.middle.value(), "rendered middle");
		// assert.objEqual(displayNone.middle.value(), Position.noY(), "non-rendered middle");
		// assert.objEqual(noSize.middle.value(), Position.noY(), "zero-width middle");
		//
		// assert.equal(rendered.center.toString(), "rendered center of " + renderedElement, "center description");
		// assert.equal(rendered.middle.toString(), "rendered middle of " + renderedElement, "middle description");
	});

	it("has vertical middle");

	it("fails fast when asking for horizontal center of vertical span");

	it("fails fast when asking vertical middle of horizontal span");

});

function xSpan(from, to, description) {
	if (description === undefined) description = IRRELEVANT_DESCRIPTION;
	return Span.create(new TestPosition(Position.x(from)), new TestPosition(Position.x(to)), description);
}

function ySpan(from, to, description) {
	if (description === undefined) description = IRRELEVANT_DESCRIPTION;
	return Span.create(new TestPosition(Position.y(from)), new TestPosition(Position.y(to)), description);
}

function TestPosition(position) {
	this._position = position;
}
PositionDescriptor.extend(TestPosition);
TestPosition.prototype.value = function value() { return this._position; };
TestPosition.prototype.toString = function toString() { return "test position: " + this._position; };
