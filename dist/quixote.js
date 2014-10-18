!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.quixote=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Descriptor() {};

var ABSTRACT_METHODS = [
	"value",
	"convert",
	"joiner",
	"toString"
];

createAbstractMethods(ABSTRACT_METHODS);

Me.extend = function extend(Subclass) {
	ensure.signature(arguments, [ Function ]);

	Subclass.prototype = shim.Object.create(Me.prototype);
	Subclass.prototype.constructor = Subclass;
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ [Number, Me] ]);
	expected = this.convert(expected);

	var actualValue = this.value();
	var expectedValue = expected.value();

	if (actualValue.equals(expectedValue)) return "";

	return "Expected " + this.toString() + " (" + this.value() + ") " +
		expected.describeMatch() +
		", but was " + actualValue.diff(expectedValue);
};

Me.prototype.describeMatch = function describeMatch() {
	return this.joiner() + " " + this.toString() + " (" + this.value() + ")";
};

Me.prototype.checkAbstractMethods = function checkAbstractMethods() {
	var unimplemented = [];
	var self = this;
	shim.Array.forEach(ABSTRACT_METHODS, function(name) {
		if (self[name] === Me.prototype[name]) unimplemented.push(name + "()");
	});
	return unimplemented;
};

function createAbstractMethods(names) {
	shim.Array.forEach(names, function(name) {
		Me.prototype[name] = function() {
			ensure.unreachable("Descriptor subclasses must implement " + name + "() method");
		};
	});
}

},{"../util/ensure.js":9,"../util/shim.js":10}],2:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementCenter(dimension, element) {
	// TODO: ensure.signature (circular dependency)
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._element = element;
};
Descriptor.extend(Me);

Me.x = function(element) {
	return new Me(X_DIMENSION, element);
};

Me.y = function(element) {
	return new Me(Y_DIMENSION, element);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();

	if (this._dimension === X_DIMENSION) return Position.x(position.left + ((position.right - position.left) / 2));
	else return Position.y(position.top + ((position.bottom - position.top) / 2));
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor ]]);

	if (typeof arg !== "number") return arg;

	if (this._dimension === X_DIMENSION) return Position.x(arg);
	else return Position.y(arg);
};

Me.prototype.joiner = function joiner() { return "to match"; };

Me.prototype.toString = function toString() {
	var description = (this._dimension === X_DIMENSION) ? "center" : "middle";
	return description + " of " + this._element;
};
},{"../util/ensure.js":9,"../values/position.js":11,"./descriptor.js":1}],3:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var ElementPosition = require("./element_position.js");
var Descriptor = require("./descriptor.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
//	ensure.signature(arguments, [ QElement ]);      // TODO: creates circular dependency
	this._element = element;
	this._position = position;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.plus = function plus(amount) {
	ensure.signature(arguments, [ Number ]);

	if (this._position === TOP || this._position === BOTTOM) return ElementPosition.y(this, amount);
	if (this._position === RIGHT || this._position === LEFT) return ElementPosition.x(this, amount);

	ensure.unreachable();
};

Me.prototype.minus = function minus(amount) {
	ensure.signature(arguments, [ Number ]);

	return this.plus(amount * -1);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var result = this._element.getRawPosition()[this._position];
	return createPosition(this, result);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);

	if (typeof arg === "number") return createPosition(this, arg);
	else return arg;
};

Me.prototype.joiner = function joiner() { return "to match"; };

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._position + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function createPosition(self, value) {
	if (self._position === TOP || self._position === BOTTOM) return Position.y(value);
	if (self._position === RIGHT || self._position === LEFT) return Position.x(value);

	ensure.unreachable();
}
},{"../util/ensure.js":9,"../values/position.js":11,"./descriptor.js":1,"./element_position.js":4}],4:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var ElementEdge = require("./element_edge.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementPosition(dimension, edge, relativeAmount) {
//	ensure.signature(arguments, [ String, ElementEdge, Number ]); // TODO: creates circular dependency
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._edge = edge;
	this._amount = relativeAmount;
};
Descriptor.extend(Me);

Me.x = function x(edge, relativeAmount) {
	return new Me(X_DIMENSION, edge, relativeAmount);
};

Me.y = function y(edge, relativeAmount) {
	return new Me(Y_DIMENSION, edge, relativeAmount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this._edge.value().plus(this._amount);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);

	if (typeof arg === "number") return createPosition(this, arg);
	else return arg;

};

Me.prototype.joiner = function joiner() { return "to be"; };

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return relativeAmount(this) + this._edge.toString();
};

function relativeAmount(self) {
	if (self._amount === 0) return "";

	var direction;
	if (self._dimension === X_DIMENSION) direction = (self._amount < 0) ? "left of" : "right of";
	else direction = (self._amount < 0) ? "above" : "below";

	return Math.abs(self._amount) + "px " + direction + " ";
}

function createPosition(self, value) {
	if (self._dimension === X_DIMENSION) return Position.x(value);
	else return Position.y(value);
}
},{"../util/ensure.js":9,"../values/position.js":11,"./descriptor.js":1,"./element_edge.js":3}],5:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementSize(dimension, element) {
	// TODO: circular dependency prevents ensure.signature
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._element = element;
};
Descriptor.extend(Me);

Me.x = function x(element) {
	return new Me(X_DIMENSION, element);
};

Me.y = function y(element) {
	return new Me(Y_DIMENSION, element);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();
	var result = (this._dimension === X_DIMENSION) ? position.width : position.height;

	return new Size(result);
};

Me.prototype.convert = function convert(arg) {
	ensure.signature(arguments, [ [Number, Descriptor] ]);
	if (typeof arg !== "number") return arg;

	return new Size(arg);
};

Me.prototype.joiner = function joiner() { return "to match"; };

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var desc = (this._dimension === X_DIMENSION) ? "width" : "height";
	return desc + " of " + this._element;
};
},{"../util/ensure.js":9,"../values/size.js":12,"./descriptor.js":1}],6:[function(require,module,exports){
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

},{"./q_element.js":7,"./util/ensure.js":9}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var shim = require("./util/shim.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementCenter = require("./descriptors/element_center.js");
var ElementSize = require("./descriptors/element_size.js");

var Me = module.exports = function QElement(domElement, nickname) {
	ensure.signature(arguments, [ Object, [ String ] ]);

	this._domElement = domElement;
	this._nickname = nickname;

	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.center = ElementCenter.x(this);
	this.middle = ElementCenter.y(this);

	this.width = ElementSize.x(this);
	this.height = ElementSize.y(this);
};

Me.prototype.assert = function assert(expected, message) {
	ensure.signature(arguments, [ Object, [undefined, String] ]);
	if (message === undefined) message = "Differences found";

	var diff = this.diff(expected);
	if (diff !== "") throw new Error(message + ":\n" + diff);
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Object ]);

	var result = [];
	var keys = shim.Object.keys(expected);
	var key, oneDiff, constraint;
	for (var i = 0; i < keys.length; i++) {
		key = keys[i];
		constraint = this[key];
		ensure.that(constraint !== undefined, "'" + key + "' is unknown and can't be used with diff()");
		oneDiff = constraint.diff(expected[key]);
		if (oneDiff !== "") result.push(oneDiff);
	}

	return result.join("\n");
};

