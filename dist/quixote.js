!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.quixote=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var QElement = require("../q_element.js");

var Me = module.exports = function ElementEdge(element, position) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	this._element = element;
	this._position = position;
};

Me.top = factoryFn("top");
Me.right = factoryFn("right");
Me.bottom = factoryFn("bottom");
Me.left = factoryFn("left");

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ [Number, Me] ]);

	var direction;

	var actualValue = value(this);
	if (typeof expected === "number") {
		if (expected === actualValue) return "";
		else return "Element '" + this._element.description() + "' " + this._position + " edge expected " +
			expected + ", but was " + actualValue;
	}

	else {
		var expectedValue = value(expected);

		if (expected._position === "top" || expected._position === "bottom") {
			ensure.that(
				this._position === "top" || this._position === "bottom",
				"Can't compare " + this._position + " edge to " + expected._position + " edge"
			);

			if (actualValue < expectedValue) direction = "higher";
			else direction = "lower";
		}
		else {
			ensure.that(
				this._position === "left" || this._position === "right",
				"Can't compare " + this._position + " edge to " + expected._position + " edge"
			);

			if (actualValue < expectedValue) direction = "to the left";
			else direction = "to the right";
		}

		if (expectedValue === actualValue) return "";
		else return "Expected " + this._position + " edge of element '" + this._element.description() +
			"' (" + actualValue + "px) to match " + expected._position + " edge of element '" +
			expected._element.description() + "' (" + expectedValue + "px), but was " +
			Math.abs(expectedValue - actualValue) + "px " + direction;
	}

};

function value(self) {
	return self._element.getRawPosition()[self._position];
}

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
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
	this._loaded = false;
	this._removed = false;
};

function loaded(self) {
	self._loaded = true;
	self._document = self._domElement.contentDocument;
	self._originalBody = self._document.body.innerHTML;
}

Me.create = function create(parentElement, width, height, options, callback) {
	ensure.signature(arguments, [ Object, Number, Number, [ Object, Function ], [ undefined, Function ] ]);

	if (callback === undefined) {
		callback = options;
		options = {};
	}

	// WORKAROUND Mobile Safari 7.0.0: weird style results occur when both src and stylesheet are loaded (see test)
	ensure.that(
		!(options.src && options.stylesheet),
		"Cannot specify HTML URL and stylesheet URL simultaneously due to Mobile Safari issue"
	);

	if (options.src){
		ensure.that(urlExists(options.src), "The HTML document does not exist at the specified URL");
	}

	if (options.stylesheet){
		ensure.that(urlExists(options.stylesheet), "The stylesheet does not exist at the specified URL");
	}

	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	iframe.setAttribute("frameborder", "0");    // WORKAROUND IE 8: don't include frame border in position calcs
	if (options.src) iframe.setAttribute("src", options.src);

	var frame = new Me(iframe);
	addLoadListener(iframe, onFrameLoad);
	parentElement.appendChild(iframe);
	return frame;

	function onFrameLoad() {
		// WORKAROUND Mobile Safari 7.0.0, Safari 6.2.0, Chrome 38.0.2125: frame is loaded synchronously
		// We force it to be asynchronous here
		setTimeout(function() {
			loaded(frame);
			loadStylesheet(frame, options.stylesheet, function() {
				callback(null, frame);
			});
		}, 0);
	}
};

function urlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!==404;
}

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
	ensureUsable(this);

	this._document.body.innerHTML = this._originalBody;
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	ensureNotRemoved(this);

	return this._domElement;
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	ensureLoaded(this);
	if (this._removed) return;

	this._removed = true;
	this._domElement.parentNode.removeChild(this._domElement);
};

Me.prototype.addElement = function(html) {
	ensure.signature(arguments, [ String ]);
	ensureUsable(this);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._document.body.appendChild(insertedElement);
	return new QElement(insertedElement, html);
};

Me.prototype.getElement = function(selector) {
	ensure.signature(arguments, [ String ]);
	ensureUsable(this);

	var nodes = this._document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0], selector);
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

function ensureUsable(self) {
	ensureLoaded(self);
	ensureNotRemoved(self);
}

function ensureLoaded(self) {
	ensure.that(self._loaded, "Frame not loaded: Wait for frame creation callback to execute before using frame");
}

function ensureNotRemoved(self) {
	ensure.that(!self._removed, "Attempted to use frame after it was removed");
}

},{"./q_element.js":3,"./util/ensure.js":5}],3:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementEdge = require("./constraints/element_edge.js");

var Me = module.exports = function QElement(domElement, description) {
	ensure.signature(arguments, [ Object, [ String ] ]);

	this._domElement = domElement;
	this._description = description;

	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);
};

Me.prototype.diff = function(expected) {
	ensure.signature(arguments, [ Object ]);

	var result = [];
	var keys = objectKeys(expected);
	var key, diff, constraint;
	for (var i = 0; i < keys.length; i++) {
		key = keys[i];
		constraint = this[key];
		ensure.that(constraint !== undefined, "'" + key + "' is unknown and can't be used with diff()");
		diff = constraint.diff(expected[key]);
		if (diff !== "") result.push(diff);
	}

	return result.join("\n");
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

Me.prototype.description = function() {
	return this._description;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._domElement.outerHTML;
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);

	return this._domElement === that._domElement;
};

