// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var Frame = require("./frame.js");

describe("Frame", function() {



	it("creates iframe DOM element", function() {
		var frame = Frame.create(window.document.body);
		assert.type(frame, Frame, "frame");

		var dom = frame.toDomElement();
		assert.equal(dom.tagName, "IFRAME", "frame element should be an iframe");
	});

});