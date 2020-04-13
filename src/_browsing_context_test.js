// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var reset = require("./__reset.js");
var BrowsingContext = require("./browsing_context.js");
var QElement = require("./q_element.js");
var QViewport = require("./q_viewport.js");
var QPage = require("./q_page.js");


describe("FOUNDATION: BrowsingContext", function() {

	describe("instance", function() {

		var frame;
		var browsingContext;

		before(function() {
			frame = reset.frame;
			browsingContext = frame.toBrowsingContext();
		});

		it("compares to another BrowsingContext", function() {
			var browsingContext1 = new BrowsingContext(frame.toDomElement().contentDocument);
			var browsingContext2 = new BrowsingContext(document);

			assert.objEqual(browsingContext, browsingContext1, "equality");
			assert.objNotEqual(browsingContext, browsingContext2, "inequality");
		});

		it("provides access to viewport descriptors", function() {
			assert.type(browsingContext.viewport(), QViewport);
		});

		it("provides access to page descriptors", function() {
			assert.type(browsingContext.page(), QPage);
		});

		it("provides access to raw HTML", function() {
			assert.equal(browsingContext.contentWindow, frame.toDomElement().contentWindow);
		});

		it("retrieves body element", function() {
			assert.objEqual(
				browsingContext.body(),
				QElement.create(frame.toDomElement().contentDocument.body, "<body>"),
				"body element"
			);
			assert.equal(browsingContext.body().toString(), "'<body>'", "body description");
		});

		it("adds an element", function() {
			var element = browsingContext.add("<p id='myId'>foo</p>");
			var body = browsingContext.body();

			assert.objEqual(element.parent(), body, "element should be present in browsingContext body");
			assert.equal(element.toString(), "'#myId'", "should generate default nickname");
		});

		it("uses optional nickname to describe added elements", function() {
			var element = browsingContext.add("<p>foo</p>", "my element");
			assert.equal(element.toString(), "'my element'");
		});

		it("retrieves an element by selector", function() {
			var expected = browsingContext.add("<div id='foo' class='bar' baz='boo'>Irrelevant text</div>");
			var byId = browsingContext.get("#foo");
			var byClass = browsingContext.get(".bar");
			var byAttribute = browsingContext.get("[baz]");

			assert.objEqual(byId, expected, "should get element by ID");
			assert.objEqual(byClass, expected, "should get element by class");
			assert.objEqual(byAttribute, expected, "should get element by attribute");

			assert.equal(byId.toString(), "'#foo'", "should describe element by selector used");
		});

		it("uses optional nickname to describe retrieved elements", function() {
			browsingContext.add("<div id='foo'>Irrelevant text</div>");
			var element = browsingContext.get("#foo", "Bestest Element Ever!!");
			assert.equal(element.toString(), "'Bestest Element Ever!!'");
		});

		it("fails fast when retrieving non-existant element", function() {
			assert.exception(function() {
				browsingContext.get(".blah");
			}, /Expected one element to match '\.blah', but found 0/);
		});

		it("fails fast when retrieving too many elements", function() {
			browsingContext.add("<div><p>One</p><p>Two</p></div>");

			assert.exception(function() {
				browsingContext.get("p");
			}, /Expected one element to match 'p', but found 2/);
		});

		it("retrieves a list of elements", function() {
			browsingContext.add("<div><p id='p1'>One</p><p>Two</p><p>Three</p></div>");
			var some = browsingContext.getAll("p");
			var named = browsingContext.getAll("p", "my name");

			assert.objEqual(some.at(0), browsingContext.get("#p1"), "should get a working list");
			assert.equal(some.toString(), "'p' list", "should describe it by its selector");
			assert.equal(named.toString(), "'my name' list", "should use nickname when provided");
		});

		it("scrolls", function() {
			browsingContext.add("<div style='position: absolute; left: 5000px; top: 5000px; width: 60px'>scroll enabler</div>");

			assert.deepEqual(browsingContext.getRawScrollPosition(), { x: 0, y: 0 }, "should start at (0, 0)");

			browsingContext.scroll(150, 300);
			var position = browsingContext.getRawScrollPosition();

			// WORKAROUND Chrome Mobile 74: scrolls to a fractional positions (149.7142791748047, 299.80950927734375),
			// so we round it off
			assert.equal(Math.round(position.x), 150, "should have scrolled right");
			assert.equal(Math.round(position.y), 300, "should have scrolled down");
		});

	});

});