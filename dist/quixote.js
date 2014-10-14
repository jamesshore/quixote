!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.quixote=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var QElement = require("../q_element.js");

var Me = module.exports = function ElementEdge(element) {
	this._element = element;
};

Me.top = function top(element) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	return new Me(element);
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Number ]);

	return "Element top edge expected " + expected + ", but was " + value(this);
};

function value(self) {
	return self._element.getRawPosition().top;
}
},{"../q_element.js":3,"../util/ensure.js":5}],2:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

var Me = module.exports = function Frame(domElement) {
	ensure.signature(arguments, [ Object ]);
	ensure.that(domElement.tagName === "IFRAME", "DOM element must be an iframe");

	this._domElement = domElement;
	this._document = domElement.contentDocument;
	this._originalBody = this._document.body.innerHTML;
};

Me.create = function create(parentElement, width, height, options, callback) {
	ensure.signature(arguments, [ Object, Number, Number, [ Object, Function ], [ undefined, Function ] ]);

	if (callback === undefined) {
		callback = options;
		options = {};
	}

	// WORKAROUND Mobile Safari 7.0.0: see test
	ensure.that(!(options.src && options.stylesheet), "Cannot specify HTML URL and stylesheet URL simultaneously due to Mobile Safari issue");

	var iframe = document.createElement("iframe");
	addLoadListener(iframe, onFrameLoad);

	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);

	if (options.src) iframe.setAttribute("src", options.src);
	parentElement.appendChild(iframe);

	function onFrameLoad() {
		var frame = new Me(iframe);
		loadStylesheet(frame, options.stylesheet, function() {
			callback(frame);
		});
	}
};

function loadStylesheet(self, url, callback) {
	ensure.signature(arguments, [ Me, [ undefined, String ], Function ]);
	if (url === undefined) return callback();

	var link = document.createElement("link");
	addLoadListener(link, onLinkLoad);
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", url);

	documentHead(self).appendChild(link);

	function onLinkLoad() {
		callback();
	}
}

Me.prototype.reset = function() {
	ensure.signature(arguments, []);

	this._document.body.innerHTML = this._originalBody;
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);

	return this._domElement;
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);

	this._domElement.parentNode.removeChild(this._domElement);
};

Me.prototype.addElement = function(html) {
	ensure.signature(arguments, [ String ]);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._document.body.appendChild(insertedElement);
	return new QElement(insertedElement);
};

Me.prototype.getElement = function(selector) {
	ensure.signature(arguments, [ String ]);

	var nodes = this._document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0]);
};

// WORKAROUND IE8: no addEventListener()
function addLoadListener(iframeDom, callback) {
	if (iframeDom.addEventListener) iframeDom.addEventListener("load", callback);
	else iframeDom.attachEvent("onload", callback);
}

// WORKAROUND IE8: no document.head
function documentHead(self) {
	if (self._document.head) return self._document.head;
	else return self._document.querySelector("head");
}
},{"./q_element.js":3,"./util/ensure.js":5}],3:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementEdge = require("./constraints/element_edge.js");

var Me = module.exports = function QElement(domElement) {
	ensure.signature(arguments, [ Object ]);

	this._domElement = domElement;

//	this.top = ElementEdge.top(this);
};

Me.prototype.getRawStyle = function(styleName) {
	ensure.signature(arguments, [ String ]);

	var styles;
	var result;

	// WORKAROUND IE8: no getComputedStyle()
	if (window.getComputedStyle) {
		styles = window.getComputedStyle(this._domElement);
		result = styles.getPropertyValue(styleName);
	}
	else {
		styles = this._domElement.currentStyle;
		result = styles[camelcase(styleName)];
	}
	if (result === null || result === undefined) result = "";
	return result;
};

Me.prototype.getRawPosition = function() {
	ensure.signature(arguments, []);

	// WORKAROUND IE8: No TextRectangle.height or .width
	var rect = this._domElement.getBoundingClientRect();
	return {
		left: rect.left,
		right: rect.right,
		width: rect.width !== undefined ? rect.width : rect.right - rect.left,

		top: rect.top,
		bottom: rect.bottom,
		height: rect.height !== undefined ? rect.height : rect.bottom - rect.top
	};
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);

	return this._domElement;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._domElement.outerHTML;
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);

	return this._domElement === that._domElement;
};
},{"../vendor/camelcase-1.0.1-modified.js":6,"./constraints/element_edge.js":1,"./util/ensure.js":5}],4:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var Frame = require("./frame.js");

