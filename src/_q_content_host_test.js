// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var assert = require("./util/assert.js");
var quixote = require("./quixote.js");
var reset = require("./__reset.js");
var QContentHost = require("./q_content_host");
var QElement = require("./q_element.js");
var QViewport = require("./q_viewport.js");
var QPage = require("./q_page.js");


describe("FOUNDATION: QContentHost", function() {

    describe("instance", function() {

        var frame;
        var contentHost;

        before(function() {
            frame = reset.frame;
            contentHost = frame.toContentHost();
        });

        it("compares to another QContentHost", function() {
            var contentHost1 = new QContentHost(frame.toDomElement().contentDocument);
            var contentHost2 = new QContentHost(document);

			assert.objEqual(contentHost, contentHost1, "equality");
			assert.objNotEqual(contentHost, contentHost2, "inequality");
		});

        it("provides access to viewport descriptors", function() {
			assert.type(contentHost.viewport(), QViewport);
		});

		it("provides access to page descriptors", function() {
			assert.type(contentHost.page(), QPage);
        });
        
        it("provides access to raw HTML", function() {
            assert.equal(contentHost.toDomElement(), frame.toDomElement().contentWindow);
        });

		it("retrieves body element", function() {
			assert.objEqual(contentHost.body(), new QElement(frame.toDomElement().contentDocument.body, "body"), "body element");
			assert.equal(contentHost.body().toString(), "'body'", "body description");
        });
        
        it("adds an element", function() {
			var element = contentHost.add("<p>foo</p>");
			var body = contentHost.body();

			assert.objEqual(element.parent(), body, "element should be present in contentHost body");
			assert.equal(element.toString(), "'<p>foo</p>'", "name should match the HTML created");
		});

		it("uses optional nickname to describe added elements", function() {
			var element = contentHost.add("<p>foo</p>", "my element");
			assert.equal(element.toString(), "'my element'");
		});

		it("retrieves an element by selector", function() {
			var expected = contentHost.add("<div id='foo' class='bar' baz='boo'>Irrelevant text</div>");
			var byId = contentHost.get("#foo");
			var byClass = contentHost.get(".bar");
			var byAttribute = contentHost.get("[baz]");

			assert.objEqual(byId, expected, "should get element by ID");
			assert.objEqual(byClass, expected, "should get element by class");
			assert.objEqual(byAttribute, expected, "should get element by attribute");

			assert.equal(byId.toString(), "'#foo'", "should describe element by selector used");
		});

		it("uses optional nickname to describe retrieved elements", function() {
			contentHost.add("<div id='foo'>Irrelevant text</div>");
			var element = contentHost.get("#foo", "Bestest Element Ever!!");
			assert.equal(element.toString(), "'Bestest Element Ever!!'");
		});

		it("fails fast when retrieving non-existant element", function() {
			assert.exception(function() {
				contentHost.get(".blah");
			}, /Expected one element to match '\.blah', but found 0/);
		});

		it("fails fast when retrieving too many elements", function() {
			contentHost.add("<div><p>One</p><p>Two</p></div>");

			assert.exception(function() {
				contentHost.get("p");
			}, /Expected one element to match 'p', but found 2/);
		});

		it("retrieves a list of elements", function() {
			contentHost.add("<div><p id='p1'>One</p><p>Two</p><p>Three</p></div>");
			var some = contentHost.getAll("p");
			var named = contentHost.getAll("p", "my name");

			assert.objEqual(some.at(0), contentHost.get("#p1"), "should get a working list");
			assert.equal(some.toString(), "'p' list", "should describe it by its selector");
			assert.equal(named.toString(), "'my name' list", "should use nickname when provided");
        });
        
        it("scrolls", function() {
			contentHost.add("<div style='position: absolute; left: 5000px; top: 5000px; width: 60px'>scroll enabler</div>");

			assert.deepEqual(frame.getRawScrollPosition(), { x: 0, y: 0 }, "should start at (0, 0)");

			contentHost.scroll(150, 300);
			var position = contentHost.getRawScrollPosition();
			if (quixote.browser.enlargesFrameToPageSize()) {
				assert.equal(position.x, 0, "should not have scrolled horizontally because whole page is displayed");
				assert.equal(position.y, 0, "should not have scrolled vertically because whole page is displayed");
			}
			else {
				assert.equal(position.x, 150, "should have scrolled right");
				assert.equal(position.y, 300, "should have scrolled down");
			}
        });

    });

});