Me.prototype.getRawStyle = function getRawStyle(styleName) {
	ensure.signature(arguments, [ String ]);

	var styles;
	var result;

	// WORKAROUND IE 8: no getComputedStyle()
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

Me.prototype.getRawPosition = function getRawPosition() {
	ensure.signature(arguments, []);

	// WORKAROUND IE 8: No TextRectangle.height or .width
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

Me.prototype.toDomElement = function toDomElement() {
	ensure.signature(arguments, []);
	return this._domElement;
};

Me.prototype.description = function description() {
	ensure.signature(arguments, []);
	return this._nickname;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "'" + this._nickname + "'";
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);
	return this._domElement === that._domElement;
};

},{"../vendor/camelcase-1.0.1-modified.js":13,"./descriptors/element_center.js":2,"./descriptors/element_edge.js":3,"./descriptors/element_size.js":5,"./util/ensure.js":9,"./util/shim.js":10}],8:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var Frame = require("./frame.js");

exports.createFrame = function(width, height, options, callback) {
	return Frame.create(document.body, width, height, options, callback);
};
},{"./frame.js":6,"./util/ensure.js":9}],9:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

// Runtime assertions for production code. (Contrast to assert.js, which is for test code.)

var shim = require("./shim.js");

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

		if (!shim.Array.isArray(type)) type = [ type ];
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
				else {
					return shim.Function.name(type) + " instance";
				}
		}
	}
}

function explainArg(arg) {
	var type = getType(arg);
	if (type !== "object") return type;

	var prototype = shim.Object.getPrototypeOf(arg);
	if (prototype === null) return "an object without a prototype";
	else {
		return shim.Function.name(prototype.constructor) + " instance";
	}
}

function getType(variable) {
	var type = typeof variable;
	if (variable === null) type = "null";
	if (shim.Array.isArray(variable)) type = "array";
	if (type === "number" && isNaN(variable)) type = "NaN";
	return type;
}


/*****/

var EnsureException = exports.EnsureException = function(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
};
EnsureException.prototype = shim.Object.create(Error.prototype);
EnsureException.prototype.constructor = EnsureException;
EnsureException.prototype.name = "EnsureException";

},{"./shim.js":10}],10:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

exports.Object = {

	// WORKAROUND IE 8: no Object.create()
	create: function create(prototype) {
		if (Object.create) return Object.create(prototype);

		var Temp = function Temp() {};
		Temp.prototype = prototype;
		return new Temp();
	},

	// WORKAROUND IE 8: no Object.getPrototypeOf
	getPrototypeOf: function getPrototypeOf(obj) {
		if (Object.getPrototypeOf) return Object.getPrototypeOf(obj);

		var result = obj.constructor ? obj.constructor.prototype : null;
		return result || null;
	},

	// WORKAROUND IE 8: No Object.keys
	keys: function keys(obj) {
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

};


exports.Function = {

	// WORKAROUND IE 8, IE 9, IE 10, IE 11: no function.name
	name: function name(fn) {
		if (fn.name) return fn.name;

		// Based on code by Jason Bunting et al, http://stackoverflow.com/a/332429
		var funcNameRegex = /function\s+(.{1,})\s*\(/;
		var results = (funcNameRegex).exec((fn).toString());
		return (results && results.length > 1) ? results[1] : "<anon>";
	}

};


exports.Array = {

	// WORKAROUND IE 8: no Array.isArray
	isArray: function isArray(thing) {
		if (Array.isArray) return Array.isArray(thing);

		return Object.prototype.toString.call(thing) === '[object Array]';
	},

	// WORKAROUND IE 8: no Array.forEach
	forEach: function forEach(obj, callback, thisArg) {
		/*jshint bitwise:false, eqeqeq:false, -W041:false */

		if (Array.prototype.forEach) return obj.forEach(callback, thisArg);

		// This workaround based on polyfill code from MDN:
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach

		// Production steps of ECMA-262, Edition 5, 15.4.4.18
		// Reference: http://es5.github.io/#x15.4.4.18

    var T, k;

    if (obj == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(obj);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
	}

};

},{}],11:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Position(dimension, value) {
	ensure.signature(arguments, [ String, Number ]);

	this._dimension = dimension;
	this._position = value;
};

Me.x = function x(value) {
	return new Me(X_DIMENSION, value);
};

Me.y = function y(value) {
	return new Me(Y_DIMENSION, value);
};

Me.prototype.plus = function plus(amount) {
	ensure.signature(arguments, [ Number ]);

	return new Me(this._dimension, this._position + amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this;
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Me ]);
	ensure.that(this._dimension === expected._dimension, "Can't compare X dimension to Y dimension");

	var actualValue = this._position;
	var expectedValue = expected._position;

	var direction;
	if (this._dimension === X_DIMENSION) direction = expectedValue > actualValue ? "to the left" : "to the right";
	else direction = expectedValue > actualValue ? "lower" : "higher";

	var value = Math.abs(expectedValue - actualValue);
	if (value === 0) return "";
	else return value + "px " + direction;
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);

	return (this.diff(that) === "");
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "be " + this;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._position + "px";
};

},{"../util/ensure.js":9}],12:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ Number ]);
	ensure.that(value >= 0, "Doesn't make sense to have negative size, but got " + value);

	this._value = value;
};

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	return this;
};