// WORKAROUND IE8: No Object.keys
function objectKeys(obj) {
	if (Object.keys) return Object.keys(obj);

	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

  if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
    throw new TypeError('Object.keys called on non-object');
  }

  var result = [], prop, i;

  for (prop in obj) {
    if (hasOwnProperty.call(obj, prop)) {
      result.push(prop);
    }
  }

  if (hasDontEnumBug) {
    for (i = 0; i < dontEnumsLength; i++) {
      if (hasOwnProperty.call(obj, dontEnums[i])) {
        result.push(dontEnums[i]);
      }
    }
  }
  return result;
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvYmpvcm5oL0RvY3VtZW50cy9HaXRIdWIvcXVpeG90ZS9zcmMvY29uc3RyYWludHMvZWxlbWVudF9lZGdlLmpzIiwiQzovVXNlcnMvYmpvcm5oL0RvY3VtZW50cy9HaXRIdWIvcXVpeG90ZS9zcmMvZnJhbWUuanMiLCJDOi9Vc2Vycy9iam9ybmgvRG9jdW1lbnRzL0dpdEh1Yi9xdWl4b3RlL3NyYy9xX2VsZW1lbnQuanMiLCJDOi9Vc2Vycy9iam9ybmgvRG9jdW1lbnRzL0dpdEh1Yi9xdWl4b3RlL3NyYy9xdWl4b3RlLmpzIiwiQzovVXNlcnMvYmpvcm5oL0RvY3VtZW50cy9HaXRIdWIvcXVpeG90ZS9zcmMvdXRpbC9lbnN1cmUuanMiLCJDOi9Vc2Vycy9iam9ybmgvRG9jdW1lbnRzL0dpdEh1Yi9xdWl4b3RlL3ZlbmRvci9jYW1lbGNhc2UtMS4wLjEtbW9kaWZpZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XHJcbnZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuLi9xX2VsZW1lbnQuanNcIik7XHJcblxyXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRFZGdlKGVsZW1lbnQsIHBvc2l0aW9uKSB7XHJcbi8vXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBRRWxlbWVudCBdKTsgICAgICAvLyBUT0RPOiBjcmVhdGVzIGNpcmN1bGFyIGRlcGVuZGVuY3lcclxuXHR0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcclxuXHR0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG59O1xyXG5cclxuTWUudG9wID0gZmFjdG9yeUZuKFwidG9wXCIpO1xyXG5NZS5yaWdodCA9IGZhY3RvcnlGbihcInJpZ2h0XCIpO1xyXG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oXCJib3R0b21cIik7XHJcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oXCJsZWZ0XCIpO1xyXG5cclxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XHJcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgTWVdIF0pO1xyXG5cclxuXHR2YXIgZGlyZWN0aW9uO1xyXG5cclxuXHR2YXIgYWN0dWFsVmFsdWUgPSB2YWx1ZSh0aGlzKTtcclxuXHRpZiAodHlwZW9mIGV4cGVjdGVkID09PSBcIm51bWJlclwiKSB7XHJcblx0XHRpZiAoZXhwZWN0ZWQgPT09IGFjdHVhbFZhbHVlKSByZXR1cm4gXCJcIjtcclxuXHRcdGVsc2UgcmV0dXJuIFwiRWxlbWVudCAnXCIgKyB0aGlzLl9lbGVtZW50LmRlc2NyaXB0aW9uKCkgKyBcIicgXCIgKyB0aGlzLl9wb3NpdGlvbiArIFwiIGVkZ2UgZXhwZWN0ZWQgXCIgK1xyXG5cdFx0XHRleHBlY3RlZCArIFwiLCBidXQgd2FzIFwiICsgYWN0dWFsVmFsdWU7XHJcblx0fVxyXG5cclxuXHRlbHNlIHtcclxuXHRcdHZhciBleHBlY3RlZFZhbHVlID0gdmFsdWUoZXhwZWN0ZWQpO1xyXG5cclxuXHRcdGlmIChleHBlY3RlZC5fcG9zaXRpb24gPT09IFwidG9wXCIgfHwgZXhwZWN0ZWQuX3Bvc2l0aW9uID09PSBcImJvdHRvbVwiKSB7XHJcblx0XHRcdGVuc3VyZS50aGF0KFxyXG5cdFx0XHRcdHRoaXMuX3Bvc2l0aW9uID09PSBcInRvcFwiIHx8IHRoaXMuX3Bvc2l0aW9uID09PSBcImJvdHRvbVwiLFxyXG5cdFx0XHRcdFwiQ2FuJ3QgY29tcGFyZSBcIiArIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSB0byBcIiArIGV4cGVjdGVkLl9wb3NpdGlvbiArIFwiIGVkZ2VcIlxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0aWYgKGFjdHVhbFZhbHVlIDwgZXhwZWN0ZWRWYWx1ZSkgZGlyZWN0aW9uID0gXCJoaWdoZXJcIjtcclxuXHRcdFx0ZWxzZSBkaXJlY3Rpb24gPSBcImxvd2VyXCI7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZW5zdXJlLnRoYXQoXHJcblx0XHRcdFx0dGhpcy5fcG9zaXRpb24gPT09IFwibGVmdFwiIHx8IHRoaXMuX3Bvc2l0aW9uID09PSBcInJpZ2h0XCIsXHJcblx0XHRcdFx0XCJDYW4ndCBjb21wYXJlIFwiICsgdGhpcy5fcG9zaXRpb24gKyBcIiBlZGdlIHRvIFwiICsgZXhwZWN0ZWQuX3Bvc2l0aW9uICsgXCIgZWRnZVwiXHJcblx0XHRcdCk7XHJcblxyXG5cdFx0XHRpZiAoYWN0dWFsVmFsdWUgPCBleHBlY3RlZFZhbHVlKSBkaXJlY3Rpb24gPSBcInRvIHRoZSBsZWZ0XCI7XHJcblx0XHRcdGVsc2UgZGlyZWN0aW9uID0gXCJ0byB0aGUgcmlnaHRcIjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZXhwZWN0ZWRWYWx1ZSA9PT0gYWN0dWFsVmFsdWUpIHJldHVybiBcIlwiO1xyXG5cdFx0ZWxzZSByZXR1cm4gXCJFeHBlY3RlZCBcIiArIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiBlbGVtZW50ICdcIiArIHRoaXMuX2VsZW1lbnQuZGVzY3JpcHRpb24oKSArXHJcblx0XHRcdFwiJyAoXCIgKyBhY3R1YWxWYWx1ZSArIFwicHgpIHRvIG1hdGNoIFwiICsgZXhwZWN0ZWQuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiBlbGVtZW50ICdcIiArXHJcblx0XHRcdGV4cGVjdGVkLl9lbGVtZW50LmRlc2NyaXB0aW9uKCkgKyBcIicgKFwiICsgZXhwZWN0ZWRWYWx1ZSArIFwicHgpLCBidXQgd2FzIFwiICtcclxuXHRcdFx0TWF0aC5hYnMoZXhwZWN0ZWRWYWx1ZSAtIGFjdHVhbFZhbHVlKSArIFwicHggXCIgKyBkaXJlY3Rpb247XHJcblx0fVxyXG5cclxufTtcclxuXHJcbmZ1bmN0aW9uIHZhbHVlKHNlbGYpIHtcclxuXHRyZXR1cm4gc2VsZi5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpW3NlbGYuX3Bvc2l0aW9uXTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmFjdG9yeUZuKHBvc2l0aW9uKSB7XHJcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZWxlbWVudCkge1xyXG5cdFx0cmV0dXJuIG5ldyBNZShlbGVtZW50LCBwb3NpdGlvbik7XHJcblx0fTtcclxufVxyXG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcclxudmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50LmpzXCIpO1xyXG5cclxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBGcmFtZShkb21FbGVtZW50KSB7XHJcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0IF0pO1xyXG5cdGVuc3VyZS50aGF0KGRvbUVsZW1lbnQudGFnTmFtZSA9PT0gXCJJRlJBTUVcIiwgXCJET00gZWxlbWVudCBtdXN0IGJlIGFuIGlmcmFtZVwiKTtcclxuXHJcblx0dGhpcy5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XHJcblx0dGhpcy5fbG9hZGVkID0gZmFsc2U7XHJcblx0dGhpcy5fcmVtb3ZlZCA9IGZhbHNlO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbG9hZGVkKHNlbGYpIHtcclxuXHRzZWxmLl9sb2FkZWQgPSB0cnVlO1xyXG5cdHNlbGYuX2RvY3VtZW50ID0gc2VsZi5fZG9tRWxlbWVudC5jb250ZW50RG9jdW1lbnQ7XHJcblx0c2VsZi5fb3JpZ2luYWxCb2R5ID0gc2VsZi5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUw7XHJcbn1cclxuXHJcbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xyXG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgTnVtYmVyLCBOdW1iZXIsIFsgT2JqZWN0LCBGdW5jdGlvbiBdLCBbIHVuZGVmaW5lZCwgRnVuY3Rpb24gXSBdKTtcclxuXHJcblx0aWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpIHtcclxuXHRcdGNhbGxiYWNrID0gb3B0aW9ucztcclxuXHRcdG9wdGlvbnMgPSB7fTtcclxuXHR9XHJcblxyXG5cdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMDogd2VpcmQgc3R5bGUgcmVzdWx0cyBvY2N1ciB3aGVuIGJvdGggc3JjIGFuZCBzdHlsZXNoZWV0IGFyZSBsb2FkZWQgKHNlZSB0ZXN0KVxyXG5cdGVuc3VyZS50aGF0KFxyXG5cdFx0IShvcHRpb25zLnNyYyAmJiBvcHRpb25zLnN0eWxlc2hlZXQpLFxyXG5cdFx0XCJDYW5ub3Qgc3BlY2lmeSBIVE1MIFVSTCBhbmQgc3R5bGVzaGVldCBVUkwgc2ltdWx0YW5lb3VzbHkgZHVlIHRvIE1vYmlsZSBTYWZhcmkgaXNzdWVcIlxyXG5cdCk7XHJcblxyXG5cdGlmIChvcHRpb25zLnNyYyl7XHJcblx0XHRlbnN1cmUudGhhdCh1cmxFeGlzdHMob3B0aW9ucy5zcmMpLCBcIlRoZSBIVE1MIGRvY3VtZW50IGRvZXMgbm90IGV4aXN0IGF0IHRoZSBzcGVjaWZpZWQgVVJMXCIpO1xyXG5cdH1cclxuXHJcblx0aWYgKG9wdGlvbnMuc3R5bGVzaGVldCl7XHJcblx0XHRlbnN1cmUudGhhdCh1cmxFeGlzdHMob3B0aW9ucy5zdHlsZXNoZWV0KSwgXCJUaGUgc3R5bGVzaGVldCBkb2VzIG5vdCBleGlzdCBhdCB0aGUgc3BlY2lmaWVkIFVSTFwiKTtcclxuXHR9XHJcblxyXG5cdHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xyXG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB3aWR0aCk7XHJcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBoZWlnaHQpO1xyXG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJmcmFtZWJvcmRlclwiLCBcIjBcIik7ICAgIC8vIFdPUktBUk9VTkQgSUUgODogZG9uJ3QgaW5jbHVkZSBmcmFtZSBib3JkZXIgaW4gcG9zaXRpb24gY2FsY3NcclxuXHRpZiAob3B0aW9ucy5zcmMpIGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgb3B0aW9ucy5zcmMpO1xyXG5cclxuXHR2YXIgZnJhbWUgPSBuZXcgTWUoaWZyYW1lKTtcclxuXHRhZGRMb2FkTGlzdGVuZXIoaWZyYW1lLCBvbkZyYW1lTG9hZCk7XHJcblx0cGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG5cdHJldHVybiBmcmFtZTtcclxuXHJcblx0ZnVuY3Rpb24gb25GcmFtZUxvYWQoKSB7XHJcblx0XHQvLyBXT1JLQVJPVU5EIE1vYmlsZSBTYWZhcmkgNy4wLjAsIFNhZmFyaSA2LjIuMCwgQ2hyb21lIDM4LjAuMjEyNTogZnJhbWUgaXMgbG9hZGVkIHN5bmNocm9ub3VzbHlcclxuXHRcdC8vIFdlIGZvcmNlIGl0IHRvIGJlIGFzeW5jaHJvbm91cyBoZXJlXHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRsb2FkZWQoZnJhbWUpO1xyXG5cdFx0XHRsb2FkU3R5bGVzaGVldChmcmFtZSwgb3B0aW9ucy5zdHlsZXNoZWV0LCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBmcmFtZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSwgMCk7XHJcblx0fVxyXG59O1xyXG5cclxuZnVuY3Rpb24gdXJsRXhpc3RzKHVybClcclxue1xyXG4gICAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIGh0dHAub3BlbignSEVBRCcsIHVybCwgZmFsc2UpO1xyXG4gICAgaHR0cC5zZW5kKCk7XHJcbiAgICByZXR1cm4gaHR0cC5zdGF0dXMhPT00MDQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRTdHlsZXNoZWV0KHNlbGYsIHVybCwgY2FsbGJhY2spIHtcclxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgWyB1bmRlZmluZWQsIFN0cmluZyBdLCBGdW5jdGlvbiBdKTtcclxuXHRpZiAodXJsID09PSB1bmRlZmluZWQpIHJldHVybiBjYWxsYmFjaygpO1xyXG5cclxuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xyXG5cdGFkZExvYWRMaXN0ZW5lcihsaW5rLCBvbkxpbmtMb2FkKTtcclxuXHRsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XHJcblx0bGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XHJcblx0bGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHVybCk7XHJcblxyXG5cdGRvY3VtZW50SGVhZChzZWxmKS5hcHBlbmRDaGlsZChsaW5rKTtcclxuXHJcblx0ZnVuY3Rpb24gb25MaW5rTG9hZCgpIHtcclxuXHRcdGNhbGxiYWNrKCk7XHJcblx0fVxyXG59XHJcblxyXG5NZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xyXG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcclxuXHJcblx0dGhpcy5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB0aGlzLl9vcmlnaW5hbEJvZHk7XHJcbn07XHJcblxyXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcclxuXHRlbnN1cmVOb3RSZW1vdmVkKHRoaXMpO1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcclxufTtcclxuXHJcbk1lLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcclxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xyXG5cdGVuc3VyZUxvYWRlZCh0aGlzKTtcclxuXHRpZiAodGhpcy5fcmVtb3ZlZCkgcmV0dXJuO1xyXG5cclxuXHR0aGlzLl9yZW1vdmVkID0gdHJ1ZTtcclxuXHR0aGlzLl9kb21FbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fZG9tRWxlbWVudCk7XHJcbn07XHJcblxyXG5NZS5wcm90b3R5cGUuYWRkRWxlbWVudCA9IGZ1bmN0aW9uKGh0bWwpIHtcclxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcgXSk7XHJcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xyXG5cclxuXHR2YXIgdGVtcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdHRlbXBFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XHJcblx0ZW5zdXJlLnRoYXQoXHJcblx0XHR0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSxcclxuXHRcdFwiRXhwZWN0ZWQgb25lIGVsZW1lbnQsIGJ1dCBnb3QgXCIgKyB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCArIFwiIChcIiArIGh0bWwgKyBcIilcIlxyXG5cdCk7XHJcblxyXG5cdHZhciBpbnNlcnRlZEVsZW1lbnQgPSB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzWzBdO1xyXG5cdHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5zZXJ0ZWRFbGVtZW50KTtcclxuXHRyZXR1cm4gbmV3IFFFbGVtZW50KGluc2VydGVkRWxlbWVudCwgaHRtbCk7XHJcbn07XHJcblxyXG5NZS5wcm90b3R5cGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xyXG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcclxuXHJcblx0dmFyIG5vZGVzID0gdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XHJcblx0ZW5zdXJlLnRoYXQobm9kZXMubGVuZ3RoID09PSAxLCBcIkV4cGVjdGVkIG9uZSBlbGVtZW50IHRvIG1hdGNoICdcIiArIHNlbGVjdG9yICsgXCInLCBidXQgZm91bmQgXCIgKyBub2Rlcy5sZW5ndGgpO1xyXG5cdHJldHVybiBuZXcgUUVsZW1lbnQobm9kZXNbMF0sIHNlbGVjdG9yKTtcclxufTtcclxuXHJcbi8vIFdPUktBUk9VTkQgSUU4OiBubyBhZGRFdmVudExpc3RlbmVyKClcclxuZnVuY3Rpb24gYWRkTG9hZExpc3RlbmVyKGlmcmFtZURvbSwgY2FsbGJhY2spIHtcclxuXHRpZiAoaWZyYW1lRG9tLmFkZEV2ZW50TGlzdGVuZXIpIGlmcmFtZURvbS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBjYWxsYmFjayk7XHJcblx0ZWxzZSBpZnJhbWVEb20uYXR0YWNoRXZlbnQoXCJvbmxvYWRcIiwgY2FsbGJhY2spO1xyXG59XHJcblxyXG4vLyBXT1JLQVJPVU5EIElFODogbm8gZG9jdW1lbnQuaGVhZFxyXG5mdW5jdGlvbiBkb2N1bWVudEhlYWQoc2VsZikge1xyXG5cdGlmIChzZWxmLl9kb2N1bWVudC5oZWFkKSByZXR1cm4gc2VsZi5fZG9jdW1lbnQuaGVhZDtcclxuXHRlbHNlIHJldHVybiBzZWxmLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaGVhZFwiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZW5zdXJlVXNhYmxlKHNlbGYpIHtcclxuXHRlbnN1cmVMb2FkZWQoc2VsZik7XHJcblx0ZW5zdXJlTm90UmVtb3ZlZChzZWxmKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZW5zdXJlTG9hZGVkKHNlbGYpIHtcclxuXHRlbnN1cmUudGhhdChzZWxmLl9sb2FkZWQsIFwiRnJhbWUgbm90IGxvYWRlZDogV2FpdCBmb3IgZnJhbWUgY3JlYXRpb24gY2FsbGJhY2sgdG8gZXhlY3V0ZSBiZWZvcmUgdXNpbmcgZnJhbWVcIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVuc3VyZU5vdFJlbW92ZWQoc2VsZikge1xyXG5cdGVuc3VyZS50aGF0KCFzZWxmLl9yZW1vdmVkLCBcIkF0dGVtcHRlZCB0byB1c2UgZnJhbWUgYWZ0ZXIgaXQgd2FzIHJlbW92ZWRcIik7XHJcbn1cclxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XHJcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKFwiLi4vdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qc1wiKTtcclxudmFyIEVsZW1lbnRFZGdlID0gcmVxdWlyZShcIi4vY29uc3RyYWludHMvZWxlbWVudF9lZGdlLmpzXCIpO1xyXG5cclxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudChkb21FbGVtZW50LCBkZXNjcmlwdGlvbikge1xyXG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgWyBTdHJpbmcgXSBdKTtcclxuXHJcblx0dGhpcy5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XHJcblx0dGhpcy5fZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuXHJcblx0dGhpcy50b3AgPSBFbGVtZW50RWRnZS50b3AodGhpcyk7XHJcblx0dGhpcy5yaWdodCA9IEVsZW1lbnRFZGdlLnJpZ2h0KHRoaXMpO1xyXG5cdHRoaXMuYm90dG9tID0gRWxlbWVudEVkZ2UuYm90dG9tKHRoaXMpO1xyXG5cdHRoaXMubGVmdCA9IEVsZW1lbnRFZGdlLmxlZnQodGhpcyk7XHJcbn07XHJcblxyXG5NZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uKGV4cGVjdGVkKSB7XHJcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0IF0pO1xyXG5cclxuXHR2YXIgcmVzdWx0ID0gW107XHJcblx0dmFyIGtleXMgPSBvYmplY3RLZXlzKGV4cGVjdGVkKTtcclxuXHR2YXIga2V5LCBkaWZmLCBjb25zdHJhaW50O1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0a2V5ID0ga2V5c1tpXTtcclxuXHRcdGNvbnN0cmFpbnQgPSB0aGlzW2tleV07XHJcblx0XHRlbnN1cmUudGhhdChjb25zdHJhaW50ICE9PSB1bmRlZmluZWQsIFwiJ1wiICsga2V5ICsgXCInIGlzIHVua25vd24gYW5kIGNhbid0IGJlIHVzZWQgd2l0aCBkaWZmKClcIik7XHJcblx0XHRkaWZmID0gY29uc3RyYWludC5kaWZmKGV4cGVjdGVkW2tleV0pO1xyXG5cdFx0aWYgKGRpZmYgIT09IFwiXCIpIHJlc3VsdC5wdXNoKGRpZmYpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdC5qb2luKFwiXFxuXCIpO1xyXG59O1xyXG5cclxuTWUucHJvdG90eXBlLmdldFJhd1N0eWxlID0gZnVuY3Rpb24oc3R5bGVOYW1lKSB7XHJcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xyXG5cclxuXHR2YXIgc3R5bGVzO1xyXG5cdHZhciByZXN1bHQ7XHJcblxyXG5cdC8vIFdPUktBUk9VTkQgSUU4OiBubyBnZXRDb21wdXRlZFN0eWxlKClcclxuXHRpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcclxuXHRcdHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuX2RvbUVsZW1lbnQpO1xyXG5cdFx0cmVzdWx0ID0gc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoc3R5bGVOYW1lKTtcclxuXHR9XHJcblx0ZWxzZSB7XHJcblx0XHRzdHlsZXMgPSB0aGlzLl9kb21FbGVtZW50LmN1cnJlbnRTdHlsZTtcclxuXHRcdHJlc3VsdCA9IHN0eWxlc1tjYW1lbGNhc2Uoc3R5bGVOYW1lKV07XHJcblx0fVxyXG5cdGlmIChyZXN1bHQgPT09IG51bGwgfHwgcmVzdWx0ID09PSB1bmRlZmluZWQpIHJlc3VsdCA9IFwiXCI7XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbk1lLnByb3RvdHlwZS5nZXRSYXdQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XHJcblxyXG5cdC8vIFdPUktBUk9VTkQgSUU4OiBObyBUZXh0UmVjdGFuZ2xlLmhlaWdodCBvciAud2lkdGhcclxuXHR2YXIgcmVjdCA9IHRoaXMuX2RvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0cmV0dXJuIHtcclxuXHRcdGxlZnQ6IHJlY3QubGVmdCxcclxuXHRcdHJpZ2h0OiByZWN0LnJpZ2h0LFxyXG5cdFx0d2lkdGg6IHJlY3Qud2lkdGggIT09IHVuZGVmaW5lZCA/IHJlY3Qud2lkdGggOiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LFxyXG5cclxuXHRcdHRvcDogcmVjdC50b3AsXHJcblx0XHRib3R0b206IHJlY3QuYm90dG9tLFxyXG5cdFx0aGVpZ2h0OiByZWN0LmhlaWdodCAhPT0gdW5kZWZpbmVkID8gcmVjdC5oZWlnaHQgOiByZWN0LmJvdHRvbSAtIHJlY3QudG9wXHJcblx0fTtcclxufTtcclxuXHJcbk1lLnByb3RvdHlwZS50b0RvbUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xyXG5cclxuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcclxufTtcclxuXHJcbk1lLnByb3RvdHlwZS5kZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjtcclxufTtcclxuXHJcbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xyXG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XHJcblxyXG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50Lm91dGVySFRNTDtcclxufTtcclxuXHJcbk1lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbih0aGF0KSB7XHJcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XHJcblxyXG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50ID09PSB0aGF0Ll9kb21FbGVtZW50O1xyXG59O1xyXG5cclxuLy8gV09SS0FST1VORCBJRTg6IE5vIE9iamVjdC5rZXlzXHJcbmZ1bmN0aW9uIG9iamVjdEtleXMob2JqKSB7XHJcblx0aWYgKE9iamVjdC5rZXlzKSByZXR1cm4gT2JqZWN0LmtleXMob2JqKTtcclxuXHJcblx0Ly8gRnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qva2V5c1xyXG4gIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXHJcbiAgICAgIGhhc0RvbnRFbnVtQnVnID0gISh7IHRvU3RyaW5nOiBudWxsIH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxyXG4gICAgICBkb250RW51bXMgPSBbXHJcbiAgICAgICAgJ3RvU3RyaW5nJyxcclxuICAgICAgICAndG9Mb2NhbGVTdHJpbmcnLFxyXG4gICAgICAgICd2YWx1ZU9mJyxcclxuICAgICAgICAnaGFzT3duUHJvcGVydHknLFxyXG4gICAgICAgICdpc1Byb3RvdHlwZU9mJyxcclxuICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLFxyXG4gICAgICAgICdjb25zdHJ1Y3RvcidcclxuICAgICAgXSxcclxuICAgICAgZG9udEVudW1zTGVuZ3RoID0gZG9udEVudW1zLmxlbmd0aDtcclxuXHJcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICh0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkpIHtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5rZXlzIGNhbGxlZCBvbiBub24tb2JqZWN0Jyk7XHJcbiAgfVxyXG5cclxuICB2YXIgcmVzdWx0ID0gW10sIHByb3AsIGk7XHJcblxyXG4gIGZvciAocHJvcCBpbiBvYmopIHtcclxuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcclxuICAgICAgcmVzdWx0LnB1c2gocHJvcCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoaGFzRG9udEVudW1CdWcpIHtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBkb250RW51bXNMZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcclxuICAgICAgICByZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcclxudmFyIEZyYW1lID0gcmVxdWlyZShcIi4vZnJhbWUuanNcIik7XHJcblxyXG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucywgY2FsbGJhY2spIHtcclxuXHRyZXR1cm4gRnJhbWUuY3JlYXRlKGRvY3VtZW50LmJvZHksIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMsIGNhbGxiYWNrKTtcclxufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIFNlZSBMSUNFTlNFLlRYVCBmb3IgZGV0YWlscy5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vLyAqKioqXHJcbi8vIFJ1bnRpbWUgYXNzZXJ0aW9ucyBmb3IgcHJvZHVjdGlvbiBjb2RlLiAoQ29udHJhc3QgdG8gYXNzZXJ0LmpzLCB3aGljaCBpcyBmb3IgdGVzdCBjb2RlLilcclxuLy8gKioqKlxyXG5cclxuZXhwb3J0cy50aGF0ID0gZnVuY3Rpb24odmFyaWFibGUsIG1lc3NhZ2UpIHtcclxuXHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKSBtZXNzYWdlID0gXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZVwiO1xyXG5cclxuXHRpZiAodmFyaWFibGUgPT09IGZhbHNlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgbWVzc2FnZSk7XHJcblx0aWYgKHZhcmlhYmxlICE9PSB0cnVlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZSBvciBmYWxzZVwiKTtcclxufTtcclxuXHJcbmV4cG9ydHMudW5yZWFjaGFibGUgPSBmdW5jdGlvbihtZXNzYWdlKSB7XHJcblx0aWYgKCFtZXNzYWdlKSBtZXNzYWdlID0gXCJVbnJlYWNoYWJsZSBjb2RlIGV4ZWN1dGVkXCI7XHJcblxyXG5cdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy51bnJlYWNoYWJsZSwgbWVzc2FnZSk7XHJcbn07XHJcblxyXG5leHBvcnRzLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKGFyZ3MsIHNpZ25hdHVyZSkge1xyXG5cdHNpZ25hdHVyZSA9IHNpZ25hdHVyZSB8fCBbXTtcclxuXHR2YXIgZXhwZWN0ZWRBcmdDb3VudCA9IHNpZ25hdHVyZS5sZW5ndGg7XHJcblx0dmFyIGFjdHVhbEFyZ0NvdW50ID0gYXJncy5sZW5ndGg7XHJcblxyXG5cdGlmIChhY3R1YWxBcmdDb3VudCA+IGV4cGVjdGVkQXJnQ291bnQpIHtcclxuXHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oXHJcblx0XHRcdGV4cG9ydHMuc2lnbmF0dXJlLFxyXG5cdFx0XHRcIkZ1bmN0aW9uIGNhbGxlZCB3aXRoIHRvbyBtYW55IGFyZ3VtZW50czogZXhwZWN0ZWQgXCIgKyBleHBlY3RlZEFyZ0NvdW50ICsgXCIgYnV0IGdvdCBcIiArIGFjdHVhbEFyZ0NvdW50XHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0dmFyIHR5cGUsIGFyZywgbmFtZTtcclxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0dHlwZSA9IHNpZ25hdHVyZVtpXTtcclxuXHRcdGFyZyA9IGFyZ3NbaV07XHJcblx0XHRuYW1lID0gXCJBcmd1bWVudCBcIiArIGk7XHJcblxyXG5cdFx0aWYgKCFpc0FycmF5KHR5cGUpKSB0eXBlID0gWyB0eXBlIF07XHJcblxyXG5cdFx0aWYgKCF0eXBlTWF0Y2hlcyh0eXBlLCBhcmcsIG5hbWUpKSB7XHJcblx0XHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oXHJcblx0XHRcdFx0ZXhwb3J0cy5zaWduYXR1cmUsXHJcblx0XHRcdFx0bmFtZSArIFwiIGV4cGVjdGVkIFwiICsgZXhwbGFpblR5cGUodHlwZSkgKyBcIiwgYnV0IHdhcyBcIiArIGV4cGxhaW5BcmcoYXJnKVxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIHR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xyXG5cdFx0aWYgKG9uZVR5cGVNYXRjaGVzKHR5cGVbaV0sIGFyZykpIHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdGZ1bmN0aW9uIG9uZVR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xyXG5cdFx0c3dpdGNoIChnZXRUeXBlKGFyZykpIHtcclxuXHRcdFx0Y2FzZSBcImJvb2xlYW5cIjogcmV0dXJuIHR5cGUgPT09IEJvb2xlYW47XHJcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIHR5cGUgPT09IFN0cmluZztcclxuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiByZXR1cm4gdHlwZSA9PT0gTnVtYmVyO1xyXG5cdFx0XHRjYXNlIFwiYXJyYXlcIjogcmV0dXJuIHR5cGUgPT09IEFycmF5O1xyXG5cdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjogcmV0dXJuIHR5cGUgPT09IEZ1bmN0aW9uO1xyXG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHJldHVybiB0eXBlID09PSBPYmplY3QgfHwgYXJnIGluc3RhbmNlb2YgdHlwZTtcclxuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiByZXR1cm4gdHlwZSA9PT0gdW5kZWZpbmVkO1xyXG5cdFx0XHRjYXNlIFwibnVsbFwiOiByZXR1cm4gdHlwZSA9PT0gbnVsbDtcclxuXHRcdFx0Y2FzZSBcIk5hTlwiOiByZXR1cm4gaXNOYU4odHlwZSk7XHJcblxyXG5cdFx0XHRkZWZhdWx0OiBleHBvcnRzLnVucmVhY2hhYmxlKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBleHBsYWluVHlwZSh0eXBlKSB7XHJcblx0dmFyIGpvaW5lciA9IFwiXCI7XHJcblx0dmFyIHJlc3VsdCA9IFwiXCI7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRyZXN1bHQgKz0gam9pbmVyICsgZXhwbGFpbk9uZVR5cGUodHlwZVtpXSk7XHJcblx0XHRqb2luZXIgPSAoaSA9PT0gdHlwZS5sZW5ndGggLSAyKSA/IFwiLCBvciBcIiA6IFwiLCBcIjtcclxuXHR9XHJcblx0cmV0dXJuIHJlc3VsdDtcclxuXHJcblx0ZnVuY3Rpb24gZXhwbGFpbk9uZVR5cGUodHlwZSkge1xyXG5cdFx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRcdGNhc2UgQm9vbGVhbjogcmV0dXJuIFwiYm9vbGVhblwiO1xyXG5cdFx0XHRjYXNlIFN0cmluZzogcmV0dXJuIFwic3RyaW5nXCI7XHJcblx0XHRcdGNhc2UgTnVtYmVyOiByZXR1cm4gXCJudW1iZXJcIjtcclxuXHRcdFx0Y2FzZSBBcnJheTogcmV0dXJuIFwiYXJyYXlcIjtcclxuXHRcdFx0Y2FzZSBGdW5jdGlvbjogcmV0dXJuIFwiZnVuY3Rpb25cIjtcclxuXHRcdFx0Y2FzZSBudWxsOiByZXR1cm4gXCJudWxsXCI7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHR5cGUpKSByZXR1cm4gXCJOYU5cIjtcclxuXHRcdFx0XHRlbHNlIHJldHVybiBmdW5jdGlvbk5hbWUodHlwZSkgKyBcIiBpbnN0YW5jZVwiO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gZXhwbGFpbkFyZyhhcmcpIHtcclxuXHR2YXIgdHlwZSA9IGdldFR5cGUoYXJnKTtcclxuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHR5cGU7XHJcblxyXG5cdHZhciBwcm90b3R5cGUgPSBnZXRQcm90b3R5cGUoYXJnKTtcclxuXHRpZiAocHJvdG90eXBlID09PSBudWxsKSByZXR1cm4gXCJhbiBvYmplY3Qgd2l0aG91dCBhIHByb3RvdHlwZVwiO1xyXG5cdGVsc2UgcmV0dXJuIGZ1bmN0aW9uTmFtZShwcm90b3R5cGUuY29uc3RydWN0b3IpICsgXCIgaW5zdGFuY2VcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VHlwZSh2YXJpYWJsZSkge1xyXG5cdHZhciB0eXBlID0gdHlwZW9mIHZhcmlhYmxlO1xyXG5cdGlmICh2YXJpYWJsZSA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xyXG5cdGlmIChpc0FycmF5KHZhcmlhYmxlKSkgdHlwZSA9IFwiYXJyYXlcIjtcclxuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih2YXJpYWJsZSkpIHR5cGUgPSBcIk5hTlwiO1xyXG5cdHJldHVybiB0eXBlO1xyXG59XHJcblxyXG5cclxuLyoqKioqL1xyXG5cclxudmFyIEVuc3VyZUV4Y2VwdGlvbiA9IGV4cG9ydHMuRW5zdXJlRXhjZXB0aW9uID0gZnVuY3Rpb24oZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlLCBtZXNzYWdlKSB7XHJcblx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UpO1xyXG5cdGVsc2UgdGhpcy5zdGFjayA9IChuZXcgRXJyb3IoKSkuc3RhY2s7XHJcblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxufTtcclxuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZSA9IGNyZWF0ZU9iamVjdChFcnJvci5wcm90b3R5cGUpO1xyXG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5zdXJlRXhjZXB0aW9uO1xyXG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLm5hbWUgPSBcIkVuc3VyZUV4Y2VwdGlvblwiO1xyXG5cclxuXHJcbi8qKioqKi9cclxuXHJcbi8vIFdPUktBUk9VTkQgSUU4OiBubyBPYmplY3QuY3JlYXRlKClcclxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0KHByb3RvdHlwZSkge1xyXG5cdGlmIChPYmplY3QuY3JlYXRlKSByZXR1cm4gT2JqZWN0LmNyZWF0ZShwcm90b3R5cGUpO1xyXG5cclxuXHR2YXIgVGVtcCA9IGZ1bmN0aW9uIFRlbXAoKSB7fTtcclxuXHRUZW1wLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcclxuXHRyZXR1cm4gbmV3IFRlbXAoKTtcclxufVxyXG5cclxuLy8gV09SS0FST1VORCBJRTggSUU5IElFMTAgSUUxMTogbm8gZnVuY3Rpb24ubmFtZVxyXG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcclxuXHRpZiAoZm4ubmFtZSkgcmV0dXJuIGZuLm5hbWU7XHJcblxyXG5cdC8vIFRoaXMgd29ya2Fyb3VuZCBpcyBiYXNlZCBvbiBjb2RlIGJ5IEphc29uIEJ1bnRpbmcgZXQgYWwsIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMzMjQyOVxyXG5cdHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKyguezEsfSlcXHMqXFwoLztcclxuXHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XHJcblx0cmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdIDogXCI8YW5vbj5cIjtcclxufVxyXG5cclxuLy8gV09SS0FST1VORCBJRTg6IG5vIEFycmF5LmlzQXJyYXlcclxuZnVuY3Rpb24gaXNBcnJheSh0aGluZykge1xyXG5cdGlmIChBcnJheS5pc0FycmF5KSByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGluZyk7XHJcblxyXG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpbmcpID09PSAnW29iamVjdCBBcnJheV0nO1xyXG59XHJcblxyXG4vLyBXT1JLQVJPVU5EIElFODogbm8gT2JqZWN0LmdldFByb3RvdHlwZU9mXHJcbmZ1bmN0aW9uIGdldFByb3RvdHlwZShvYmopIHtcclxuXHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XHJcblxyXG5cdHZhciByZXN1bHQgPSBvYmouY29uc3RydWN0b3IgPyBvYmouY29uc3RydWN0b3IucHJvdG90eXBlIDogbnVsbDtcclxuXHRyZXR1cm4gcmVzdWx0IHx8IG51bGw7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xyXG5cdGlmIChzdHIubGVuZ3RoID09PSAxKSB7XHJcblx0XHRyZXR1cm4gc3RyO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHN0clxyXG5cdC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpXHJcblx0LnRvTG93ZXJDYXNlKClcclxuXHQucmVwbGFjZSgvW18uXFwtIF0rKFxcd3wkKS9nLCBmdW5jdGlvbiAobSwgcDEpIHtcclxuXHRcdHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xyXG5cdH0pO1xyXG59O1xyXG4iXX0=