exports.createFrame = function(width, height, options, callback) {
	return Frame.create(document.body, width, height, options, callback);
};
},{"./frame.js":2,"./util/ensure.js":5}],5:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

// ****
// Runtime assertions for production code. (Contrast to assert.js, which is for test code.)
// ****

exports.that = function(variable, message) {
	if (message === undefined) message = "Expected condition to be true";

	if (variable === false) throw new EnsureException(exports.that, message);
	if (variable !== true) throw new EnsureException(exports.that, "Expected condition to be true or false");
};

exports.unreachable = function(message) {
	if (!message) message = "Unreachable code executed";

	throw new EnsureException(exports.unreachable, message);
};

exports.signature = function(args, signature) {
	signature = signature || [];
	var expectedArgCount = signature.length;
	var actualArgCount = args.length;

	if (actualArgCount > expectedArgCount) {
		throw new EnsureException(
			exports.signature,
			"Function called with too many arguments: expected " + expectedArgCount + " but got " + actualArgCount
		);
	}

	var type, arg, name;
	for (var i = 0; i < signature.length; i++) {
		type = signature[i];
		arg = args[i];
		name = "Argument " + i;

		if (!isArray(type)) type = [ type ];

		if (!typeMatches(type, arg, name)) {
			throw new EnsureException(
				exports.signature,
				name + " expected " + explainType(type) + ", but was " + explainArg(arg)
			);
		}
	}
};

function typeMatches(type, arg) {
	for (var i = 0; i < type.length; i++) {
		if (oneTypeMatches(type[i], arg)) return true;
	}
	return false;

	function oneTypeMatches(type, arg) {
		switch (getType(arg)) {
			case "boolean": return type === Boolean;
			case "string": return type === String;
			case "number": return type === Number;
			case "array": return type === Array;
			case "function": return type === Function;
			case "object": return type === Object || arg instanceof type;
			case "undefined": return type === undefined;
			case "null": return type === null;
			case "NaN": return isNaN(type);

			default: exports.unreachable();
		}
	}
}

function explainType(type) {
	var joiner = "";
	var result = "";
	for (var i = 0; i < type.length; i++) {
		result += joiner + explainOneType(type[i]);
		joiner = (i === type.length - 2) ? ", or " : ", ";
	}
	return result;

	function explainOneType(type) {
		switch (type) {
			case Boolean: return "boolean";
			case String: return "string";
			case Number: return "number";
			case Array: return "array";
			case Function: return "function";
			case null: return "null";
			default:
				if (typeof type === "number" && isNaN(type)) return "NaN";
				else return functionName(type) + " instance";
		}
	}
}

function explainArg(arg) {
	var type = getType(arg);
	if (type !== "object") return type;

	var prototype = getPrototype(arg);
	if (prototype === null) return "an object without a prototype";
	else return functionName(prototype.constructor) + " instance";
}

function getType(variable) {
	var type = typeof variable;
	if (variable === null) type = "null";
	if (isArray(variable)) type = "array";
	if (type === "number" && isNaN(variable)) type = "NaN";
	return type;
}


/*****/

var EnsureException = exports.EnsureException = function(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
};
EnsureException.prototype = createObject(Error.prototype);
EnsureException.prototype.constructor = EnsureException;
EnsureException.prototype.name = "EnsureException";


/*****/

// WORKAROUND IE8: no Object.create()
function createObject(prototype) {
	if (Object.create) return Object.create(prototype);

	var Temp = function Temp() {};
	Temp.prototype = prototype;
	return new Temp();
}

