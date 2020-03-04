// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var QElementList = require("./q_element_list.js");

describe("FOUNDATION: QElementList", function() {

	var none;
	var one;
	var some;
	var item1;
	var item2;
	var item3;

	before(function() {
		var frame = reset.frame;
		var document = frame.toDomElement().contentDocument;

		var list = frame.add("" +
			"<ul>" +
			"  <li id='item1'>Item 1</li>" +
			"  <li id='item2'>Item 2</li>" +
			"  <li id='item3'>Item 3</li>" +
			"</ul>", "list"
		);

		var noneDom = document.querySelectorAll(".no-such-class");
		var oneDom = document.querySelectorAll("ul");
		var someDom = document.querySelectorAll("li");

		none = new QElementList(noneDom, "none");
		one = new QElementList(oneDom, "one");
		some = new QElementList(someDom, "some");

		item1 = frame.get("#item1");
		item2 = frame.get("#item2");
		item3 = frame.get("#item3");
	});

	it("reports length", function() {
		assert.equal(none.length(), 0, "none");
		assert.equal(one.length(), 1, "one");
		assert.equal(some.length(), 3, "some");
	});

	it("describes itself", function() {
		assert.equal(none.toString(), "'none' list");
	});

	it("retrieves elements by index", function() {
		assert.objEqual(some.at(0), item1, "zero-based indexing");
		assert.objEqual(some.at(1), item2, "forward index");
		assert.objEqual(some.at(-1), item3, "backward index");
	});

	it("describes retrieved elements", function() {
		assert.equal(some.at(1).toString(), "'some[1]'", "forward index");
		assert.equal(some.at(-3).toString(), "'some[0]'", "backward index");
		assert.equal(some.at(1, "my name").toString(), "'my name'", "nickname provided");
	});

	it("fails fast when element out of bounds", function() {
		assert.exception(function() {
			none.at(0);
		}, "'none'[0] is out of bounds; list length is 0", "forward index");
		assert.exception(function() {
			some.at(-5);
		}, "'some'[-5] is out of bounds; list length is 3", "backward index");
	});

});