Me.prototype.diff = function(expected) {
	ensure.signature(arguments, [ Me ]);

	var actualValue = this._value;
	var expectedValue = expected._value;

	var desc = actualValue > expectedValue ? "px larger" : "px smaller";
	return Math.abs(actualValue - expectedValue) + desc;
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);

	return this._value === that._value;
};

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);

	return "be " + this;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._value + "px";
};
},{"../util/ensure.js":9}],13:[function(require,module,exports){
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

},{}]},{},[8])(8)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9kZXNjcmlwdG9yLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9jZW50ZXIuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X3Bvc2l0aW9uLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9zaXplLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZnJhbWUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xX2VsZW1lbnQuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xdWl4b3RlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdXRpbC9lbnN1cmUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL3NoaW0uanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvcG9zaXRpb24uanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvc2l6ZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi4vdXRpbC9zaGltLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIERlc2NyaXB0b3IoKSB7fTtcblxudmFyIEFCU1RSQUNUX01FVEhPRFMgPSBbXG5cdFwidmFsdWVcIixcblx0XCJjb252ZXJ0XCIsXG5cdFwiam9pbmVyXCIsXG5cdFwidG9TdHJpbmdcIlxuXTtcblxuY3JlYXRlQWJzdHJhY3RNZXRob2RzKEFCU1RSQUNUX01FVEhPRFMpO1xuXG5NZS5leHRlbmQgPSBmdW5jdGlvbiBleHRlbmQoU3ViY2xhc3MpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgRnVuY3Rpb24gXSk7XG5cblx0U3ViY2xhc3MucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKE1lLnByb3RvdHlwZSk7XG5cdFN1YmNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN1YmNsYXNzO1xufTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFtOdW1iZXIsIE1lXSBdKTtcblx0ZXhwZWN0ZWQgPSB0aGlzLmNvbnZlcnQoZXhwZWN0ZWQpO1xuXG5cdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMudmFsdWUoKTtcblx0dmFyIGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC52YWx1ZSgpO1xuXG5cdGlmIChhY3R1YWxWYWx1ZS5lcXVhbHMoZXhwZWN0ZWRWYWx1ZSkpIHJldHVybiBcIlwiO1xuXG5cdHJldHVybiBcIkV4cGVjdGVkIFwiICsgdGhpcy50b1N0cmluZygpICsgXCIgKFwiICsgdGhpcy52YWx1ZSgpICsgXCIpIFwiICtcblx0XHRleHBlY3RlZC5kZXNjcmliZU1hdGNoKCkgK1xuXHRcdFwiLCBidXQgd2FzIFwiICsgYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS5kZXNjcmliZU1hdGNoID0gZnVuY3Rpb24gZGVzY3JpYmVNYXRjaCgpIHtcblx0cmV0dXJuIHRoaXMuam9pbmVyKCkgKyBcIiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiIChcIiArIHRoaXMudmFsdWUoKSArIFwiKVwiO1xufTtcblxuTWUucHJvdG90eXBlLmNoZWNrQWJzdHJhY3RNZXRob2RzID0gZnVuY3Rpb24gY2hlY2tBYnN0cmFjdE1ldGhvZHMoKSB7XG5cdHZhciB1bmltcGxlbWVudGVkID0gW107XG5cdHZhciBzZWxmID0gdGhpcztcblx0c2hpbS5BcnJheS5mb3JFYWNoKEFCU1RSQUNUX01FVEhPRFMsIGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRpZiAoc2VsZltuYW1lXSA9PT0gTWUucHJvdG90eXBlW25hbWVdKSB1bmltcGxlbWVudGVkLnB1c2gobmFtZSArIFwiKClcIik7XG5cdH0pO1xuXHRyZXR1cm4gdW5pbXBsZW1lbnRlZDtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUFic3RyYWN0TWV0aG9kcyhuYW1lcykge1xuXHRzaGltLkFycmF5LmZvckVhY2gobmFtZXMsIGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRNZS5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdGVuc3VyZS51bnJlYWNoYWJsZShcIkRlc2NyaXB0b3Igc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBcIiArIG5hbWUgKyBcIigpIG1ldGhvZFwiKTtcblx0XHR9O1xuXHR9KTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudENlbnRlcihkaW1lbnNpb24sIGVsZW1lbnQpIHtcblx0Ly8gVE9ETzogZW5zdXJlLnNpZ25hdHVyZSAoY2lyY3VsYXIgZGVwZW5kZW5jeSlcblx0ZW5zdXJlLnRoYXQoZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTiB8fCBkaW1lbnNpb24gPT09IFlfRElNRU5TSU9OLCBcIlVucmVjb2duaXplZCBkaW1lbnNpb246IFwiICsgZGltZW5zaW9uKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0cmV0dXJuIG5ldyBNZShYX0RJTUVOU0lPTiwgZWxlbWVudCk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBwb3NpdGlvbiA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKTtcblxuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIFBvc2l0aW9uLngocG9zaXRpb24ubGVmdCArICgocG9zaXRpb24ucmlnaHQgLSBwb3NpdGlvbi5sZWZ0KSAvIDIpKTtcblx0ZWxzZSByZXR1cm4gUG9zaXRpb24ueShwb3NpdGlvbi50b3AgKyAoKHBvc2l0aW9uLmJvdHRvbSAtIHBvc2l0aW9uLnRvcCkgLyAyKSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFtOdW1iZXIsIERlc2NyaXB0b3IgXV0pO1xuXG5cdGlmICh0eXBlb2YgYXJnICE9PSBcIm51bWJlclwiKSByZXR1cm4gYXJnO1xuXG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueChhcmcpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUuam9pbmVyID0gZnVuY3Rpb24gam9pbmVyKCkgeyByZXR1cm4gXCJ0byBtYXRjaFwiOyB9O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0dmFyIGRlc2NyaXB0aW9uID0gKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pID8gXCJjZW50ZXJcIiA6IFwibWlkZGxlXCI7XG5cdHJldHVybiBkZXNjcmlwdGlvbiArIFwiIG9mIFwiICsgdGhpcy5fZWxlbWVudDtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBFbGVtZW50UG9zaXRpb24gPSByZXF1aXJlKFwiLi9lbGVtZW50X3Bvc2l0aW9uLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xuXG52YXIgVE9QID0gXCJ0b3BcIjtcbnZhciBSSUdIVCA9IFwicmlnaHRcIjtcbnZhciBCT1RUT00gPSBcImJvdHRvbVwiO1xudmFyIExFRlQgPSBcImxlZnRcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFbGVtZW50RWRnZShlbGVtZW50LCBwb3NpdGlvbikge1xuLy9cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFFFbGVtZW50IF0pOyAgICAgIC8vIFRPRE86IGNyZWF0ZXMgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHR0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcblx0dGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciBdKTtcblxuXHRpZiAodGhpcy5fcG9zaXRpb24gPT09IFRPUCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gQk9UVE9NKSByZXR1cm4gRWxlbWVudFBvc2l0aW9uLnkodGhpcywgYW1vdW50KTtcblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBSSUdIVCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gTEVGVCkgcmV0dXJuIEVsZW1lbnRQb3NpdGlvbi54KHRoaXMsIGFtb3VudCk7XG5cblx0ZW5zdXJlLnVucmVhY2hhYmxlKCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXG5cdHJldHVybiB0aGlzLnBsdXMoYW1vdW50ICogLTEpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHJlc3VsdCA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKVt0aGlzLl9wb3NpdGlvbl07XG5cdHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCByZXN1bHQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbTnVtYmVyLCBEZXNjcmlwdG9yXSBdKTtcblxuXHRpZiAodHlwZW9mIGFyZyA9PT0gXCJudW1iZXJcIikgcmV0dXJuIGNyZWF0ZVBvc2l0aW9uKHRoaXMsIGFyZyk7XG5cdGVsc2UgcmV0dXJuIGFyZztcbn07XG5cbk1lLnByb3RvdHlwZS5qb2luZXIgPSBmdW5jdGlvbiBqb2luZXIoKSB7IHJldHVybiBcInRvIG1hdGNoXCI7IH07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzLl9wb3NpdGlvbiArIFwiIGVkZ2Ugb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKHBvc2l0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBmYWN0b3J5KGVsZW1lbnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQsIHBvc2l0aW9uKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zaXRpb24oc2VsZiwgdmFsdWUpIHtcblx0aWYgKHNlbGYuX3Bvc2l0aW9uID09PSBUT1AgfHwgc2VsZi5fcG9zaXRpb24gPT09IEJPVFRPTSkgcmV0dXJuIFBvc2l0aW9uLnkodmFsdWUpO1xuXHRpZiAoc2VsZi5fcG9zaXRpb24gPT09IFJJR0hUIHx8IHNlbGYuX3Bvc2l0aW9uID09PSBMRUZUKSByZXR1cm4gUG9zaXRpb24ueCh2YWx1ZSk7XG5cblx0ZW5zdXJlLnVucmVhY2hhYmxlKCk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIEVsZW1lbnRFZGdlID0gcmVxdWlyZShcIi4vZWxlbWVudF9lZGdlLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFbGVtZW50UG9zaXRpb24oZGltZW5zaW9uLCBlZGdlLCByZWxhdGl2ZUFtb3VudCkge1xuLy9cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgRWxlbWVudEVkZ2UsIE51bWJlciBdKTsgLy8gVE9ETzogY3JlYXRlcyBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS50aGF0KGRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gfHwgZGltZW5zaW9uID09PSBZX0RJTUVOU0lPTiwgXCJVbnJlY29nbml6ZWQgZGltZW5zaW9uOiBcIiArIGRpbWVuc2lvbik7XG5cblx0dGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR0aGlzLl9lZGdlID0gZWRnZTtcblx0dGhpcy5fYW1vdW50ID0gcmVsYXRpdmVBbW91bnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24geChlZGdlLCByZWxhdGl2ZUFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCBlZGdlLCByZWxhdGl2ZUFtb3VudCk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24geShlZGdlLCByZWxhdGl2ZUFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCBlZGdlLCByZWxhdGl2ZUFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fZWRnZS52YWx1ZSgpLnBsdXModGhpcy5fYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgRGVzY3JpcHRvcl0gXSk7XG5cblx0aWYgKHR5cGVvZiBhcmcgPT09IFwibnVtYmVyXCIpIHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCBhcmcpO1xuXHRlbHNlIHJldHVybiBhcmc7XG5cbn07XG5cbk1lLnByb3RvdHlwZS5qb2luZXIgPSBmdW5jdGlvbiBqb2luZXIoKSB7IHJldHVybiBcInRvIGJlXCI7IH07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiByZWxhdGl2ZUFtb3VudCh0aGlzKSArIHRoaXMuX2VkZ2UudG9TdHJpbmcoKTtcbn07XG5cbmZ1bmN0aW9uIHJlbGF0aXZlQW1vdW50KHNlbGYpIHtcblx0aWYgKHNlbGYuX2Ftb3VudCA9PT0gMCkgcmV0dXJuIFwiXCI7XG5cblx0dmFyIGRpcmVjdGlvbjtcblx0aWYgKHNlbGYuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIGRpcmVjdGlvbiA9IChzZWxmLl9hbW91bnQgPCAwKSA/IFwibGVmdCBvZlwiIDogXCJyaWdodCBvZlwiO1xuXHRlbHNlIGRpcmVjdGlvbiA9IChzZWxmLl9hbW91bnQgPCAwKSA/IFwiYWJvdmVcIiA6IFwiYmVsb3dcIjtcblxuXHRyZXR1cm4gTWF0aC5hYnMoc2VsZi5fYW1vdW50KSArIFwicHggXCIgKyBkaXJlY3Rpb24gKyBcIiBcIjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zaXRpb24oc2VsZiwgdmFsdWUpIHtcblx0aWYgKHNlbGYuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBQb3NpdGlvbi54KHZhbHVlKTtcblx0ZWxzZSByZXR1cm4gUG9zaXRpb24ueSh2YWx1ZSk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudFNpemUoZGltZW5zaW9uLCBlbGVtZW50KSB7XG5cdC8vIFRPRE86IGNpcmN1bGFyIGRlcGVuZGVuY3kgcHJldmVudHMgZW5zdXJlLnNpZ25hdHVyZVxuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24geChlbGVtZW50KSB7XG5cdHJldHVybiBuZXcgTWUoWF9ESU1FTlNJT04sIGVsZW1lbnQpO1xufTtcblxuTWUueSA9IGZ1bmN0aW9uIHkoZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBwb3NpdGlvbiA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKTtcblx0dmFyIHJlc3VsdCA9ICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSA/IHBvc2l0aW9uLndpZHRoIDogcG9zaXRpb24uaGVpZ2h0O1xuXG5cdHJldHVybiBuZXcgU2l6ZShyZXN1bHQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbTnVtYmVyLCBEZXNjcmlwdG9yXSBdKTtcblx0aWYgKHR5cGVvZiBhcmcgIT09IFwibnVtYmVyXCIpIHJldHVybiBhcmc7XG5cblx0cmV0dXJuIG5ldyBTaXplKGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUuam9pbmVyID0gZnVuY3Rpb24gam9pbmVyKCkgeyByZXR1cm4gXCJ0byBtYXRjaFwiOyB9O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgZGVzYyA9ICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSA/IFwid2lkdGhcIiA6IFwiaGVpZ2h0XCI7XG5cdHJldHVybiBkZXNjICsgXCIgb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudC5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBGcmFtZShkb21FbGVtZW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCBdKTtcblx0ZW5zdXJlLnRoYXQoZG9tRWxlbWVudC50YWdOYW1lID09PSBcIklGUkFNRVwiLCBcIkRPTSBlbGVtZW50IG11c3QgYmUgYW4gaWZyYW1lXCIpO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xuXHR0aGlzLl9sb2FkZWQgPSBmYWxzZTtcblx0dGhpcy5fcmVtb3ZlZCA9IGZhbHNlO1xufTtcblxuZnVuY3Rpb24gbG9hZGVkKHNlbGYpIHtcblx0c2VsZi5fbG9hZGVkID0gdHJ1ZTtcblx0c2VsZi5fZG9jdW1lbnQgPSBzZWxmLl9kb21FbGVtZW50LmNvbnRlbnREb2N1bWVudDtcblx0c2VsZi5fb3JpZ2luYWxCb2R5ID0gc2VsZi5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUw7XG59XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIE51bWJlciwgTnVtYmVyLCBbIE9iamVjdCwgRnVuY3Rpb24gXSwgWyB1bmRlZmluZWQsIEZ1bmN0aW9uIF0gXSk7XG5cblx0aWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpIHtcblx0XHRjYWxsYmFjayA9IG9wdGlvbnM7XG5cdFx0b3B0aW9ucyA9IHt9O1xuXHR9XG5cblx0Ly8gV09SS0FST1VORCBNb2JpbGUgU2FmYXJpIDcuMC4wOiB3ZWlyZCBzdHlsZSByZXN1bHRzIG9jY3VyIHdoZW4gYm90aCBzcmMgYW5kIHN0eWxlc2hlZXQgYXJlIGxvYWRlZCAoc2VlIHRlc3QpXG5cdGVuc3VyZS50aGF0KFxuXHRcdCEob3B0aW9ucy5zcmMgJiYgb3B0aW9ucy5zdHlsZXNoZWV0KSxcblx0XHRcIkNhbm5vdCBzcGVjaWZ5IEhUTUwgVVJMIGFuZCBzdHlsZXNoZWV0IFVSTCBzaW11bHRhbmVvdXNseSBkdWUgdG8gTW9iaWxlIFNhZmFyaSBpc3N1ZVwiXG5cdCk7XG5cblx0dmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB3aWR0aCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImZyYW1lYm9yZGVyXCIsIFwiMFwiKTsgICAgLy8gV09SS0FST1VORCBJRSA4OiBkb24ndCBpbmNsdWRlIGZyYW1lIGJvcmRlciBpbiBwb3NpdGlvbiBjYWxjc1xuXHRpZiAob3B0aW9ucy5zcmMpIGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgb3B0aW9ucy5zcmMpO1xuXG5cdHZhciBmcmFtZSA9IG5ldyBNZShpZnJhbWUpO1xuXHRhZGRMb2FkTGlzdGVuZXIoaWZyYW1lLCBvbkZyYW1lTG9hZCk7XG5cdHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblx0cmV0dXJuIGZyYW1lO1xuXG5cdGZ1bmN0aW9uIG9uRnJhbWVMb2FkKCkge1xuXHRcdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMCwgU2FmYXJpIDYuMi4wLCBDaHJvbWUgMzguMC4yMTI1OiBmcmFtZSBpcyBsb2FkZWQgc3luY2hyb25vdXNseVxuXHRcdC8vIFdlIGZvcmNlIGl0IHRvIGJlIGFzeW5jaHJvbm91cyBoZXJlXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGxvYWRlZChmcmFtZSk7XG5cdFx0XHRsb2FkU3R5bGVzaGVldChmcmFtZSwgb3B0aW9ucy5zdHlsZXNoZWV0LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZnJhbWUpO1xuXHRcdFx0fSk7XG5cdFx0fSwgMCk7XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGxvYWRTdHlsZXNoZWV0KHNlbGYsIHVybCwgY2FsbGJhY2spIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUsIFsgdW5kZWZpbmVkLCBTdHJpbmcgXSwgRnVuY3Rpb24gXSk7XG5cdGlmICh1cmwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGNhbGxiYWNrKCk7XG5cblx0dmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0YWRkTG9hZExpc3RlbmVyKGxpbmssIG9uTGlua0xvYWQpO1xuXHRsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHQvY3NzXCIpO1xuXHRsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcblxuXHRkb2N1bWVudEhlYWQoc2VsZikuYXBwZW5kQ2hpbGQobGluayk7XG5cblx0ZnVuY3Rpb24gb25MaW5rTG9hZCgpIHtcblx0XHRjYWxsYmFjaygpO1xuXHR9XG59XG5cbk1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dGhpcy5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB0aGlzLl9vcmlnaW5hbEJvZHk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZU5vdFJlbW92ZWQodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZUxvYWRlZCh0aGlzKTtcblx0aWYgKHRoaXMuX3JlbW92ZWQpIHJldHVybjtcblxuXHR0aGlzLl9yZW1vdmVkID0gdHJ1ZTtcblx0dGhpcy5fZG9tRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2RvbUVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLmFkZEVsZW1lbnQgPSBmdW5jdGlvbihodG1sKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHZhciB0ZW1wRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRlbXBFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG5cdGVuc3VyZS50aGF0KFxuXHRcdHRlbXBFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoID09PSAxLFxuXHRcdFwiRXhwZWN0ZWQgb25lIGVsZW1lbnQsIGJ1dCBnb3QgXCIgKyB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCArIFwiIChcIiArIGh0bWwgKyBcIilcIlxuXHQpO1xuXG5cdHZhciBpbnNlcnRlZEVsZW1lbnQgPSB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzWzBdO1xuXHR0aGlzLl9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluc2VydGVkRWxlbWVudCk7XG5cdHJldHVybiBuZXcgUUVsZW1lbnQoaW5zZXJ0ZWRFbGVtZW50LCBodG1sKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIG5vZGVzID0gdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cdGVuc3VyZS50aGF0KG5vZGVzLmxlbmd0aCA9PT0gMSwgXCJFeHBlY3RlZCBvbmUgZWxlbWVudCB0byBtYXRjaCAnXCIgKyBzZWxlY3RvciArIFwiJywgYnV0IGZvdW5kIFwiICsgbm9kZXMubGVuZ3RoKTtcblx0cmV0dXJuIG5ldyBRRWxlbWVudChub2Rlc1swXSwgc2VsZWN0b3IpO1xufTtcblxuLy8gV09SS0FST1VORCBJRTg6IG5vIGFkZEV2ZW50TGlzdGVuZXIoKVxuZnVuY3Rpb24gYWRkTG9hZExpc3RlbmVyKGlmcmFtZURvbSwgY2FsbGJhY2spIHtcblx0aWYgKGlmcmFtZURvbS5hZGRFdmVudExpc3RlbmVyKSBpZnJhbWVEb20uYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgY2FsbGJhY2spO1xuXHRlbHNlIGlmcmFtZURvbS5hdHRhY2hFdmVudChcIm9ubG9hZFwiLCBjYWxsYmFjayk7XG59XG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBkb2N1bWVudC5oZWFkXG5mdW5jdGlvbiBkb2N1bWVudEhlYWQoc2VsZikge1xuXHRpZiAoc2VsZi5fZG9jdW1lbnQuaGVhZCkgcmV0dXJuIHNlbGYuX2RvY3VtZW50LmhlYWQ7XG5cdGVsc2UgcmV0dXJuIHNlbGYuX2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoZWFkXCIpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVVc2FibGUoc2VsZikge1xuXHRlbnN1cmVMb2FkZWQoc2VsZik7XG5cdGVuc3VyZU5vdFJlbW92ZWQoc2VsZik7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZUxvYWRlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KHNlbGYuX2xvYWRlZCwgXCJGcmFtZSBub3QgbG9hZGVkOiBXYWl0IGZvciBmcmFtZSBjcmVhdGlvbiBjYWxsYmFjayB0byBleGVjdXRlIGJlZm9yZSB1c2luZyBmcmFtZVwiKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTm90UmVtb3ZlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KCFzZWxmLl9yZW1vdmVkLCBcIkF0dGVtcHRlZCB0byB1c2UgZnJhbWUgYWZ0ZXIgaXQgd2FzIHJlbW92ZWRcIik7XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKFwiLi4vdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIEVsZW1lbnRFZGdlID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZWxlbWVudF9lZGdlLmpzXCIpO1xudmFyIEVsZW1lbnRDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X2NlbnRlci5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudChkb21FbGVtZW50LCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIFsgU3RyaW5nIF0gXSk7XG5cblx0dGhpcy5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XG5cdHRoaXMuX25pY2tuYW1lID0gbmlja25hbWU7XG5cblx0dGhpcy50b3AgPSBFbGVtZW50RWRnZS50b3AodGhpcyk7XG5cdHRoaXMucmlnaHQgPSBFbGVtZW50RWRnZS5yaWdodCh0aGlzKTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50RWRnZS5ib3R0b20odGhpcyk7XG5cdHRoaXMubGVmdCA9IEVsZW1lbnRFZGdlLmxlZnQodGhpcyk7XG5cblx0dGhpcy5jZW50ZXIgPSBFbGVtZW50Q2VudGVyLngodGhpcyk7XG5cdHRoaXMubWlkZGxlID0gRWxlbWVudENlbnRlci55KHRoaXMpO1xuXG5cdHRoaXMud2lkdGggPSBFbGVtZW50U2l6ZS54KHRoaXMpO1xuXHR0aGlzLmhlaWdodCA9IEVsZW1lbnRTaXplLnkodGhpcyk7XG59O1xuXG5NZS5wcm90b3R5cGUuYXNzZXJ0ID0gZnVuY3Rpb24gYXNzZXJ0KGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgW3VuZGVmaW5lZCwgU3RyaW5nXSBdKTtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRGlmZmVyZW5jZXMgZm91bmRcIjtcblxuXHR2YXIgZGlmZiA9IHRoaXMuZGlmZihleHBlY3RlZCk7XG5cdGlmIChkaWZmICE9PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSArIFwiOlxcblwiICsgZGlmZik7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0IF0pO1xuXG5cdHZhciByZXN1bHQgPSBbXTtcblx0dmFyIGtleXMgPSBzaGltLk9iamVjdC5rZXlzKGV4cGVjdGVkKTtcblx0dmFyIGtleSwgb25lRGlmZiwgY29uc3RyYWludDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0a2V5ID0ga2V5c1tpXTtcblx0XHRjb25zdHJhaW50ID0gdGhpc1trZXldO1xuXHRcdGVuc3VyZS50aGF0KGNvbnN0cmFpbnQgIT09IHVuZGVmaW5lZCwgXCInXCIgKyBrZXkgKyBcIicgaXMgdW5rbm93biBhbmQgY2FuJ3QgYmUgdXNlZCB3aXRoIGRpZmYoKVwiKTtcblx0XHRvbmVEaWZmID0gY29uc3RyYWludC5kaWZmKGV4cGVjdGVkW2tleV0pO1xuXHRcdGlmIChvbmVEaWZmICE9PSBcIlwiKSByZXN1bHQucHVzaChvbmVEaWZmKTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQuam9pbihcIlxcblwiKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdTdHlsZSA9IGZ1bmN0aW9uIGdldFJhd1N0eWxlKHN0eWxlTmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcgXSk7XG5cblx0dmFyIHN0eWxlcztcblx0dmFyIHJlc3VsdDtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIGdldENvbXB1dGVkU3R5bGUoKVxuXHRpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcblx0XHRzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLl9kb21FbGVtZW50KTtcblx0XHRyZXN1bHQgPSBzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHN0eWxlcyA9IHRoaXMuX2RvbUVsZW1lbnQuY3VycmVudFN0eWxlO1xuXHRcdHJlc3VsdCA9IHN0eWxlc1tjYW1lbGNhc2Uoc3R5bGVOYW1lKV07XG5cdH1cblx0aWYgKHJlc3VsdCA9PT0gbnVsbCB8fCByZXN1bHQgPT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gXCJcIjtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdQb3NpdGlvbiA9IGZ1bmN0aW9uIGdldFJhd1Bvc2l0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gVGV4dFJlY3RhbmdsZS5oZWlnaHQgb3IgLndpZHRoXG5cdHZhciByZWN0ID0gdGhpcy5fZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0cmV0dXJuIHtcblx0XHRsZWZ0OiByZWN0LmxlZnQsXG5cdFx0cmlnaHQ6IHJlY3QucmlnaHQsXG5cdFx0d2lkdGg6IHJlY3Qud2lkdGggIT09IHVuZGVmaW5lZCA/IHJlY3Qud2lkdGggOiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LFxuXG5cdFx0dG9wOiByZWN0LnRvcCxcblx0XHRib3R0b206IHJlY3QuYm90dG9tLFxuXHRcdGhlaWdodDogcmVjdC5oZWlnaHQgIT09IHVuZGVmaW5lZCA/IHJlY3QuaGVpZ2h0IDogcmVjdC5ib3R0b20gLSByZWN0LnRvcFxuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLnRvRG9tRWxlbWVudCA9IGZ1bmN0aW9uIHRvRG9tRWxlbWVudCgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZGVzY3JpcHRpb24gPSBmdW5jdGlvbiBkZXNjcmlwdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX25pY2tuYW1lO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiBcIidcIiArIHRoaXMuX25pY2tuYW1lICsgXCInXCI7XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50ID09PSB0aGF0Ll9kb21FbGVtZW50O1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIEZyYW1lID0gcmVxdWlyZShcIi4vZnJhbWUuanNcIik7XG5cbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuXHRyZXR1cm4gRnJhbWUuY3JlYXRlKGRvY3VtZW50LmJvZHksIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBTZWUgTElDRU5TRS5UWFQgZm9yIGRldGFpbHMuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gUnVudGltZSBhc3NlcnRpb25zIGZvciBwcm9kdWN0aW9uIGNvZGUuIChDb250cmFzdCB0byBhc3NlcnQuanMsIHdoaWNoIGlzIGZvciB0ZXN0IGNvZGUuKVxuXG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG5cbmV4cG9ydHMudGhhdCA9IGZ1bmN0aW9uKHZhcmlhYmxlLCBtZXNzYWdlKSB7XG5cdGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIG1lc3NhZ2UgPSBcIkV4cGVjdGVkIGNvbmRpdGlvbiB0byBiZSB0cnVlXCI7XG5cblx0aWYgKHZhcmlhYmxlID09PSBmYWxzZSkgdGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnRoYXQsIG1lc3NhZ2UpO1xuXHRpZiAodmFyaWFibGUgIT09IHRydWUpIHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy50aGF0LCBcIkV4cGVjdGVkIGNvbmRpdGlvbiB0byBiZSB0cnVlIG9yIGZhbHNlXCIpO1xufTtcblxuZXhwb3J0cy51bnJlYWNoYWJsZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0aWYgKCFtZXNzYWdlKSBtZXNzYWdlID0gXCJVbnJlYWNoYWJsZSBjb2RlIGV4ZWN1dGVkXCI7XG5cblx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnVucmVhY2hhYmxlLCBtZXNzYWdlKTtcbn07XG5cbmV4cG9ydHMuc2lnbmF0dXJlID0gZnVuY3Rpb24oYXJncywgc2lnbmF0dXJlKSB7XG5cdHNpZ25hdHVyZSA9IHNpZ25hdHVyZSB8fCBbXTtcblx0dmFyIGV4cGVjdGVkQXJnQ291bnQgPSBzaWduYXR1cmUubGVuZ3RoO1xuXHR2YXIgYWN0dWFsQXJnQ291bnQgPSBhcmdzLmxlbmd0aDtcblxuXHRpZiAoYWN0dWFsQXJnQ291bnQgPiBleHBlY3RlZEFyZ0NvdW50KSB7XG5cdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihcblx0XHRcdGV4cG9ydHMuc2lnbmF0dXJlLFxuXHRcdFx0XCJGdW5jdGlvbiBjYWxsZWQgd2l0aCB0b28gbWFueSBhcmd1bWVudHM6IGV4cGVjdGVkIFwiICsgZXhwZWN0ZWRBcmdDb3VudCArIFwiIGJ1dCBnb3QgXCIgKyBhY3R1YWxBcmdDb3VudFxuXHRcdCk7XG5cdH1cblxuXHR2YXIgdHlwZSwgYXJnLCBuYW1lO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xuXHRcdHR5cGUgPSBzaWduYXR1cmVbaV07XG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRuYW1lID0gXCJBcmd1bWVudCBcIiArIGk7XG5cblx0XHRpZiAoIXNoaW0uQXJyYXkuaXNBcnJheSh0eXBlKSkgdHlwZSA9IFsgdHlwZSBdO1xuXHRcdGlmICghdHlwZU1hdGNoZXModHlwZSwgYXJnLCBuYW1lKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihcblx0XHRcdFx0ZXhwb3J0cy5zaWduYXR1cmUsXG5cdFx0XHRcdG5hbWUgKyBcIiBleHBlY3RlZCBcIiArIGV4cGxhaW5UeXBlKHR5cGUpICsgXCIsIGJ1dCB3YXMgXCIgKyBleHBsYWluQXJnKGFyZylcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiB0eXBlTWF0Y2hlcyh0eXBlLCBhcmcpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKG9uZVR5cGVNYXRjaGVzKHR5cGVbaV0sIGFyZykpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcblxuXHRmdW5jdGlvbiBvbmVUeXBlTWF0Y2hlcyh0eXBlLCBhcmcpIHtcblx0XHRzd2l0Y2ggKGdldFR5cGUoYXJnKSkge1xuXHRcdFx0Y2FzZSBcImJvb2xlYW5cIjogcmV0dXJuIHR5cGUgPT09IEJvb2xlYW47XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHJldHVybiB0eXBlID09PSBTdHJpbmc7XG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiB0eXBlID09PSBOdW1iZXI7XG5cdFx0XHRjYXNlIFwiYXJyYXlcIjogcmV0dXJuIHR5cGUgPT09IEFycmF5O1xuXHRcdFx0Y2FzZSBcImZ1bmN0aW9uXCI6IHJldHVybiB0eXBlID09PSBGdW5jdGlvbjtcblx0XHRcdGNhc2UgXCJvYmplY3RcIjogcmV0dXJuIHR5cGUgPT09IE9iamVjdCB8fCBhcmcgaW5zdGFuY2VvZiB0eXBlO1xuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiByZXR1cm4gdHlwZSA9PT0gdW5kZWZpbmVkO1xuXHRcdFx0Y2FzZSBcIm51bGxcIjogcmV0dXJuIHR5cGUgPT09IG51bGw7XG5cdFx0XHRjYXNlIFwiTmFOXCI6IHJldHVybiBpc05hTih0eXBlKTtcblxuXHRcdFx0ZGVmYXVsdDogZXhwb3J0cy51bnJlYWNoYWJsZSgpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBleHBsYWluVHlwZSh0eXBlKSB7XG5cdHZhciBqb2luZXIgPSBcIlwiO1xuXHR2YXIgcmVzdWx0ID0gXCJcIjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0cmVzdWx0ICs9IGpvaW5lciArIGV4cGxhaW5PbmVUeXBlKHR5cGVbaV0pO1xuXHRcdGpvaW5lciA9IChpID09PSB0eXBlLmxlbmd0aCAtIDIpID8gXCIsIG9yIFwiIDogXCIsIFwiO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG5cblx0ZnVuY3Rpb24gZXhwbGFpbk9uZVR5cGUodHlwZSkge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBCb29sZWFuOiByZXR1cm4gXCJib29sZWFuXCI7XG5cdFx0XHRjYXNlIFN0cmluZzogcmV0dXJuIFwic3RyaW5nXCI7XG5cdFx0XHRjYXNlIE51bWJlcjogcmV0dXJuIFwibnVtYmVyXCI7XG5cdFx0XHRjYXNlIEFycmF5OiByZXR1cm4gXCJhcnJheVwiO1xuXHRcdFx0Y2FzZSBGdW5jdGlvbjogcmV0dXJuIFwiZnVuY3Rpb25cIjtcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIFwibnVsbFwiO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHR5cGUpKSByZXR1cm4gXCJOYU5cIjtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZSh0eXBlKSArIFwiIGluc3RhbmNlXCI7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhwbGFpbkFyZyhhcmcpIHtcblx0dmFyIHR5cGUgPSBnZXRUeXBlKGFyZyk7XG5cdGlmICh0eXBlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdHlwZTtcblxuXHR2YXIgcHJvdG90eXBlID0gc2hpbS5PYmplY3QuZ2V0UHJvdG90eXBlT2YoYXJnKTtcblx0aWYgKHByb3RvdHlwZSA9PT0gbnVsbCkgcmV0dXJuIFwiYW4gb2JqZWN0IHdpdGhvdXQgYSBwcm90b3R5cGVcIjtcblx0ZWxzZSB7XG5cdFx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZShwcm90b3R5cGUuY29uc3RydWN0b3IpICsgXCIgaW5zdGFuY2VcIjtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRUeXBlKHZhcmlhYmxlKSB7XG5cdHZhciB0eXBlID0gdHlwZW9mIHZhcmlhYmxlO1xuXHRpZiAodmFyaWFibGUgPT09IG51bGwpIHR5cGUgPSBcIm51bGxcIjtcblx0aWYgKHNoaW0uQXJyYXkuaXNBcnJheSh2YXJpYWJsZSkpIHR5cGUgPSBcImFycmF5XCI7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHZhcmlhYmxlKSkgdHlwZSA9IFwiTmFOXCI7XG5cdHJldHVybiB0eXBlO1xufVxuXG5cbi8qKioqKi9cblxudmFyIEVuc3VyZUV4Y2VwdGlvbiA9IGV4cG9ydHMuRW5zdXJlRXhjZXB0aW9uID0gZnVuY3Rpb24oZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlLCBtZXNzYWdlKSB7XG5cdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlKTtcblx0ZWxzZSB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjaztcblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn07XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5zdXJlRXhjZXB0aW9uO1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZS5uYW1lID0gXCJFbnN1cmVFeGNlcHRpb25cIjtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5PYmplY3QgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBPYmplY3QuY3JlYXRlKClcblx0Y3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUocHJvdG90eXBlKSB7XG5cdFx0aWYgKE9iamVjdC5jcmVhdGUpIHJldHVybiBPYmplY3QuY3JlYXRlKHByb3RvdHlwZSk7XG5cblx0XHR2YXIgVGVtcCA9IGZ1bmN0aW9uIFRlbXAoKSB7fTtcblx0XHRUZW1wLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcblx0XHRyZXR1cm4gbmV3IFRlbXAoKTtcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5nZXRQcm90b3R5cGVPZlxuXHRnZXRQcm90b3R5cGVPZjogZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2Yob2JqKSB7XG5cdFx0aWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZikgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuXG5cdFx0dmFyIHJlc3VsdCA9IG9iai5jb25zdHJ1Y3RvciA/IG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgOiBudWxsO1xuXHRcdHJldHVybiByZXN1bHQgfHwgbnVsbDtcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIE9iamVjdC5rZXlzXG5cdGtleXM6IGZ1bmN0aW9uIGtleXMob2JqKSB7XG5cdFx0aWYgKE9iamVjdC5rZXlzKSByZXR1cm4gT2JqZWN0LmtleXMob2JqKTtcblxuXHRcdC8vIEZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2tleXNcblx0ICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuXHQgICAgICBoYXNEb250RW51bUJ1ZyA9ICEoeyB0b1N0cmluZzogbnVsbCB9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKSxcblx0ICAgICAgZG9udEVudW1zID0gW1xuXHQgICAgICAgICd0b1N0cmluZycsXG5cdCAgICAgICAgJ3RvTG9jYWxlU3RyaW5nJyxcblx0ICAgICAgICAndmFsdWVPZicsXG5cdCAgICAgICAgJ2hhc093blByb3BlcnR5Jyxcblx0ICAgICAgICAnaXNQcm90b3R5cGVPZicsXG5cdCAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcblx0ICAgICAgICAnY29uc3RydWN0b3InXG5cdCAgICAgIF0sXG5cdCAgICAgIGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cblx0ICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgKHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicgfHwgb2JqID09PSBudWxsKSkge1xuXHQgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIG5vbi1vYmplY3QnKTtcblx0ICB9XG5cblx0ICB2YXIgcmVzdWx0ID0gW10sIHByb3AsIGk7XG5cblx0ICBmb3IgKHByb3AgaW4gb2JqKSB7XG5cdCAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG5cdCAgICAgIHJlc3VsdC5wdXNoKHByb3ApO1xuXHQgICAgfVxuXHQgIH1cblxuXHQgIGlmIChoYXNEb250RW51bUJ1Zykge1xuXHQgICAgZm9yIChpID0gMDsgaSA8IGRvbnRFbnVtc0xlbmd0aDsgaSsrKSB7XG5cdCAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZG9udEVudW1zW2ldKSkge1xuXHQgICAgICAgIHJlc3VsdC5wdXNoKGRvbnRFbnVtc1tpXSk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdCAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuRnVuY3Rpb24gPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4LCBJRSA5LCBJRSAxMCwgSUUgMTE6IG5vIGZ1bmN0aW9uLm5hbWVcblx0bmFtZTogZnVuY3Rpb24gbmFtZShmbikge1xuXHRcdGlmIChmbi5uYW1lKSByZXR1cm4gZm4ubmFtZTtcblxuXHRcdC8vIEJhc2VkIG9uIGNvZGUgYnkgSmFzb24gQnVudGluZyBldCBhbCwgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzMyNDI5XG5cdFx0dmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMrKC57MSx9KVxccypcXCgvO1xuXHRcdHZhciByZXN1bHRzID0gKGZ1bmNOYW1lUmVnZXgpLmV4ZWMoKGZuKS50b1N0cmluZygpKTtcblx0XHRyZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0gOiBcIjxhbm9uPlwiO1xuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5BcnJheSA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmlzQXJyYXlcblx0aXNBcnJheTogZnVuY3Rpb24gaXNBcnJheSh0aGluZykge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KSByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGluZyk7XG5cblx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaW5nKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmZvckVhY2hcblx0Zm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChvYmosIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG5cdFx0Lypqc2hpbnQgYml0d2lzZTpmYWxzZSwgZXFlcWVxOmZhbHNlLCAtVzA0MTpmYWxzZSAqL1xuXG5cdFx0aWYgKEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSByZXR1cm4gb2JqLmZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpO1xuXG5cdFx0Ly8gVGhpcyB3b3JrYXJvdW5kIGJhc2VkIG9uIHBvbHlmaWxsIGNvZGUgZnJvbSBNRE46XG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZm9yRWFjaFxuXG5cdFx0Ly8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA1LCAxNS40LjQuMThcblx0XHQvLyBSZWZlcmVuY2U6IGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuNC40LjE4XG5cbiAgICB2YXIgVCwgaztcblxuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIC8vIDEuIExldCBPIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyBUb09iamVjdCBwYXNzaW5nIHRoZSB8dGhpc3wgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxuICAgIHZhciBPID0gT2JqZWN0KG9iaik7XG5cbiAgICAvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICAvLyAzLiBMZXQgbGVuIGJlIFRvVWludDMyKGxlblZhbHVlKS5cbiAgICB2YXIgbGVuID0gTy5sZW5ndGggPj4+IDA7XG5cbiAgICAvLyA0LiBJZiBJc0NhbGxhYmxlKGNhbGxiYWNrKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgIC8vIFNlZTogaHR0cDovL2VzNS5naXRodWIuY29tLyN4OS4xMVxuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihjYWxsYmFjayArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICAvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBUID0gdGhpc0FyZztcbiAgICB9XG5cbiAgICAvLyA2LiBMZXQgayBiZSAwXG4gICAgayA9IDA7XG5cbiAgICAvLyA3LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW5cbiAgICB3aGlsZSAoayA8IGxlbikge1xuXG4gICAgICB2YXIga1ZhbHVlO1xuXG4gICAgICAvLyBhLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAvLyAgIFRoaXMgaXMgaW1wbGljaXQgZm9yIExIUyBvcGVyYW5kcyBvZiB0aGUgaW4gb3BlcmF0b3JcbiAgICAgIC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEhhc1Byb3BlcnR5IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG4gICAgICAvLyAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXG4gICAgICAvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXG4gICAgICBpZiAoayBpbiBPKSB7XG5cbiAgICAgICAgLy8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICBrVmFsdWUgPSBPW2tdO1xuXG4gICAgICAgIC8vIGlpLiBDYWxsIHRoZSBDYWxsIGludGVybmFsIG1ldGhvZCBvZiBjYWxsYmFjayB3aXRoIFQgYXMgdGhlIHRoaXMgdmFsdWUgYW5kXG4gICAgICAgIC8vIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxuICAgICAgICBjYWxsYmFjay5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG4gICAgICB9XG4gICAgICAvLyBkLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICBrKys7XG4gICAgfVxuICAgIC8vIDguIHJldHVybiB1bmRlZmluZWRcblx0fVxuXG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBvc2l0aW9uKGRpbWVuc2lvbiwgdmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBOdW1iZXIgXSk7XG5cblx0dGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xufTtcblxuTWUueCA9IGZ1bmN0aW9uIHgodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBNZShYX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUueSA9IGZ1bmN0aW9uIHkodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBNZShZX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIgXSk7XG5cblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3Bvc2l0aW9uICsgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRlbnN1cmUudGhhdCh0aGlzLl9kaW1lbnNpb24gPT09IGV4cGVjdGVkLl9kaW1lbnNpb24sIFwiQ2FuJ3QgY29tcGFyZSBYIGRpbWVuc2lvbiB0byBZIGRpbWVuc2lvblwiKTtcblxuXHR2YXIgYWN0dWFsVmFsdWUgPSB0aGlzLl9wb3NpdGlvbjtcblx0dmFyIGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC5fcG9zaXRpb247XG5cblx0dmFyIGRpcmVjdGlvbjtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIGRpcmVjdGlvbiA9IGV4cGVjdGVkVmFsdWUgPiBhY3R1YWxWYWx1ZSA/IFwidG8gdGhlIGxlZnRcIiA6IFwidG8gdGhlIHJpZ2h0XCI7XG5cdGVsc2UgZGlyZWN0aW9uID0gZXhwZWN0ZWRWYWx1ZSA+IGFjdHVhbFZhbHVlID8gXCJsb3dlclwiIDogXCJoaWdoZXJcIjtcblxuXHR2YXIgdmFsdWUgPSBNYXRoLmFicyhleHBlY3RlZFZhbHVlIC0gYWN0dWFsVmFsdWUpO1xuXHRpZiAodmFsdWUgPT09IDApIHJldHVybiBcIlwiO1xuXHRlbHNlIHJldHVybiB2YWx1ZSArIFwicHggXCIgKyBkaXJlY3Rpb247XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cblx0cmV0dXJuICh0aGlzLmRpZmYodGhhdCkgPT09IFwiXCIpO1xufTtcblxuTWUucHJvdG90eXBlLmRlc2NyaWJlTWF0Y2ggPSBmdW5jdGlvbiBkZXNjcmliZU1hdGNoKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiBcImJlIFwiICsgdGhpcztcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzLl9wb3NpdGlvbiArIFwicHhcIjtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZSh2YWx1ZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIgXSk7XG5cdGVuc3VyZS50aGF0KHZhbHVlID49IDAsIFwiRG9lc24ndCBtYWtlIHNlbnNlIHRvIGhhdmUgbmVnYXRpdmUgc2l6ZSwgYnV0IGdvdCBcIiArIHZhbHVlKTtcblxuXHR0aGlzLl92YWx1ZSA9IHZhbHVlO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXG5cdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMuX3ZhbHVlO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLl92YWx1ZTtcblxuXHR2YXIgZGVzYyA9IGFjdHVhbFZhbHVlID4gZXhwZWN0ZWRWYWx1ZSA/IFwicHggbGFyZ2VyXCIgOiBcInB4IHNtYWxsZXJcIjtcblx0cmV0dXJuIE1hdGguYWJzKGFjdHVhbFZhbHVlIC0gZXhwZWN0ZWRWYWx1ZSkgKyBkZXNjO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHRoYXQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cblx0cmV0dXJuIHRoaXMuX3ZhbHVlID09PSB0aGF0Ll92YWx1ZTtcbn07XG5cbk1lLnByb3RvdHlwZS5kZXNjcmliZU1hdGNoID0gZnVuY3Rpb24gZGVzY3JpYmVNYXRjaCgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gXCJiZSBcIiArIHRoaXM7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fdmFsdWUgKyBcInB4XCI7XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAoc3RyLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRyZXR1cm4gc3RyXG5cdC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpXG5cdC50b0xvd2VyQ2FzZSgpXG5cdC5yZXBsYWNlKC9bXy5cXC0gXSsoXFx3fCQpL2csIGZ1bmN0aW9uIChtLCBwMSkge1xuXHRcdHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuXHR9KTtcbn07XG4iXX0=