// WORKAROUND IE8 IE9 IE10 IE11: no function.name
function functionName(fn) {
	if (fn.name) return fn.name;

	// This workaround is based on code by Jason Bunting et al, http://stackoverflow.com/a/332429
	var funcNameRegex = /function\s+(.{1,})\s*\(/;
	var results = (funcNameRegex).exec((fn).toString());
	return (results && results.length > 1) ? results[1] : "<anon>";
}

// WORKAROUND IE8: no Array.isArray
function isArray(thing) {
	if (Array.isArray) return Array.isArray(thing);

	return Object.prototype.toString.call(thing) === '[object Array]';
}

// WORKAROUND IE8: no Object.getPrototypeOf
function getPrototype(obj) {
	if (Object.getPrototypeOf) return Object.getPrototypeOf(obj);

	var result = obj.constructor ? obj.constructor.prototype : null;
	return result || null;
}
},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	if (str.length === 1) {
		return str;
	}

	return str
	.replace(/^[_.\- ]+/, '')
	.toLowerCase()
	.replace(/[_.\- ]+(\w|$)/g, function (m, p1) {
		return p1.toUpperCase();
	});
};

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9jb25zdHJhaW50cy9lbGVtZW50X2VkZ2UuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9mcmFtZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3FfZWxlbWVudC5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3F1aXhvdGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL2Vuc3VyZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUUVsZW1lbnQgPSByZXF1aXJlKFwiLi4vcV9lbGVtZW50LmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRFZGdlKGVsZW1lbnQpIHtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuXG5NZS50b3AgPSBmdW5jdGlvbiB0b3AoZWxlbWVudCkge1xuLy9cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFFFbGVtZW50IF0pOyAgICAgIC8vIFRPRE86IGNyZWF0ZXMgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciBdKTtcblxuXHRyZXR1cm4gXCJFbGVtZW50IHRvcCBlZGdlIGV4cGVjdGVkIFwiICsgZXhwZWN0ZWQgKyBcIiwgYnV0IHdhcyBcIiArIHZhbHVlKHRoaXMpO1xufTtcblxuZnVuY3Rpb24gdmFsdWUoc2VsZikge1xuXHRyZXR1cm4gc2VsZi5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpLnRvcDtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudC5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBGcmFtZShkb21FbGVtZW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCBdKTtcblx0ZW5zdXJlLnRoYXQoZG9tRWxlbWVudC50YWdOYW1lID09PSBcIklGUkFNRVwiLCBcIkRPTSBlbGVtZW50IG11c3QgYmUgYW4gaWZyYW1lXCIpO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xuXHR0aGlzLl9kb2N1bWVudCA9IGRvbUVsZW1lbnQuY29udGVudERvY3VtZW50O1xuXHR0aGlzLl9vcmlnaW5hbEJvZHkgPSB0aGlzLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTDtcbn07XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIE51bWJlciwgTnVtYmVyLCBbIE9iamVjdCwgRnVuY3Rpb24gXSwgWyB1bmRlZmluZWQsIEZ1bmN0aW9uIF0gXSk7XG5cblx0aWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpIHtcblx0XHRjYWxsYmFjayA9IG9wdGlvbnM7XG5cdFx0b3B0aW9ucyA9IHt9O1xuXHR9XG5cblx0Ly8gV09SS0FST1VORCBNb2JpbGUgU2FmYXJpIDcuMC4wOiBzZWUgdGVzdFxuXHRlbnN1cmUudGhhdCghKG9wdGlvbnMuc3JjICYmIG9wdGlvbnMuc3R5bGVzaGVldCksIFwiQ2Fubm90IHNwZWNpZnkgSFRNTCBVUkwgYW5kIHN0eWxlc2hlZXQgVVJMIHNpbXVsdGFuZW91c2x5IGR1ZSB0byBNb2JpbGUgU2FmYXJpIGlzc3VlXCIpO1xuXG5cdHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuXHRhZGRMb2FkTGlzdGVuZXIoaWZyYW1lLCBvbkZyYW1lTG9hZCk7XG5cblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHdpZHRoKTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBoZWlnaHQpO1xuXG5cdGlmIChvcHRpb25zLnNyYykgaWZyYW1lLnNldEF0dHJpYnV0ZShcInNyY1wiLCBvcHRpb25zLnNyYyk7XG5cdHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblxuXHRmdW5jdGlvbiBvbkZyYW1lTG9hZCgpIHtcblx0XHR2YXIgZnJhbWUgPSBuZXcgTWUoaWZyYW1lKTtcblx0XHRsb2FkU3R5bGVzaGVldChmcmFtZSwgb3B0aW9ucy5zdHlsZXNoZWV0LCBmdW5jdGlvbigpIHtcblx0XHRcdGNhbGxiYWNrKGZyYW1lKTtcblx0XHR9KTtcblx0fVxufTtcblxuZnVuY3Rpb24gbG9hZFN0eWxlc2hlZXQoc2VsZiwgdXJsLCBjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgWyB1bmRlZmluZWQsIFN0cmluZyBdLCBGdW5jdGlvbiBdKTtcblx0aWYgKHVybCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gY2FsbGJhY2soKTtcblxuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXHRhZGRMb2FkTGlzdGVuZXIobGluaywgb25MaW5rTG9hZCk7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwic3R5bGVzaGVldFwiKTtcblx0bGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCB1cmwpO1xuXG5cdGRvY3VtZW50SGVhZChzZWxmKS5hcHBlbmRDaGlsZChsaW5rKTtcblxuXHRmdW5jdGlvbiBvbkxpbmtMb2FkKCkge1xuXHRcdGNhbGxiYWNrKCk7XG5cdH1cbn1cblxuTWUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dGhpcy5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB0aGlzLl9vcmlnaW5hbEJvZHk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dGhpcy5fZG9tRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2RvbUVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLmFkZEVsZW1lbnQgPSBmdW5jdGlvbihodG1sKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblxuXHR2YXIgdGVtcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHR0ZW1wRWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xuXHRlbnN1cmUudGhhdChcblx0XHR0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSxcblx0XHRcIkV4cGVjdGVkIG9uZSBlbGVtZW50LCBidXQgZ290IFwiICsgdGVtcEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggKyBcIiAoXCIgKyBodG1sICsgXCIpXCJcblx0KTtcblxuXHR2YXIgaW5zZXJ0ZWRFbGVtZW50ID0gdGVtcEVsZW1lbnQuY2hpbGROb2Rlc1swXTtcblx0dGhpcy5fZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbnNlcnRlZEVsZW1lbnQpO1xuXHRyZXR1cm4gbmV3IFFFbGVtZW50KGluc2VydGVkRWxlbWVudCk7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblxuXHR2YXIgbm9kZXMgPSB0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblx0ZW5zdXJlLnRoYXQobm9kZXMubGVuZ3RoID09PSAxLCBcIkV4cGVjdGVkIG9uZSBlbGVtZW50IHRvIG1hdGNoICdcIiArIHNlbGVjdG9yICsgXCInLCBidXQgZm91bmQgXCIgKyBub2Rlcy5sZW5ndGgpO1xuXHRyZXR1cm4gbmV3IFFFbGVtZW50KG5vZGVzWzBdKTtcbn07XG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBhZGRFdmVudExpc3RlbmVyKClcbmZ1bmN0aW9uIGFkZExvYWRMaXN0ZW5lcihpZnJhbWVEb20sIGNhbGxiYWNrKSB7XG5cdGlmIChpZnJhbWVEb20uYWRkRXZlbnRMaXN0ZW5lcikgaWZyYW1lRG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGNhbGxiYWNrKTtcblx0ZWxzZSBpZnJhbWVEb20uYXR0YWNoRXZlbnQoXCJvbmxvYWRcIiwgY2FsbGJhY2spO1xufVxuXG4vLyBXT1JLQVJPVU5EIElFODogbm8gZG9jdW1lbnQuaGVhZFxuZnVuY3Rpb24gZG9jdW1lbnRIZWFkKHNlbGYpIHtcblx0aWYgKHNlbGYuX2RvY3VtZW50LmhlYWQpIHJldHVybiBzZWxmLl9kb2N1bWVudC5oZWFkO1xuXHRlbHNlIHJldHVybiBzZWxmLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaGVhZFwiKTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKFwiLi4vdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qc1wiKTtcbnZhciBFbGVtZW50RWRnZSA9IHJlcXVpcmUoXCIuL2NvbnN0cmFpbnRzL2VsZW1lbnRfZWRnZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudChkb21FbGVtZW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCBdKTtcblxuXHR0aGlzLl9kb21FbGVtZW50ID0gZG9tRWxlbWVudDtcblxuLy9cdHRoaXMudG9wID0gRWxlbWVudEVkZ2UudG9wKHRoaXMpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1N0eWxlID0gZnVuY3Rpb24oc3R5bGVOYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblxuXHR2YXIgc3R5bGVzO1xuXHR2YXIgcmVzdWx0O1xuXG5cdC8vIFdPUktBUk9VTkQgSUU4OiBubyBnZXRDb21wdXRlZFN0eWxlKClcblx0aWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG5cdFx0c3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5fZG9tRWxlbWVudCk7XG5cdFx0cmVzdWx0ID0gc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoc3R5bGVOYW1lKTtcblx0fVxuXHRlbHNlIHtcblx0XHRzdHlsZXMgPSB0aGlzLl9kb21FbGVtZW50LmN1cnJlbnRTdHlsZTtcblx0XHRyZXN1bHQgPSBzdHlsZXNbY2FtZWxjYXNlKHN0eWxlTmFtZSldO1xuXHR9XG5cdGlmIChyZXN1bHQgPT09IG51bGwgfHwgcmVzdWx0ID09PSB1bmRlZmluZWQpIHJlc3VsdCA9IFwiXCI7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0UmF3UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHQvLyBXT1JLQVJPVU5EIElFODogTm8gVGV4dFJlY3RhbmdsZS5oZWlnaHQgb3IgLndpZHRoXG5cdHZhciByZWN0ID0gdGhpcy5fZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0cmV0dXJuIHtcblx0XHRsZWZ0OiByZWN0LmxlZnQsXG5cdFx0cmlnaHQ6IHJlY3QucmlnaHQsXG5cdFx0d2lkdGg6IHJlY3Qud2lkdGggIT09IHVuZGVmaW5lZCA/IHJlY3Qud2lkdGggOiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LFxuXG5cdFx0dG9wOiByZWN0LnRvcCxcblx0XHRib3R0b206IHJlY3QuYm90dG9tLFxuXHRcdGhlaWdodDogcmVjdC5oZWlnaHQgIT09IHVuZGVmaW5lZCA/IHJlY3QuaGVpZ2h0IDogcmVjdC5ib3R0b20gLSByZWN0LnRvcFxuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLnRvRG9tRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50O1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQub3V0ZXJIVE1MO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHRoYXQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQgPT09IHRoYXQuX2RvbUVsZW1lbnQ7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIEZyYW1lID0gcmVxdWlyZShcIi4vZnJhbWUuanNcIik7XG5cbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuXHRyZXR1cm4gRnJhbWUuY3JlYXRlKGRvY3VtZW50LmJvZHksIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBTZWUgTElDRU5TRS5UWFQgZm9yIGRldGFpbHMuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gKioqKlxuLy8gUnVudGltZSBhc3NlcnRpb25zIGZvciBwcm9kdWN0aW9uIGNvZGUuIChDb250cmFzdCB0byBhc3NlcnQuanMsIHdoaWNoIGlzIGZvciB0ZXN0IGNvZGUuKVxuLy8gKioqKlxuXG5leHBvcnRzLnRoYXQgPSBmdW5jdGlvbih2YXJpYWJsZSwgbWVzc2FnZSkge1xuXHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKSBtZXNzYWdlID0gXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZVwiO1xuXG5cdGlmICh2YXJpYWJsZSA9PT0gZmFsc2UpIHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy50aGF0LCBtZXNzYWdlKTtcblx0aWYgKHZhcmlhYmxlICE9PSB0cnVlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZSBvciBmYWxzZVwiKTtcbn07XG5cbmV4cG9ydHMudW5yZWFjaGFibGUgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdGlmICghbWVzc2FnZSkgbWVzc2FnZSA9IFwiVW5yZWFjaGFibGUgY29kZSBleGVjdXRlZFwiO1xuXG5cdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy51bnJlYWNoYWJsZSwgbWVzc2FnZSk7XG59O1xuXG5leHBvcnRzLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKGFyZ3MsIHNpZ25hdHVyZSkge1xuXHRzaWduYXR1cmUgPSBzaWduYXR1cmUgfHwgW107XG5cdHZhciBleHBlY3RlZEFyZ0NvdW50ID0gc2lnbmF0dXJlLmxlbmd0aDtcblx0dmFyIGFjdHVhbEFyZ0NvdW50ID0gYXJncy5sZW5ndGg7XG5cblx0aWYgKGFjdHVhbEFyZ0NvdW50ID4gZXhwZWN0ZWRBcmdDb3VudCkge1xuXHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oXG5cdFx0XHRleHBvcnRzLnNpZ25hdHVyZSxcblx0XHRcdFwiRnVuY3Rpb24gY2FsbGVkIHdpdGggdG9vIG1hbnkgYXJndW1lbnRzOiBleHBlY3RlZCBcIiArIGV4cGVjdGVkQXJnQ291bnQgKyBcIiBidXQgZ290IFwiICsgYWN0dWFsQXJnQ291bnRcblx0XHQpO1xuXHR9XG5cblx0dmFyIHR5cGUsIGFyZywgbmFtZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaWduYXR1cmUubGVuZ3RoOyBpKyspIHtcblx0XHR0eXBlID0gc2lnbmF0dXJlW2ldO1xuXHRcdGFyZyA9IGFyZ3NbaV07XG5cdFx0bmFtZSA9IFwiQXJndW1lbnQgXCIgKyBpO1xuXG5cdFx0aWYgKCFpc0FycmF5KHR5cGUpKSB0eXBlID0gWyB0eXBlIF07XG5cblx0XHRpZiAoIXR5cGVNYXRjaGVzKHR5cGUsIGFyZywgbmFtZSkpIHtcblx0XHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oXG5cdFx0XHRcdGV4cG9ydHMuc2lnbmF0dXJlLFxuXHRcdFx0XHRuYW1lICsgXCIgZXhwZWN0ZWQgXCIgKyBleHBsYWluVHlwZSh0eXBlKSArIFwiLCBidXQgd2FzIFwiICsgZXhwbGFpbkFyZyhhcmcpXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufTtcblxuZnVuY3Rpb24gdHlwZU1hdGNoZXModHlwZSwgYXJnKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChvbmVUeXBlTWF0Y2hlcyh0eXBlW2ldLCBhcmcpKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG5cblx0ZnVuY3Rpb24gb25lVHlwZU1hdGNoZXModHlwZSwgYXJnKSB7XG5cdFx0c3dpdGNoIChnZXRUeXBlKGFyZykpIHtcblx0XHRcdGNhc2UgXCJib29sZWFuXCI6IHJldHVybiB0eXBlID09PSBCb29sZWFuO1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiByZXR1cm4gdHlwZSA9PT0gU3RyaW5nO1xuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiByZXR1cm4gdHlwZSA9PT0gTnVtYmVyO1xuXHRcdFx0Y2FzZSBcImFycmF5XCI6IHJldHVybiB0eXBlID09PSBBcnJheTtcblx0XHRcdGNhc2UgXCJmdW5jdGlvblwiOiByZXR1cm4gdHlwZSA9PT0gRnVuY3Rpb247XG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHJldHVybiB0eXBlID09PSBPYmplY3QgfHwgYXJnIGluc3RhbmNlb2YgdHlwZTtcblx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjogcmV0dXJuIHR5cGUgPT09IHVuZGVmaW5lZDtcblx0XHRcdGNhc2UgXCJudWxsXCI6IHJldHVybiB0eXBlID09PSBudWxsO1xuXHRcdFx0Y2FzZSBcIk5hTlwiOiByZXR1cm4gaXNOYU4odHlwZSk7XG5cblx0XHRcdGRlZmF1bHQ6IGV4cG9ydHMudW5yZWFjaGFibGUoKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhwbGFpblR5cGUodHlwZSkge1xuXHR2YXIgam9pbmVyID0gXCJcIjtcblx0dmFyIHJlc3VsdCA9IFwiXCI7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdHJlc3VsdCArPSBqb2luZXIgKyBleHBsYWluT25lVHlwZSh0eXBlW2ldKTtcblx0XHRqb2luZXIgPSAoaSA9PT0gdHlwZS5sZW5ndGggLSAyKSA/IFwiLCBvciBcIiA6IFwiLCBcIjtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xuXG5cdGZ1bmN0aW9uIGV4cGxhaW5PbmVUeXBlKHR5cGUpIHtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgQm9vbGVhbjogcmV0dXJuIFwiYm9vbGVhblwiO1xuXHRcdFx0Y2FzZSBTdHJpbmc6IHJldHVybiBcInN0cmluZ1wiO1xuXHRcdFx0Y2FzZSBOdW1iZXI6IHJldHVybiBcIm51bWJlclwiO1xuXHRcdFx0Y2FzZSBBcnJheTogcmV0dXJuIFwiYXJyYXlcIjtcblx0XHRcdGNhc2UgRnVuY3Rpb246IHJldHVybiBcImZ1bmN0aW9uXCI7XG5cdFx0XHRjYXNlIG51bGw6IHJldHVybiBcIm51bGxcIjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih0eXBlKSkgcmV0dXJuIFwiTmFOXCI7XG5cdFx0XHRcdGVsc2UgcmV0dXJuIGZ1bmN0aW9uTmFtZSh0eXBlKSArIFwiIGluc3RhbmNlXCI7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5BcmcoYXJnKSB7XG5cdHZhciB0eXBlID0gZ2V0VHlwZShhcmcpO1xuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHR5cGU7XG5cblx0dmFyIHByb3RvdHlwZSA9IGdldFByb3RvdHlwZShhcmcpO1xuXHRpZiAocHJvdG90eXBlID09PSBudWxsKSByZXR1cm4gXCJhbiBvYmplY3Qgd2l0aG91dCBhIHByb3RvdHlwZVwiO1xuXHRlbHNlIHJldHVybiBmdW5jdGlvbk5hbWUocHJvdG90eXBlLmNvbnN0cnVjdG9yKSArIFwiIGluc3RhbmNlXCI7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUodmFyaWFibGUpIHtcblx0dmFyIHR5cGUgPSB0eXBlb2YgdmFyaWFibGU7XG5cdGlmICh2YXJpYWJsZSA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRpZiAoaXNBcnJheSh2YXJpYWJsZSkpIHR5cGUgPSBcImFycmF5XCI7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHZhcmlhYmxlKSkgdHlwZSA9IFwiTmFOXCI7XG5cdHJldHVybiB0eXBlO1xufVxuXG5cbi8qKioqKi9cblxudmFyIEVuc3VyZUV4Y2VwdGlvbiA9IGV4cG9ydHMuRW5zdXJlRXhjZXB0aW9uID0gZnVuY3Rpb24oZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlLCBtZXNzYWdlKSB7XG5cdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlKTtcblx0ZWxzZSB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjaztcblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn07XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KEVycm9yLnByb3RvdHlwZSk7XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5zdXJlRXhjZXB0aW9uO1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZS5uYW1lID0gXCJFbnN1cmVFeGNlcHRpb25cIjtcblxuXG4vKioqKiovXG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBPYmplY3QuY3JlYXRlKClcbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdChwcm90b3R5cGUpIHtcblx0aWYgKE9iamVjdC5jcmVhdGUpIHJldHVybiBPYmplY3QuY3JlYXRlKHByb3RvdHlwZSk7XG5cblx0dmFyIFRlbXAgPSBmdW5jdGlvbiBUZW1wKCkge307XG5cdFRlbXAucHJvdG90eXBlID0gcHJvdG90eXBlO1xuXHRyZXR1cm4gbmV3IFRlbXAoKTtcbn1cblxuLy8gV09SS0FST1VORCBJRTggSUU5IElFMTAgSUUxMTogbm8gZnVuY3Rpb24ubmFtZVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG5cdGlmIChmbi5uYW1lKSByZXR1cm4gZm4ubmFtZTtcblxuXHQvLyBUaGlzIHdvcmthcm91bmQgaXMgYmFzZWQgb24gY29kZSBieSBKYXNvbiBCdW50aW5nIGV0IGFsLCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMzI0Mjlcblx0dmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMrKC57MSx9KVxccypcXCgvO1xuXHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG5cdHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXSA6IFwiPGFub24+XCI7XG59XG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBBcnJheS5pc0FycmF5XG5mdW5jdGlvbiBpc0FycmF5KHRoaW5nKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KSByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGluZyk7XG5cblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBPYmplY3QuZ2V0UHJvdG90eXBlT2ZcbmZ1bmN0aW9uIGdldFByb3RvdHlwZShvYmopIHtcblx0aWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZikgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuXG5cdHZhciByZXN1bHQgPSBvYmouY29uc3RydWN0b3IgPyBvYmouY29uc3RydWN0b3IucHJvdG90eXBlIDogbnVsbDtcblx0cmV0dXJuIHJlc3VsdCB8fCBudWxsO1xufSIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAoc3RyLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRyZXR1cm4gc3RyXG5cdC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpXG5cdC50b0xvd2VyQ2FzZSgpXG5cdC5yZXBsYWNlKC9bXy5cXC0gXSsoXFx3fCQpL2csIGZ1bmN0aW9uIChtLCBwMSkge1xuXHRcdHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuXHR9KTtcbn07XG4iXX0=
