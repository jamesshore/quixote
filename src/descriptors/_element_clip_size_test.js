// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var quixote = require("../quixote.js");
var SizeDescriptor = require("./size_descriptor.js");
var ElementClipSize = require("./element_clip_size.js");
var ElementClipEdge = require("./element_clip_edge.js");
var Size = require("../values/size.js");

describe("ElementClipSize", function() {

	var element;
	var clipTop;
	var clipRight;
	var clipBottom;
	var clipLeft;
	var clipWidth;
	var clipHeight;

	beforeEach(function() {
		var frame = reset.frame;
		frame.add(
			"<p id='element'>element</p>"
		);

		element = frame.get("#element");
		clipTop =  ElementClipEdge.top(element);
		clipRight = ElementClipEdge.right(element);
		clipBottom = ElementClipEdge.bottom(element);
		clipLeft = ElementClipEdge.left(element);

		clipWidth = ElementClipSize.x(clipLeft, clipRight, "clip width for #element");
		clipHeight = ElementClipSize.y(clipTop, clipBottom, "clip height for #element");
	});

	it("is a size descriptor", function() {
		assert.implements(clipWidth, SizeDescriptor);
	});

	it("auto edges resolve to width/height values of element border box", function() {
		var WIDTH = 130;
		var HEIGHT = 60;

		var domElement = element.toDomElement();
		domElement.setAttribute("style", [
			"position: absolute",
			"left: 20px",
			"top: 20px",
			"width: 130px",
			"height: 60px",
			"clip: rect(auto auto auto auto)",   // legacy ie clip format
			"clip: rect(auto, auto, auto, auto)" // modern browser clip format
		].join(";"));

		assert.objEqual(clipWidth.value(), Size.create(WIDTH), "width");
		assert.objEqual(clipHeight.value(), Size.create(HEIGHT), "height");
	});

	it("auto edges include border and padding, but not margin", function() {
		var WIDTH = 130;
		var HEIGHT = 60;

		var domElement = element.toDomElement();

		domElement.setAttribute("style", [
			"position: absolute",
			"left: 20px",
			"top: 20px",
			"width: 130px",
			"height: 60px",
			"border: solid 4px red",
			"margin: 16px",
			"padding: 8px",
			"box-sizing: content-box",
			"clip: rect(auto auto auto auto)",   // legacy ie clip format
			"clip: rect(auto, auto, auto, auto)" // modern browser clip format
		].join(";"));

		assert.objEqual(clipWidth.value(), Size.create(WIDTH + (4*2) + (8*2)), "width");
		assert.objEqual(clipHeight.value(), Size.create(HEIGHT + (4*2) + (8*2)), "height");
	});

	it("can compute the correct width when the clip rect is inside the border box", function() {
		var domElement = element.toDomElement();

		domElement.setAttribute("style", [
			"position: absolute",
			"left: 20px",
			"top: 20px",
			"width: 25px",
			"height: 40px",
			"border: solid 4px red",
			"margin: 16px",
			"padding: 8px",
			"box-sizing: content-box",
			"clip: rect(15px 41px 30px 18px)",   // legacy ie clip format
			"clip: rect(15px, 41px, 30px, 18px)" // modern browser clip format
		].join(";"));

		assert.objEqual(clipWidth.value(), Size.create(41 - 18), "width");
		assert.objEqual(clipHeight.value(), Size.create(30 - 15), "height");
	});

	it("can compute the correct width/height when the clip rect goes outside the border box", function() {
		var domElement = element.toDomElement();

		domElement.setAttribute("style", [
			"position: absolute",
			"left: 20px",
			"top: 20px",
			"width: 15px",
			"height: 20px",
			"border: solid 4px red",
			"margin: 16px",
			"padding: 8px",
			"box-sizing: content-box",
			"clip: rect(-20px 50px 65px -10px)",   // legacy ie clip format
			"clip: rect(-20px, 50px, 65px, -10px)" // modern browser clip format
		].join(";"));

		assert.objEqual(clipWidth.value(), Size.create(50 - (-10)), "width");
		assert.objEqual(clipHeight.value(), Size.create(65 - (-20)), "height");
	});

	it("width and height will go to zero with the element is completely clipped", function() {
		var domElement = element.toDomElement();

		domElement.setAttribute("style", [
			"position: absolute",
			"width: 15px",
			"height: 20px",
			"border: solid 4px red",
			"margin: 16px",
			"padding: 8px",
			"box-sizing: content-box",
			"clip: rect(0 0 0 0)",   // legacy ie clip format
			"clip: rect(0, 0, 0, 0)" // modern browser clip format
		].join(";"));

		assert.objEqual(clipWidth.value(), Size.create(0), "zero width");
		assert.objEqual(clipHeight.value(), Size.create(0), "zero height");
	});

	it("width and height will go negative if the clip rect says to", function() {
		var domElement = element.toDomElement();

		domElement.setAttribute("style", [
			"position: absolute",
			"width: 15px",
			"height: 20px",
			"border: solid 4px red",
			"margin: 16px",
			"padding: 8px",
			"box-sizing: content-box",
			"clip: rect(0px -50px -50px 0px)",   // top: 0, right: -50, bottom: -50, left: 0
			"clip: rect(0px, -50px, -50px, 0px)"
		].join(";"));

		assert.objEqual(clipWidth.value(), Size.create(-50), "negative width");
		assert.objEqual(clipHeight.value(), Size.create(-50), "negative height");
	});

	it("toString returns _description", function() {
		assert.equal(clipWidth.toString(), clipWidth._description);
		assert.equal(clipHeight.toString(), clipHeight._description);
	});

});
