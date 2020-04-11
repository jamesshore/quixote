// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var BrowsingContext = require("./browsing_context.js");
var async = require("../vendor/async-1.4.2.js");

var Me = module.exports = function QFrame() {
	ensure.signature(arguments, []);

	this._domElement = null;
	this._loaded = false;
	this._removed = false;
};

function loaded(self, width, height, src, stylesheets) {

	self._loaded = true;
	self._document = self._domElement.contentDocument;
	self._browsingContext = new BrowsingContext(self._document);
	self._originalBody = self._document.body.innerHTML;
	self._originalWidth = width;
	self._originalHeight = height;
	self._originalSrc = src;
	self._originalStylesheets = stylesheets;
}

Me.create = function create(parentElement, options, callback) {
	ensure.signature(arguments, [Object, [Object, Function], [undefined, Function]]);
	if (callback === undefined) {
		callback = options;
		options = {};
	}
	var width = options.width || 2000;
	var height = options.height || 2000;
	var src = options.src;
	var stylesheets = options.stylesheet || [];
	var css = options.css;
	if (!shim.Array.isArray(stylesheets)) stylesheets = [ stylesheets ];

	var frame = new Me();
	checkUrls(src, stylesheets, function(err) {
		if (err) return callback(err);

		var iframe = insertIframe(parentElement, width, height);
		shim.EventTarget.addEventListener(iframe, "load", onFrameLoad);
		setIframeContent(iframe, src);

		frame._domElement = iframe;
		setFrameLoadCallback(frame, callback);
	});
	return frame;

	function onFrameLoad() {
		// WORKAROUND Mobile Safari 7.0.0, Safari 6.2.0, Chrome 38.0.2125: frame is loaded synchronously
		// We force it to be asynchronous here
		setTimeout(function() {
			loaded(frame, width, height, src, stylesheets);
			addStylesheetLinkTags(frame, stylesheets, function() {
				if (css) addStyleTag(frame, options.css);
				frame._frameLoadCallback(null, frame);
			});
		}, 0);
	}
};

function setFrameLoadCallback(frame, callback) {
	frame._frameLoadCallback = callback;
}

function checkUrls(src, stylesheets, callback) {
	urlExists(src, function(err, srcExists) {
		if (err) return callback(err);
		if (!srcExists) return callback(error("src", src));

		async.each(stylesheets, checkStylesheet, callback);
	});

	function checkStylesheet(url, callback2) {
		urlExists(url, function(err, stylesheetExists) {
			if (err) return callback2(err);

			if (!stylesheetExists) return callback2(error("stylesheet", url));
			else return callback2(null);
		});
	}

	function error(name, url) {
		return new Error("404 error while loading " + name + " (" + url + ")");
	}
}

function urlExists(url, callback) {
	var STATUS_AVAILABLE = 2;   // WORKAROUND IE 8: non-standard XMLHttpRequest constant names

	if (url === undefined) {
		return callback(null, true);
	}

	var http = new XMLHttpRequest();
	http.open("HEAD", url);
	http.onreadystatechange = function() {  // WORKAROUND IE 8: doesn't support .addEventListener() or .onload
		if (http.readyState === STATUS_AVAILABLE) {
			return callback(null, http.status !== 404);
		}
	};
	http.onerror = function() {     // onerror handler is not tested
		return callback("XMLHttpRequest error while using HTTP HEAD on URL '" + url + "': " + http.statusText);
	};
	http.send();
}

function insertIframe(parentElement, width, height) {
	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	iframe.setAttribute("frameborder", "0");    // WORKAROUND IE 8: don't include frame border in position calcs
	parentElement.appendChild(iframe);
	return iframe;
}

function setIframeContent(iframe, src) {
	if (src === undefined) {
		writeStandardsModeHtml(iframe);
	}	else {
		setIframeSrc(iframe, src);
	}
}

function setIframeSrc(iframe, src) {
	iframe.setAttribute("src", src);
}

function writeStandardsModeHtml(iframe) {
	var standardsMode = "<!DOCTYPE html>\n<html><head></head><body></body></html>";
	iframe.contentWindow.document.open();
	iframe.contentWindow.document.write(standardsMode);
	iframe.contentWindow.document.close();
}

function addStylesheetLinkTags(self, urls, callback) {
	async.each(urls, addLinkTag, callback);

	function addLinkTag(url, onLinkLoad) {
		var link = self._document.createElement("link");
		shim.EventTarget.addEventListener(link, "load", function(event) { onLinkLoad(null); });
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute("href", url);
		shim.Document.head(self._document).appendChild(link);
	}
}

function addStyleTag(self, css) {
	var style = document.createElement("style");
	style.setAttribute("type", "text/css");
	if (style.styleSheet) {
		// WORKAROUND IE 8: Throws 'unknown runtime error' if you set innerHTML on a <style> tag
		style.styleSheet.cssText = css;
	}
	else {
		style.innerHTML = css;
	}
	shim.Document.head(self._document).appendChild(style);
}

Me.prototype.reset = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	this._document.body.innerHTML = this._originalBody;
	this.scroll(0, 0);
	this.resize(this._originalWidth, this._originalHeight);
};

Me.prototype.reload = function(callback) {
	ensure.signature(arguments, [Function]);
	ensureUsable(this);

	var frame = this;
	var iframe = this._domElement;
	var src = this._originalSrc;

	this.resize(this._originalWidth, this._originalHeight);
	setFrameLoadCallback(frame, callback);
	setIframeContent(iframe, src);
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	return this._domElement;
};

Me.prototype.toBrowsingContext = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	return this._browsingContext;
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	ensureLoaded(this);
	if (this._removed) return;

	this._domElement.parentNode.removeChild(this._domElement);
	this._removed = true;
};

Me.prototype.viewport = function() {
	ensureUsable(this);

	return this._browsingContext.viewport();
};

Me.prototype.page = function() {
	ensureUsable(this);

	return this._browsingContext.page();
};

Me.prototype.body = function() {
	ensureUsable(this);

	return this._browsingContext.body();
};

Me.prototype.add = function(html, nickname) {
	ensureUsable(this);

	return this._browsingContext.add(html, nickname);
};

Me.prototype.get = function(selector, nickname) {
	ensureUsable(this);

	return this._browsingContext.get(selector, nickname);
};

Me.prototype.getAll = function(selector, nickname) {
	ensureUsable(this);

	return this._browsingContext.getAll(selector, nickname);
};

Me.prototype.scroll = function scroll(x, y) {
	ensureUsable(this);

	return this._browsingContext.scroll(x, y);
};

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
	ensureUsable(this);

	return this._browsingContext.getRawScrollPosition();
};

Me.prototype.resize = function resize(width, height) {
	ensure.signature(arguments, [Number, Number]);
	ensureUsable(this);

	this._domElement.setAttribute("width", "" + width);
	this._domElement.setAttribute("height", "" + height);
	this.forceReflow();
};

Me.prototype.forceReflow = function forceReflow() {
	this._browsingContext.forceReflow();
};

function ensureUsable(self) {
	ensureLoaded(self);
	ensureNotRemoved(self);
}

function ensureLoaded(self) {
	ensure.that(self._loaded, "QFrame not loaded: Wait for frame creation callback to execute before using frame");
}

function ensureNotRemoved(self) {
	ensure.that(!self._removed, "Attempted to use frame after it was removed");
}
