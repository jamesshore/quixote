(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.quixote = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var oop = require("./util/oop.js");
var shim = require("./util/shim.js");

var Me = module.exports = function Assertable() {
	ensure.unreachable("Assertable is abstract and should not be constructed directly.");
};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, []);

Me.prototype.assert = function assert(expected, message) {
	ensure.signature(arguments, [ Object, [undefined, String] ]);
	if (message === undefined) message = "Differences found";

	var diff = this.diff(expected);
	if (diff !== "") throw new Error(message + ":\n" + diff + "\n");
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Object ]);

	var result = [];
	var keys = shim.Object.keys(expected);
	var key, oneDiff, descriptor;
	for (var i = 0; i < keys.length; i++) {
		key = keys[i];
		descriptor = this[key];
		ensure.that(
				descriptor !== undefined,
				this + " doesn't have a property named '" + key + "'. Did you misspell it?"
		);
		oneDiff = descriptor.diff(expected[key]);
		if (oneDiff !== "") result.push(oneDiff);
	}

	return result.join("\n");
};

},{"./util/ensure.js":26,"./util/oop.js":27,"./util/shim.js":28}],4:[function(require,module,exports){
// Copyright Titanium I.T. LLC.
"use strict";

var ensure = require("./util/ensure.js");
var QFrame = require("./q_frame.js");
var Size = require("./values/size.js");

var FRAME_WIDTH = 1500;
var FRAME_HEIGHT = 200;

var features = null;

exports.enlargesFrameToPageSize = createDetectionMethod("enlargesFrame");
exports.enlargesFonts = createDetectionMethod("enlargesFonts");
exports.misreportsClipAutoProperty = createDetectionMethod("misreportsClipAuto");
exports.misreportsAutoValuesInClipProperty = createDetectionMethod("misreportsClipValues");
exports.roundsOffPixelCalculations = createDetectionMethod("roundsOffPixelCalculations");

exports.detectBrowserFeatures = function(callback) {
	var frame = QFrame.create(document.body, { width: FRAME_WIDTH, height: FRAME_HEIGHT }, function(err) {
		if (err) {
			return callback(new Error("Error while creating Quixote browser feature detection frame: " + err));
		}
		return detectFeatures(frame, function(err) {
			frame.remove();
			return callback(err);
		});
	});
};

function detectFeatures(frame, callback) {
	try {
		features = {};
		features.enlargesFrame = detectFrameEnlargement(frame, FRAME_WIDTH);
		features.misreportsClipAuto = detectReportedClipAuto(frame);
		features.misreportsClipValues = detectReportedClipPropertyValues(frame);
		features.roundsOffPixelCalculations = detectRoundsOffPixelCalculations(frame);

		detectFontEnlargement(frame, FRAME_WIDTH, function(result) {
			features.enlargesFonts = result;
			frame.remove();
			return callback(null);
		});

	}
	catch(err) {
		features = null;
		return callback(new Error("Error during Quixote browser feature detection: " + err));
	}
}

function createDetectionMethod(propertyName) {
	return function() {
		ensure.signature(arguments, []);
		ensure.that(
			features !== null,
			"Must call quixote.createFrame() before using Quixote browser feature detection."
		);

		return features[propertyName];
	};
}

function detectFrameEnlargement(frame, frameWidth) {
	frame.reset();

	frame.add("<div style='width: " + (frameWidth + 200) + "px'>force scrolling</div>");
	return !frame.viewport().width.value().equals(Size.create(frameWidth));
}

function detectReportedClipAuto(frame) {
	frame.reset();

	var element = frame.add("<div style='clip: auto;'></div>");
	var clip = element.getRawStyle("clip");

	return clip !== "auto";
}

function detectReportedClipPropertyValues(frame) {
	frame.reset();

	var element = frame.add("<div style='clip: rect(auto, auto, auto, auto);'></div>");
	var clip = element.getRawStyle("clip");

	// WORKAROUND IE 8: Provides 'clipTop' etc. instead of 'clip' property
	if (clip === "" && element.getRawStyle("clip-top") === "auto") return false;

	return clip !== "rect(auto, auto, auto, auto)" && clip !== "rect(auto auto auto auto)";
}

function detectRoundsOffPixelCalculations(frame) {
	var element = frame.add("<div style='font-size: 15px;'></div>");
	var size = element.calculatePixelValue("0.5em");

	if (size === 7.5) return false;
	if (size === 8) return true;
	ensure.unreachable("Failure in roundsOffPixelValues() detection: expected 7.5 or 8, but got " + size);
}

function detectFontEnlargement(frame, frameWidth, callback) {
	ensure.that(frameWidth >= 1500, "Detector frame width must be larger than screen to detect font enlargement");
	frame.reset();

	// WORKAROUND IE 8: we use a <div> because the <style> tag can't be added by frame.add(). At the time of this
	// writing, I'm not sure if the issue is with frame.add() or if IE just can't programmatically add <style> tags.
	frame.add("<div><style>p { font-size: 15px; }</style></div>");

	var text = frame.add("<p>arbitrary text</p>");
	frame.add("<p>must have two p tags to work</p>");

	// WORKAROUND IE 8: need to force reflow or getting font-size may fail below
	// This seems to occur when IE is running in a slow VirtualBox VM. There is no test for this line.
	frame.forceReflow();

	// WORKAROUND Safari 8.0.0: timeout required because font is enlarged asynchronously
	setTimeout(function() {
		var fontSize = text.getRawStyle("font-size");
		ensure.that(fontSize !== "", "Expected font-size to be a value");

		// WORKAROUND IE 8: ignores <style> tag we added above
		if (fontSize === "12pt") return callback(false);

		return callback(fontSize !== "15px");
	}, 0);
}

},{"./q_frame.js":22,"./util/ensure.js":26,"./values/size.js":32}],5:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var QElement = require("./q_element.js");
var QElementList = require("./q_element_list.js");
var QViewport = require("./q_viewport.js");
var QPage = require("./q_page.js");

var Me = module.exports = function BrowsingContext(contentDocument) {
	ensure.signature(arguments, [Object]);

	this.contentWindow = contentDocument.defaultView || contentDocument.parentWindow;
	this.contentDocument = contentDocument;
};

Me.prototype.body = function body() {
	ensure.signature(arguments, []);

	return QElement.create(this.contentDocument.body, "<body>");
};

Me.prototype.viewport = function viewport() {
	ensure.signature(arguments, []);

	return new QViewport(this);
};

Me.prototype.page = function page() {
	ensure.signature(arguments, []);

	return new QPage(this);
};

Me.prototype.add = function add(html, nickname) {
	ensure.signature(arguments, [String, [undefined, String]]);
	return this.body().add(html, nickname);
};

Me.prototype.get = function get(selector, nickname) {
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = selector;

	var nodes = this.contentDocument.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return QElement.create(nodes[0], nickname);
};

Me.prototype.getAll = function getAll(selector, nickname) {
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = selector;

	return new QElementList(this.contentDocument.querySelectorAll(selector), nickname);
};

Me.prototype.scroll = function scroll(x, y) {
	ensure.signature(arguments, [Number, Number]);

	this.contentWindow.scroll(x, y);
};

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
	ensure.signature(arguments, []);

	return {
		x: shim.Window.pageXOffset(this.contentWindow, this.contentDocument),
		y: shim.Window.pageYOffset(this.contentWindow, this.contentDocument)
	};
};

// This method is not tested--don't know how.
Me.prototype.forceReflow = function forceReflow() {
	this.body().toDomElement().offsetTop;
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [Me]);
	return this.contentWindow === that.contentWindow;
};

},{"./q_element.js":20,"./q_element_list.js":21,"./q_page.js":23,"./q_viewport.js":24,"./util/ensure.js":26,"./util/shim.js":28}],6:[function(require,module,exports){
// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function AbsolutePosition(dimension, value) {
  ensure.signature(arguments, [ String, Number ]);

  this.should = this.createShould();

  switch(dimension) {
		case X_DIMENSION:
			PositionDescriptor.x(this);
			this._value = Position.x(value);
			break;
		case Y_DIMENSION:
			PositionDescriptor.y(this);
			this._value = Position.y(value);
			break;
		default: ensure.unreachable("Unknown dimension: " + dimension);
  }
  this._dimension = dimension;
};
PositionDescriptor.extend(Me);

Me.x = function(value) {
	ensure.signature(arguments, [ Number ]);
  return new Me(X_DIMENSION, value);
};

Me.y = function(value) {
	ensure.signature(arguments, [ Number ]);
	return new Me(Y_DIMENSION, value);
};

Me.prototype.value = function() {
  return this._value;
};

Me.prototype.toString = function() {
  return this._value + " " + this._dimension + "-coordinate";
};

},{"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":13}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Center(dimension, position1, position2, description) {
	ensure.signature(arguments, [ String, PositionDescriptor, PositionDescriptor, String ]);

	this.should = this.createShould();
	
	if (dimension === X_DIMENSION) PositionDescriptor.x(this);
	else if (dimension === Y_DIMENSION) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown dimension: " + dimension);

	this._dimension = dimension;
	this._position1 = position1;
	this._position2 = position2;
	this._description = description;
};
PositionDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);
	return this._position1.value().midpoint(this._position2.value());
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._description;
};

function factoryFn(dimension) {
	return function(position1, position2, description) {
		return new Me(dimension, position1, position2, description);
	};
}

},{"../util/ensure.js":26,"./position_descriptor.js":13}],8:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Value = require("../values/value.js");

var Me = module.exports = function Descriptor() {
	ensure.unreachable("Descriptor is abstract and should not be constructed directly.");
};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"value",
	"toString"
]);

// WORKAROUND IE 8: Doesn't support Object.defineProperty(), which would allow us to create Me.prototype.should
// directly on this class as an accessor method.
// WORKAROUND IE 11: Doesn't support ES6 'class' syntax, which would allow us to use getter methods and inheritance.
Me.prototype.createShould = function createAssert() {
	var self = this;
	return {

		equal: function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				if (!actualValue.equals(expectedValue)) {
					return message + self + " should be " + expectedValue.diff(actualValue) + ".\n" +
						"  Expected: " + expectedDesc + "\n" +
						"  But was:  " + actualValue;
				}
			});
		},

		notEqual: function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				if (actualValue.equals(expectedValue)) {
					return message + self + " shouldn't be " + expectedValue + ".\n" +
						"  Expected: anything but " + expectedDesc + "\n" +
						"  But was:  " + actualValue;
				}
			});
		},

	};
};

Me.prototype.doAssertion = function doAssertion(expected, message, assertFn) {
	message = message === undefined ? "" : message + ": ";
	expected = convertPrimitiveExpectationToValueObjectIfNeeded(this, expected, message);

	var actualValue;
	var expectedValue;
	try {
		actualValue = this.value();
		expectedValue = expected.value();
	}
	catch (err) {
		throw new Error(
			message + "Error in test. Unable to convert descriptors to values.\n" +
			"Error message: " + err.message + "\n" +
			"  'actual' descriptor:   " + this + " (" + oop.instanceName(this) + ")\n" +
			"  'expected' descriptor: " + expected + " (" + oop.instanceName(expected) + ")\n" +
			"If this error is unclear or you think Quixote is at fault, please open\n" +
			"an issue at https://github.com/jamesshore/quixote/issues. Include this\n" +
			"error message and a standalone example test that reproduces the error.\n" +
			"Error stack trace:\n" +
			err.stack
		);
	}

	if (!actualValue.isCompatibleWith(expectedValue)) {
		throwBadExpectation(
			this, oop.instanceName(expected) + " (" + expected + ")", message,
			"Attempted to compare two incompatible types:"
		);
	}

	var expectedDesc = expectedValue.toString();
	if (expected instanceof Me) expectedDesc += " (" + expected + ")";

	var failure;
	try {
		failure = assertFn(actualValue, expectedValue, expectedDesc, message);
	}
	catch (err2) {
		throw new Error(
			message + "Error in test. Unable to perform assertion.\n" +
			"Error message: " + err2.message + "\n" +
			"  'actual' descriptor:   " + this + " (" + oop.instanceName(this) + ")\n" +
			"  'expected' descriptor: " + expected + " (" + oop.instanceName(expected) + ")\n" +
			"  'actual' value:   " + actualValue + " (" + oop.instanceName(actualValue) + ")\n" +
			"  'expected' value: " + expectedValue + " (" + oop.instanceName(expectedValue) + ")\n" +
			"If this error is unclear or you think Quixote is at fault, please open\n" +
			"an issue at https://github.com/jamesshore/quixote/issues. Include this\n" +
			"error message and a standalone example test that reproduces the error.\n"
		);
	}
	if (failure !== undefined) throw new Error(failure);
};


Me.prototype.diff = function diff(expected) {
	// Legacy code, strictly for compatibility with deprecated Assertable.equals() and Assertable.diff() methods.
	// It's weird because we moved to should.equals(), which always throws an exception, but diff returns a string.
	// To avoid duplicating complex logic, we call should.equals() and then unwrap the exception, but only if it's
	// the right kind of exception.
	try {
		this.should.equal(expected);
		return "";
	}
	catch (err) {
		var message = err.message;
		if (message.indexOf("But was:") === -1) throw err;    // it's not an assertion error, it's some other exception
		return message;
	}
};

Me.prototype.convert = function convert(arg, type) {
	// This method is meant to be overridden by subclasses. It should return 'undefined' when an argument
	// can't be converted. In this default implementation, no arguments can be converted, so we always
	// return 'undefined'.
	return undefined;
};

Me.prototype.equals = function equals(that) {
	// Descriptors aren't value objects. They're never equal to anything. But sometimes
	// they're used in the same places value objects are used, and then this method gets called.
	return false;
};

function convertPrimitiveExpectationToValueObjectIfNeeded(self, expected, message) {
	var expectedType = typeof expected;
	if (expected === null) expectedType = "null";

	if (expectedType === "object" && (expected instanceof Me)) return expected;

	if (expected === undefined) {
		throwBadExpectation(
			self, "undefined", message,
			"The 'expected' parameter is undefined. Did you misspell a property name?"
		);
	}
	else if (expectedType === "object") {
		throwBadExpectation(
			self, oop.instanceName(expected), message,
			"The 'expected' parameter should be a descriptor, but it wasn't recognized."
		);
	}
	else {
		var converted = self.convert(expected, expectedType);
		if (converted !== undefined) return converted;

		throwBadExpectation(
			self, expectedType, message,
			"The 'expected' primitive isn't equivalent to the 'actual' descriptor."
		);
	}
}

function throwBadExpectation(self, expectedType, message, headline) {
	throw new Error(
		message + "Error in test. Use a different 'expected' parameter.\n" +
		headline + "\n" +
		"  'actual' type:   " + oop.instanceName(self) + " (" + self + ")\n" +
		"  'expected' type: " + expectedType
	);
}
},{"../util/ensure.js":26,"../util/oop.js":27,"../values/value.js":33}],9:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var PositionDescriptor = require("./position_descriptor.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [QElement, String]);

	this.should = this.createShould();

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._element = element;
	this._position = position;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var rawPosition = this._element.getRawPosition();
	var edge = rawPosition[this._position];

	var scroll = this._element.context().getRawScrollPosition();
	var rendered = elementRendered(this._element);

	if (this._position === RIGHT || this._position === LEFT) {
		if (!rendered) return Position.noX();
		return Position.x(edge + scroll.x);
	}
	else {
		if (!rendered) return Position.noY();
		return Position.y(edge + scroll.y);
	}
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._position + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function elementRendered(element) {
	var inDom = element.context().body().contains(element);
	var displayNone = element.getRawStyle("display") === "none";

	return inDom && !displayNone;
}

},{"../q_element.js":20,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":13}],10:[function(require,module,exports){
// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var RenderState = require("../values/render_state.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var ElementRenderedEdge = require("./element_rendered_edge.js");
var Span = require("./span.js");
var Center = require("./center.js");

var Me = module.exports = function ElementRendered(element) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement ]);

	this.should = this.createShould();
	this._element = element;

	// properties
	this.top = ElementRenderedEdge.top(element);
	this.right = ElementRenderedEdge.right(element);
	this.bottom = ElementRenderedEdge.bottom(element);
	this.left = ElementRenderedEdge.left(element);

	this.width = Span.create(this.left, this.right, "rendered width of " + element);
	this.height = Span.create(this.top, this.bottom, "rendered height of " + element);

	this.center = Center.x(this.left, this.right, "rendered center of " + element);
	this.middle = Center.y(this.top, this.bottom, "rendered middle of " + element);
};
Descriptor.extend(Me);

Me.create = function create(element) {
	return new Me(element);
};

Me.prototype.value = function value() {
	if (this.top.value().equals(Position.noY())) return RenderState.notRendered();
	else return RenderState.rendered();
};

Me.prototype.toString = function toString() {
	return this._element.toString() + " rendering";
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "boolean") {
		return arg ? RenderState.rendered() : RenderState.notRendered();
	}
};

},{"../q_element.js":20,"../util/ensure.js":26,"../values/position.js":30,"../values/render_state.js":31,"./center.js":7,"./descriptor.js":8,"./element_rendered_edge.js":11,"./span.js":18}],11:[function(require,module,exports){
// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var quixote = require("../quixote.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var QPage = require("../q_page.js");
var Size = require("../values/size.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementVisibleEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement, String ]);

	this.should = this.createShould();

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else unknownPosition(position);

	this._element = element;
	this._position = position;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._position + " rendered edge of " + this._element;
};

Me.prototype.value = function() {
	var position = this._position;
	var element = this._element;
	var page = element.context().page();

	if (element.top.value().equals(Position.noY())) return notRendered(position);
	if (element.width.value().equals(Size.create(0))) return notRendered(position);
	if (element.height.value().equals(Size.create(0))) return notRendered(position);

	ensure.that(
		!hasClipPathProperty(element),
		"Can't determine element rendering because the element is affected by the 'clip-path' property, " +
		"which Quixote doesn't support."
	);

	var bounds = {
		top: page.top.value(),
		right: null,
		bottom: null,
		left: page.left.value()
	};

	bounds = intersectionWithOverflow(element, bounds);
	bounds = intersectionWithClip(element, bounds);

	var edges = intersection(
		bounds,
		element.top.value(),
		element.right.value(),
		element.bottom.value(),
		element.left.value()
	);

	if (isClippedOutOfExistence(bounds, edges)) return notRendered(position);
	else return edge(edges, position);
};

function hasClipPathProperty(element) {
	var clipPath = element.getRawStyle("clip-path");
	return clipPath !== "none" && clipPath !== "";
}

function intersectionWithOverflow(element, bounds) {
	for (var container = element.parent(); container !== null; container = container.parent()) {
		if (isClippedByAncestorOverflow(element, container)) {
			bounds = intersection(
				bounds,
				container.top.value(),
				container.right.value(),
				container.bottom.value(),
				container.left.value()
			);
		}
	}

	return bounds;
}

function intersectionWithClip(element, bounds) {
	// WORKAROUND IE 8: Doesn't have any way to detect 'clip: auto' value.
	ensure.that(!quixote.browser.misreportsClipAutoProperty(),
		"Can't determine element rendering on this browser because it misreports the value of the" +
		" `clip: auto` property. You can use `quixote.browser.misreportsClipAutoProperty()` to skip this browser."
	);

	for ( ; element !== null; element = element.parent()) {
		var clip = element.getRawStyle("clip");
		if (clip === "auto" || !canBeClippedByClipProperty(element)) continue;

		var clipEdges = normalizeClipProperty(element, clip);
		bounds = intersection(
			bounds,
			clipEdges.top,
			clipEdges.right,
			clipEdges.bottom,
			clipEdges.left
		);
	}

	return bounds;
}

function normalizeClipProperty(element, clip) {
	var clipValues = parseClipProperty(element, clip);

	return {
		top: clipValues[0] === "auto" ?
			element.top.value() :
			element.top.value().plus(Position.y(Number(clipValues[0]))),
		right: clipValues[1] === "auto" ?
			element.right.value() :
			element.left.value().plus(Position.x(Number(clipValues[1]))),
		bottom: clipValues[2] === "auto" ?
			element.bottom.value() :
			element.top.value().plus(Position.y(Number(clipValues[2]))),
		left: clipValues[3] === "auto" ?
			element.left.value() :
			element.left.value().plus(Position.x(Number(clipValues[3])))
	};

	function parseClipProperty(element, clip) {
		// WORKAROUND IE 11, Chrome Mobile 44: Reports 0px instead of 'auto' when computing rect() in clip property.
		ensure.that(!quixote.browser.misreportsAutoValuesInClipProperty(),
			"Can't determine element rendering on this browser because it misreports the value of the `clip`" +
			" property. You can use `quixote.browser.misreportsAutoValuesInClipProperty()` to skip this browser."
		);

		var clipRegex = /rect\((.*?),? (.*?),? (.*?),? (.*?)\)/;
		var matches = clipRegex.exec(clip);
		ensure.that(matches !== null, "Unable to parse clip property: " + clip);

		return [
			parseLength(matches[1], clip),
			parseLength(matches[2], clip),
			parseLength(matches[3], clip),
			parseLength(matches[4], clip)
		];
	}

	function parseLength(pxString, clip) {
		if (pxString === "auto") return pxString;

		var pxRegex = /^(.*?)px$/;
		var matches = pxRegex.exec(pxString);
		ensure.that(matches !== null, "Unable to parse '" + pxString + "' in clip property: " + clip);

		return matches[1];
	}
}

function isClippedByAncestorOverflow(element, ancestor) {
	return canBeClippedByOverflowProperty(element) && hasClippingOverflow(ancestor);
}

function canBeClippedByOverflowProperty(element) {
	var position = element.getRawStyle("position");
	switch (position) {
		case "static":
		case "relative":
		case "absolute":
		case "sticky":
			return true;
		case "fixed":
			return false;
		default:
			ensure.unreachable("Unknown position property: " + position);
	}
}

function hasClippingOverflow(element) {
	return clips("overflow-x") || clips("overflow-y");

	function clips(style) {
		var overflow = element.getRawStyle(style);
		switch (overflow) {
			case "hidden":
			case "scroll":
			case "auto":
				return true;
			case "visible":
				return false;
			default:
				ensure.unreachable("Unknown " + style + " property: " + overflow);
		}
	}
}

function canBeClippedByClipProperty(element) {
	var position = element.getRawStyle("position");
	switch (position) {
		case "absolute":
		case "fixed":
			return true;
		case "static":
		case "relative":
		case "sticky":
			return false;
		default:
			ensure.unreachable("Unknown position property: " + position);
	}
}

function intersection(bounds, top, right, bottom, left) {
	bounds.top = bounds.top.max(top);
	bounds.right = (bounds.right === null) ? right : bounds.right.min(right);
	bounds.bottom = (bounds.bottom === null) ? bottom : bounds.bottom.min(bottom);
	bounds.left = bounds.left.max(left);

	return bounds;
}

function isClippedOutOfExistence(bounds, edges) {
	return (bounds.top.compare(edges.bottom) >= 0) ||
		(bounds.right !== null && bounds.right.compare(edges.left) <= 0) ||
		(bounds.bottom !== null && bounds.bottom.compare(edges.top) <= 0) ||
		(bounds.left.compare(edges.right) >= 0);
}

function notRendered(position) {
	switch(position) {
		case TOP:
		case BOTTOM:
			return Position.noY();
		case LEFT:
		case RIGHT:
			return Position.noX();
		default: unknownPosition(position);
	}
}

function edge(edges, position) {
	switch(position) {
		case TOP: return edges.top;
		case RIGHT: return edges.right;
		case BOTTOM: return edges.bottom;
		case LEFT: return edges.left;
		default: unknownPosition(position);
	}
}

function unknownPosition(position) {
	ensure.unreachable("Unknown position: " + position);
}
},{"../q_element.js":20,"../q_page.js":23,"../quixote.js":25,"../util/ensure.js":26,"../values/position.js":30,"../values/size.js":32,"./position_descriptor.js":13}],12:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function PageEdge(edge, browsingContext) {
	var BrowsingContext = require("../browsing_context.js");   // break circular dependency
	ensure.signature(arguments, [ String, BrowsingContext ]);

	this.should = this.createShould();

	if (edge === LEFT || edge === RIGHT) PositionDescriptor.x(this);
	else if (edge === TOP || edge === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown edge: " + edge);

	this._edge = edge;
	this._browsingContext = browsingContext;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var size = pageSize(this._browsingContext.contentDocument);
	switch(this._edge) {
		case TOP: return Position.y(0);
		case RIGHT: return Position.x(size.width);
		case BOTTOM: return Position.y(size.height);
		case LEFT: return Position.x(0);

		default: ensure.unreachable();
	}
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	switch(this._edge) {
		case TOP: return "top of page";
		case RIGHT: return "right side of page";
		case BOTTOM: return "bottom of page";
		case LEFT: return "left side of page";

		default: ensure.unreachable();
	}
};

function factoryFn(edge) {
	return function factory(browsingContext) {
		return new Me(edge, browsingContext);
	};
}


// USEFUL READING: http://www.quirksmode.org/mobile/viewports.html
// and http://www.quirksmode.org/mobile/viewports2.html

// API SEMANTICS.
// Ref https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
//    getBoundingClientRect().width: sum of bounding boxes of element (the displayed width of the element,
//      including padding and border). Fractional. Applies transformations.
//    clientWidth: visible width of element including padding (but not border). EXCEPT on root element (html), where
//      it is the width of the viewport. Rounds to an integer. Doesn't apply transformations.
//    offsetWidth: visible width of element including padding, border, and scrollbars (if any). Rounds to an integer.
//      Doesn't apply transformations.
//    scrollWidth: entire width of element, including any part that's not visible due to scrollbars. Rounds to
//      an integer. Doesn't apply transformations. Not clear if it includes scrollbars, but I think not. Also
//      not clear if it includes borders or padding. (But from tests, apparently not borders. Except on root
//      element and body element, which have special results that vary by browser.)

// TEST RESULTS: WIDTH
//   ✔ = correct answer
//   ✘ = incorrect answer and diverges from spec
//   ~ = incorrect answer, but matches spec
// BROWSERS TESTED: Safari 6.2.0 (Mac OS X 10.8.5); Mobile Safari 7.0.0 (iOS 7.1); Firefox 32.0.0 (Mac OS X 10.8);
//    Firefox 33.0.0 (Windows 7); Chrome 38.0.2125 (Mac OS X 10.8.5); Chrome 38.0.2125 (Windows 7); IE 8, 9, 10, 11

// html width style smaller than viewport width; body width style smaller than html width style
//  NOTE: These tests were conducted when correct result was width of border. That has been changed
//  to "width of viewport."
//    html.getBoundingClientRect().width
//      ✘ IE 8, 9, 10: width of viewport
//      ✔ Safari, Mobile Safari, Chrome, Firefox, IE 11: width of html, including border
//    html.clientWidth
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of viewport
//    html.offsetWidth
//      ✘ IE 8, 9, 10: width of viewport
//      ✔ Safari, Mobile Safari, Chrome, Firefox, IE 11: width of html, including border
//    html.scrollWidth
//      ✘ IE 8, 9, 10, 11, Firefox: width of viewport
//      ~ Safari, Mobile Safari, Chrome: width of html, excluding border
//    body.getBoundingClientRect().width
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of body, including border
//    body.clientWidth
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of body, excluding border
//    body.offsetWidth
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of body, including border
//    body.scrollWidth
//      ✘ Safari, Mobile Safari, Chrome: width of viewport
//      ~ Firefox, IE 8, 9, 10, 11: width of body, excluding border

// element width style wider than viewport; body and html width styles at default
// BROWSER BEHAVIOR: html and body border extend to width of viewport and not beyond (except on Mobile Safari)
// Correct result is element width + body border-left + html border-left (except on Mobile Safari)
// Mobile Safari uses a layout viewport, so it's expected to include body border-right and html border-right.
//    html.getBoundingClientRect().width
//      ✔ Mobile Safari: element width + body border + html border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width
//    html.clientWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width
//    html.offsetWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width
//    html.scrollWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ✘ Safari, Chrome: element width + body border-left (BUT NOT html border-left)
//      ✔ Firefox, IE 8, 9, 10, 11: element width + body border-left + html border-left
//    body.getBoundingClientRect().width
//      ~ Mobile Safari: element width + body border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width - html border
//    body.clientWidth
//      ~ Mobile Safari: element width
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width - html border - body border
//    body.offsetWidth
//      ~ Mobile Safari: element width + body border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width - html border
//    body.scrollWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ✔ Safari, Chrome: element width + body border-left + html border-left (matches actual browser)
//      ~ Firefox, IE 8, 9, 10, 11: element width

// TEST RESULTS: HEIGHT
//   ✔ = correct answer
//   ✘ = incorrect answer and diverges from spec
//   ~ = incorrect answer, but matches spec

// html height style smaller than viewport height; body height style smaller than html height style
//  NOTE: These tests were conducted when correct result was height of viewport.
//    html.clientHeight
//      ✔ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: height of viewport

// element height style taller than viewport; body and html width styles at default
// BROWSER BEHAVIOR: html and body border enclose entire element
// Correct result is element width + body border-top + html border-top + body border-bottom + html border-bottom
//    html.clientHeight
//      ✔ Mobile Safari: element height + all borders
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: height of viewport
//    html.scrollHeight
//      ✔ Firefox, IE 8, 9, 10, 11: element height + all borders
//      ✘ Safari, Mobile Safari, Chrome: element height + html border-bottom
//    body.scrollHeight
//      ✔ Safari, Mobile Safari, Chrome: element height + all borders
//      ~ Firefox, IE 8, 9, 10, 11: element height (body height - body border)
function pageSize(document) {
	var html = document.documentElement;
	var body = document.body;

// BEST WIDTH ANSWER SO FAR (ASSUMING VIEWPORT IS MINIMUM ANSWER):
	var width = Math.max(body.scrollWidth, html.scrollWidth);

// BEST HEIGHT ANSWER SO FAR (ASSUMING VIEWPORT IS MINIMUM ANSWER):
	var height = Math.max(body.scrollHeight, html.scrollHeight);

	return {
		width: width,
		height: height
	};
}

},{"../browsing_context.js":5,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":13}],13:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint new-cap: "off" */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

// break circular dependencies
function RelativePosition() {
	return require("./relative_position.js");
}
function AbsolutePosition() {
	return require("./absolute_position.js");
}
function Span() {
	return require("./span.js");
}

var X_DIMENSION = "X";
var Y_DIMENSION = "Y";

var Me = module.exports = function PositionDescriptor(dimension) {
	ensure.signature(arguments, [ String ]);
	ensure.unreachable("PositionDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

function factoryFn(dimension) {
	return function factory(self) {
		// _pdbc: "PositionDescriptor base class." An attempt to prevent name conflicts.
		self._pdbc = { dimension: dimension };
	};
}

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.createShould = function() {
	var self = this;
	var noX = Position.noX();
	var noY = Position.noY();

	var should = Descriptor.prototype.createShould.call(this);
	should.beAbove = assertFn("beAbove", "beLeftOf", Y_DIMENSION, false);
	should.beBelow = assertFn("beBelow", "beRightOf", Y_DIMENSION, true);
	should.beLeftOf = assertFn("beLeftOf", "beAbove", X_DIMENSION, false);
	should.beRightOf = assertFn("beRightOf", "beBelow", X_DIMENSION, true);
	return should;

	function assertFn(functionName, otherAxisName, dimension, shouldBeBigger) {
		return function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				if (self._pdbc.dimension !== dimension) {
					throwCoordinateError(functionName, otherAxisName);
				}
				if (expectedValue.isNone()) {
					throw new Error("'expected' value is not rendered, so relative comparisons aren't possible.");
				}

				var expectedMsg = (shouldBeBigger ? "more than" : "less than") + " " + expectedDesc;

				if (actualValue.isNone()) {
					return errorMessage(message, "rendered", expectedMsg, actualValue);
				}

				var compare = actualValue.compare(expectedValue);
				if ((shouldBeBigger && compare <= 0) || (!shouldBeBigger && compare >= 0)) {
					var nudge = shouldBeBigger ? -1 : 1;
					var shouldBe = "at least " + expectedValue.diff(self.plus(nudge).value());
					return errorMessage(message, shouldBe, expectedMsg, actualValue);
				}
			});
		};
	}

	function throwCoordinateError(functionName, recommendedName) {
		throw new Error(
			"Can't use 'should." + functionName + "()' on " + self._pdbc.dimension +
			" coordinates. Did you mean 'should." + recommendedName + "()'?"
		);
	}

	function errorMessage(message, shouldBe, expected, actual) {
		return message + self + " should be " + shouldBe + ".\n" +
			"  Expected: " + expected + "\n" +
			"  But was:  " + actual;
	}
};

Me.prototype.plus = function(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().right(this, amount);
	else return RelativePosition().down(this, amount);
};

Me.prototype.minus = function(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().left(this, amount);
	else return RelativePosition().up(this, amount);
};

Me.prototype.to = function(position, nickname) {
	ensure.signature(arguments, [[ Me, Number ], [ undefined, String ]]);

	if (typeof position === "number") {
		if (this._pdbc.dimension === X_DIMENSION) position = AbsolutePosition().x(position);
		else position = AbsolutePosition().y(position);
	}
	if (this._pdbc.dimension !== position._pdbc.dimension) {
		throw new Error("Can't span between an X coordinate and a Y coordinate");
	}

	if (nickname === undefined) nickname = "span from " + this + " to " + position;
	return Span().create(this, position, nickname);
};

Me.prototype.convert = function(arg, type) {
	switch (type) {
		case "number": return this._pdbc.dimension === X_DIMENSION ? Position.x(arg) : Position.y(arg);
		case "string":
			if (arg === "none") return this._pdbc.dimension === X_DIMENSION ? Position.noX() : Position.noY();
			else return undefined;
			break;
		default: return undefined;
	}
};

},{"../util/ensure.js":26,"../util/oop.js":27,"../values/position.js":30,"./absolute_position.js":6,"./descriptor.js":8,"./relative_position.js":14,"./span.js":18}],14:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var PositionDescriptor = require("./position_descriptor.js");
var Value = require("../values/value.js");
var Size = require("../values/size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";
var PLUS = 1;
var MINUS = -1;

var Me = module.exports = function RelativePosition(dimension, direction, relativeTo, relativeAmount) {
	ensure.signature(arguments, [ String, Number, Descriptor, [Number, Descriptor, Value] ]);

	this.should = this.createShould();

	if (dimension === X_DIMENSION) PositionDescriptor.x(this);
	else if (dimension === Y_DIMENSION) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown dimension: " + dimension);

	this._dimension = dimension;
	this._direction = direction;
	this._relativeTo = relativeTo;

	if (typeof relativeAmount === "number") {
		if (relativeAmount < 0) this._direction *= -1;
		this._amount = Size.create(Math.abs(relativeAmount));
	}
	else {
		this._amount = relativeAmount;
	}
};
PositionDescriptor.extend(Me);

Me.right = createFn(X_DIMENSION, PLUS);
Me.down = createFn(Y_DIMENSION, PLUS);
Me.left = createFn(X_DIMENSION, MINUS);
Me.up = createFn(Y_DIMENSION, MINUS);

function createFn(dimension, direction) {
	return function create(relativeTo, relativeAmount) {
		return new Me(dimension, direction, relativeTo, relativeAmount);
	};
}

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var baseValue = this._relativeTo.value();
	var relativeValue = this._amount.value();

	if (this._direction === PLUS) return baseValue.plus(relativeValue);
	else return baseValue.minus(relativeValue);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var base = this._relativeTo.toString();
	if (this._amount.equals(Size.create(0))) return base;

	var relation = this._amount.toString();
	if (this._dimension === X_DIMENSION) relation += (this._direction === PLUS) ? " to right of " : " to left of ";
	else relation += (this._direction === PLUS) ? " below " : " above ";

	return relation + base;
};

},{"../util/ensure.js":26,"../values/size.js":32,"../values/value.js":33,"./descriptor.js":8,"./position_descriptor.js":13}],15:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Size = require("../values/size.js");
var Descriptor = require("./descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Value = require("../values/value.js");
var SizeMultiple = require("./size_multiple.js");

var PLUS = 1;
var MINUS = -1;

var Me = module.exports = function RelativeSize(direction, relativeTo, amount) {
	ensure.signature(arguments, [ Number, Descriptor, [Number, Descriptor, Value] ]);

	this.should = this.createShould();

	this._direction = direction;
	this._relativeTo = relativeTo;

	if (typeof amount === "number") {
		this._amount = Size.create(Math.abs(amount));
		if (amount < 0) this._direction *= -1;
	}
	else {
		this._amount = amount;
	}
};
SizeDescriptor.extend(Me);

Me.larger = factoryFn(PLUS);
Me.smaller = factoryFn(MINUS);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var baseValue = this._relativeTo.value();
	var relativeValue = this._amount.value();

	if (this._direction === PLUS) return baseValue.plus(relativeValue);
	else return baseValue.minus(relativeValue);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var base = this._relativeTo.toString();
	if (this._amount.equals(Size.create(0))) return base;

	var relation = this._amount.toString();
	if (this._direction === PLUS) relation += " larger than ";
	else relation += " smaller than ";

	return relation + base;
};

function factoryFn(direction) {
	return function factory(relativeTo, amount) {
		return new Me(direction, relativeTo, amount);
	};
}
},{"../util/ensure.js":26,"../values/size.js":32,"../values/value.js":33,"./descriptor.js":8,"./size_descriptor.js":16,"./size_multiple.js":17}],16:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint new-cap: "off" */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

function RelativeSize() {
	return require("./relative_size.js");   	// break circular dependency
}

function SizeMultiple() {
	return require("./size_multiple.js");   	// break circular dependency
}

var Me = module.exports = function SizeDescriptor() {
	ensure.unreachable("SizeDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

Me.prototype.createShould = function() {
	var self = this;

	var should = Descriptor.prototype.createShould.call(this);
	should.beBiggerThan = assertFn(-1, true);
	should.beSmallerThan = assertFn(1, false);
	return should;

	function assertFn(direction, shouldBeBigger) {
		return function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				if (expectedValue.isNone()) {
					throw new Error("'expected' value is not rendered, so relative comparisons aren't possible.");
				}

				var expectedMsg = (shouldBeBigger ? "more than" : "less than") + " " + expectedDesc;

				if (actualValue.isNone()) {
					return errorMessage(message, "rendered", expectedMsg, actualValue);
				}

				var compare = actualValue.compare(expectedValue);
				if ((shouldBeBigger && compare <= 0) || (!shouldBeBigger && compare >= 0)) {
					var nudge = shouldBeBigger ? -1 : 1;
					var shouldBe = "at least " + expectedValue.diff(self.plus(nudge).value());
					return errorMessage(message, shouldBe, expectedMsg, actualValue);
				}
			});
		};
	}

	function errorMessage(message, shouldBe, expected, actual) {
		return message + self + " should be " + shouldBe + ".\n" +
			"  Expected: " + expected + "\n" +
			"  But was:  " + actual;
	}

};

Me.prototype.plus = function plus(amount) {
	return RelativeSize().larger(this, amount);
};

Me.prototype.minus = function minus(amount) {
	return RelativeSize().smaller(this, amount);
};

Me.prototype.times = function times(amount) {
	return SizeMultiple().create(this, amount);
};

Me.prototype.convert = function convert(arg, type) {
	switch(type) {
		case "number": return Size.create(arg);
		case "string": return arg === "none" ? Size.createNone() : undefined;
		default: return undefined;
	}
};

},{"../util/ensure.js":26,"../util/oop.js":27,"../values/size.js":32,"./descriptor.js":8,"./relative_size.js":15,"./size_multiple.js":17}],17:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");

var Me = module.exports = function SizeMultiple(relativeTo, multiple) {
	ensure.signature(arguments, [ Descriptor, Number ]);

	this.should = this.createShould();

	this._relativeTo = relativeTo;
	this._multiple = multiple;
};
SizeDescriptor.extend(Me);

Me.create = function create(relativeTo, multiple) {
	return new Me(relativeTo, multiple);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this._relativeTo.value().times(this._multiple);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var multiple = this._multiple;
	var base = this._relativeTo.toString();
	if (multiple === 1) return base;

	var desc;
	switch(multiple) {
		case 1/2: desc = "half of "; break;
		case 1/3: desc = "one-third of "; break;
		case 2/3: desc = "two-thirds of "; break;
		case 1/4: desc = "one-quarter of "; break;
		case 3/4: desc = "three-quarters of "; break;
		case 1/5: desc = "one-fifth of "; break;
		case 2/5: desc = "two-fifths of "; break;
		case 3/5: desc = "three-fifths of "; break;
		case 4/5: desc = "four-fifths of "; break;
		case 1/6: desc = "one-sixth of "; break;
		case 5/6: desc = "five-sixths of "; break;
		case 1/8: desc = "one-eighth of "; break;
		case 3/8: desc = "three-eighths of "; break;
		case 5/8: desc = "five-eighths of "; break;
		case 7/8: desc = "seven-eighths of "; break;
		default:
			if (multiple > 1) desc = multiple + " times ";
			else desc = (multiple * 100) + "% of ";
	}

	return desc + base;
};
},{"../util/ensure.js":26,"../values/size.js":32,"./descriptor.js":8,"./size_descriptor.js":16}],18:[function(require,module,exports){
// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Center = require("./center.js");

var Me = module.exports = function Span(from, to, description) {
  ensure.signature(arguments, [ PositionDescriptor, PositionDescriptor, String ]);

  this.should = this.createShould();

  this.center = Center.x(from, to, "center of " + description);
  this.middle = Center.y(from, to, "middle of " + description);

  this._from = from;
  this._to = to;
  this._description = description;
};
SizeDescriptor.extend(Me);

Me.create = function(from, to, description) {
  return new Me(from, to, description);
};

Me.prototype.value = function() {
  ensure.signature(arguments, []);
  return this._from.value().distanceTo(this._to.value());
};

Me.prototype.toString = function() {
  return this._description;
};

},{"../util/ensure.js":26,"./center.js":7,"./position_descriptor.js":13,"./size_descriptor.js":16}],19:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ViewportEdge(position, browsingContext) {
	var BrowsingContext = require("../browsing_context.js");   // break circular dependency
	ensure.signature(arguments, [ String, BrowsingContext ]);

	this.should = this.createShould();

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._position = position;
	this._browsingContext = browsingContext;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	var scroll = this._browsingContext.getRawScrollPosition();
	var x = Position.x(scroll.x);
	var y = Position.y(scroll.y);

	var size = viewportSize(this._browsingContext.contentDocument.documentElement);

	switch(this._position) {
		case TOP: return y;
		case RIGHT: return x.plus(Position.x(size.width));
		case BOTTOM: return y.plus(Position.y(size.height));
		case LEFT: return x;

		default: ensure.unreachable();
	}
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return this._position + " edge of viewport";
};

function factoryFn(position) {
	return function factory(content) {
		return new Me(position, content);
	};
}



// USEFUL READING: http://www.quirksmode.org/mobile/viewports.html
// and http://www.quirksmode.org/mobile/viewports2.html

// BROWSERS TESTED: Safari 6.2.0 (Mac OS X 10.8.5); Mobile Safari 7.0.0 (iOS 7.1); Firefox 32.0.0 (Mac OS X 10.8);
//    Firefox 33.0.0 (Windows 7); Chrome 38.0.2125 (Mac OS X 10.8.5); Chrome 38.0.2125 (Windows 7); IE 8, 9, 10, 11

// Width techniques I've tried: (Note: results are different in quirks mode)
// body.clientWidth
// body.offsetWidth
// body.getBoundingClientRect().width
//    fails on all browsers: doesn't include margin
// body.scrollWidth
//    works on Safari, Mobile Safari, Chrome
//    fails on Firefox, IE 8, 9, 10, 11: doesn't include margin
// html.getBoundingClientRect().width
// html.offsetWidth
//    works on Safari, Mobile Safari, Chrome, Firefox
//    fails on IE 8, 9, 10: includes scrollbar
// html.scrollWidth
// html.clientWidth
//    WORKS! Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11

// Height techniques I've tried: (Note that results are different in quirks mode)
// body.clientHeight
// body.offsetHeight
// body.getBoundingClientRect().height
//    fails on all browsers: only includes height of content
// body getComputedStyle("height")
//    fails on all browsers: IE8 returns "auto"; others only include height of content
// body.scrollHeight
//    works on Safari, Mobile Safari, Chrome;
//    fails on Firefox, IE 8, 9, 10, 11: only includes height of content
// html.getBoundingClientRect().height
// html.offsetHeight
//    works on IE 8, 9, 10
//    fails on IE 11, Safari, Mobile Safari, Chrome: only includes height of content
// html.scrollHeight
//    works on Firefox, IE 8, 9, 10, 11
//    fails on Safari, Mobile Safari, Chrome: only includes height of content
// html.clientHeight
//    WORKS! Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11
function viewportSize(htmlElement) {
	return {
		width: htmlElement.clientWidth,
		height: htmlElement.clientHeight
	};
}

},{"../browsing_context.js":5,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":13}],20:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementRendered = require("./descriptors/element_rendered.js");
var ElementEdge = require("./descriptors/element_edge.js");
var Center = require("./descriptors/center.js");
var Span = require("./descriptors/span.js");
var Assertable = require("./assertable.js");

var Me = module.exports = function QElement(domElement, nickname) {
	ensure.signature(arguments, [ Object, String ]);

	this._domElement = domElement;
	this._nickname = nickname;

	// properties
	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.center = Center.x(this.left, this.right, "center of " + this);
	this.middle = Center.y(this.top, this.bottom, "middle of " + this);

	this.width = Span.create(this.left, this.right, "width of " + this);
	this.height = Span.create(this.top, this.bottom, "height of " + this);

	this.rendered = ElementRendered.create(this);
};
Assertable.extend(Me);

Me.create = function(domElement, nickname) {
	ensure.signature(arguments, [ Object, [ undefined, String ] ]);

	if (nickname === undefined) {
		if (domElement.id !== "") nickname = "#" + domElement.id;
		else if (domElement.className !== "") nickname = "." + domElement.className.split(/\s+/).join(".");
		else nickname = "<" + domElement.tagName.toLowerCase() + ">";
	}
	return new Me(domElement, nickname);
};

Me.prototype.getRawStyle = function(styleName) {
	ensure.signature(arguments, [String]);

	var styles;
	var result;

	// WORKAROUND IE 8: no getComputedStyle()
	if (window.getComputedStyle) {
		// WORKAROUND Firefox 40.0.3: must use frame's contentWindow (ref https://bugzilla.mozilla.org/show_bug.cgi?id=1204062)
		styles = this.context().contentWindow.getComputedStyle(this._domElement);
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

Me.prototype.calculatePixelValue = function(sizeString) {
	var dom = this._domElement;
	if (dom.runtimeStyle !== undefined) return ie8Workaround();

	var result;
	var style = dom.style;
	var oldPosition = style.position;
	var oldLeft = style.left;

	style.position = "absolute";
	style.left = sizeString;
	result = parseFloat(this.getRawStyle("left"));    // parseInt strips off 'px' value

	style.position = oldPosition;
	style.left = oldLeft;
	return result;

	// WORKAROUND IE 8: getRawStyle() doesn't normalize values to px
	// Based on code by Dean Edwards: http://disq.us/p/myl99x
	function ie8Workaround() {
		var runtimeStyleLeft = dom.runtimeStyle.left;
		var styleLeft = dom.style.left;

		dom.runtimeStyle.left = dom.currentStyle.left;
		dom.style.left = sizeString;
		result = dom.style.pixelLeft;

		dom.runtimeStyle.left = runtimeStyleLeft;
		dom.style.left = styleLeft;
		return result;
	}
};

Me.prototype.parent = function(nickname) {
	ensure.signature(arguments, [[ undefined, String ]]);

	var parentBody = this.context().body();
	if (this.equals(parentBody)) return null;

	var parent = this._domElement.parentElement;
	if (parent === null) return null;

	return Me.create(parent, nickname);
};

Me.prototype.add = function(html, nickname) {
	ensure.signature(arguments, [ String, [ undefined, String ] ]);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = shim.String.trim(html);
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._domElement.appendChild(insertedElement);
	return Me.create(insertedElement, nickname);
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	shim.Element.remove(this._domElement);
};

Me.prototype.contains = function(element) {
	ensure.signature(arguments, [ Me ]);
	return this.toDomElement().contains(element.toDomElement());
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	return this._domElement;
};

Me.prototype.context = function() {
	ensure.signature(arguments, []);

	var BrowsingContext = require("./browsing_context.js");   // break circular dependency
	return new BrowsingContext(this._domElement.ownerDocument);
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return "'" + this._nickname + "'";
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);
	return this._domElement === that._domElement;
};

},{"../vendor/camelcase-1.0.1-modified.js":35,"./assertable.js":3,"./browsing_context.js":5,"./descriptors/center.js":7,"./descriptors/element_edge.js":9,"./descriptors/element_rendered.js":10,"./descriptors/span.js":18,"./util/ensure.js":26,"./util/shim.js":28}],21:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

var Me = module.exports = function QElementList(nodeList, nickname) {
	ensure.signature(arguments, [ Object, String ]);

	this._nodeList = nodeList;
	this._nickname = nickname;
};

Me.prototype.length = function length() {
	ensure.signature(arguments, []);

	return this._nodeList.length;
};

Me.prototype.at = function at(requestedIndex, nickname) {
	ensure.signature(arguments, [ Number, [undefined, String] ]);

	var index = requestedIndex;
	var length = this.length();
	if (index < 0) index = length + index;

	ensure.that(
		index >= 0 && index < length,
		"'" + this._nickname + "'[" + requestedIndex + "] is out of bounds; list length is " + length
	);
	var element = this._nodeList[index];

	if (nickname === undefined) nickname = this._nickname + "[" + index + "]";
	return QElement.create(element, nickname);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return "'" + this._nickname + "' list";
};
},{"./q_element.js":20,"./util/ensure.js":26}],22:[function(require,module,exports){
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

},{"../vendor/async-1.4.2.js":34,"./browsing_context.js":5,"./util/ensure.js":26,"./util/shim.js":28}],23:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var PageEdge = require("./descriptors/page_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var Span = require("./descriptors/span.js");

var Me = module.exports = function QPage(browsingContext) {
	var BrowsingContext = require("./browsing_context.js");   // break circular dependency
	ensure.signature(arguments, [ BrowsingContext ]);

	// properties
	this.top = PageEdge.top(browsingContext);
	this.right = PageEdge.right(browsingContext);
	this.bottom = PageEdge.bottom(browsingContext);
	this.left = PageEdge.left(browsingContext);

	this.width = Span.create(this.left, this.right, "width of page");
	this.height = Span.create(this.top, this.bottom, "height of page");

	this.center = Center.x(this.left, this.right, "center of page");
	this.middle = Center.y(this.top, this.bottom, "middle of page");
};
Assertable.extend(Me);

},{"./assertable.js":3,"./browsing_context.js":5,"./descriptors/center.js":7,"./descriptors/page_edge.js":12,"./descriptors/span.js":18,"./util/ensure.js":26}],24:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var ViewportEdge = require("./descriptors/viewport_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var Span = require("./descriptors/span.js");

var Me = module.exports = function QViewport(browsingContext) {
	var BrowsingContext = require("./browsing_context");   // break circular dependency
	ensure.signature(arguments, [ BrowsingContext ]);

	// properties
	this.top = ViewportEdge.top(browsingContext);
	this.right = ViewportEdge.right(browsingContext);
	this.bottom = ViewportEdge.bottom(browsingContext);
	this.left = ViewportEdge.left(browsingContext);

	this.width = Span.create(this.left, this.right, "width of viewport");
	this.height = Span.create(this.top, this.bottom, "height of viewport");

	this.center = Center.x(this.left, this.right, "center of viewport");
	this.middle = Center.y(this.top, this.bottom, "middle of viewport");
};
Assertable.extend(Me);

},{"./assertable.js":3,"./browsing_context":5,"./descriptors/center.js":7,"./descriptors/span.js":18,"./descriptors/viewport_edge.js":19,"./util/ensure.js":26}],25:[function(require,module,exports){
// Copyright Titanium I.T. LLC.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require('./q_element.js');
var QFrame = require("./q_frame.js");
var browser = require("./browser.js");

exports.browser = browser;

exports.createFrame = function(options, callback) {
	return QFrame.create(document.body, options, function(err, callbackFrame) {
		if (err) return callback(err);
		browser.detectBrowserFeatures(function(err) {
			callback(err, callbackFrame);
		});
	});
};

exports.elementFromDom = function(domElement, nickname) {
	return QElement.create(domElement, nickname);
};

},{"./browser.js":4,"./q_element.js":20,"./q_frame.js":22,"./util/ensure.js":26}],26:[function(require,module,exports){
// Copyright (c) 2013-2014 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

// Runtime assertions for production code. (Contrast to assert.js, which is for test code.)

var shim = require("./shim.js");
var oop = require("./oop.js");

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

	var arg, types, name;
	for (var i = 0; i < signature.length; i++) {
		arg = args[i];
		types = signature[i];
		name = "Argument #" + (i + 1);

		if (!shim.Array.isArray(types)) types = [ types ];
		if (!argMatchesAnyPossibleType(arg, types)) {
			var message = name + " expected " + explainPossibleTypes(types) + ", but was " + explainArg(arg);
			throw new EnsureException(exports.signature, message);
		}
	}
};

function argMatchesAnyPossibleType(arg, type) {
	for (var i = 0; i < type.length; i++) {
		if (argMatchesType(arg, type[i])) return true;
	}
	return false;

	function argMatchesType(arg, type) {
		switch (getArgType(arg)) {
			case "boolean": return type === Boolean;
			case "string": return type === String;
			case "number": return type === Number;
			case "array": return type === Array;
			case "function": return type === Function;
			case "object": return type === Object || arg instanceof type;
			case "undefined": return type === undefined;
			case "null": return type === null;
			case "NaN": return typeof(type) === "number" && isNaN(type);

			default: exports.unreachable();
		}
	}
}

function explainPossibleTypes(type) {
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
			case undefined: return "undefined";
			default:
				if (typeof type === "number" && isNaN(type)) return "NaN";
				else {
					return oop.className(type) + " instance";
				}
		}
	}
}

function explainArg(arg) {
	var type = getArgType(arg);
	if (type !== "object") return type;

	return oop.instanceName(arg) + " instance";
}

function getArgType(variable) {
	var type = typeof variable;
	if (variable === null) type = "null";
	if (shim.Array.isArray(variable)) type = "array";
	if (type === "number" && isNaN(variable)) type = "NaN";
	return type;
}


/*****/

var EnsureException = exports.EnsureException = function EnsureException(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
};
EnsureException.prototype = shim.Object.create(Error.prototype);
EnsureException.prototype.constructor = EnsureException;
EnsureException.prototype.name = "EnsureException";

},{"./oop.js":27,"./shim.js":28}],27:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// can't use ensure.js due to circular dependency
var shim = require("./shim.js");

exports.className = function(constructor) {
	if (typeof constructor !== "function") throw new Error("Not a constructor");
	return shim.Function.name(constructor);
};

exports.instanceName = function(obj) {
	var prototype = shim.Object.getPrototypeOf(obj);
	if (prototype === null) return "<no prototype>";

	var constructor = prototype.constructor;
	if (constructor === undefined || constructor === null) return "<anon>";

	return shim.Function.name(constructor);
};

exports.extendFn = function extendFn(parentConstructor) {
	return function(childConstructor) {
		childConstructor.prototype = shim.Object.create(parentConstructor.prototype);
		childConstructor.prototype.constructor = childConstructor;
	};
};

exports.makeAbstract = function makeAbstract(constructor, methods) {
	var name = shim.Function.name(constructor);
	shim.Array.forEach(methods, function(method) {
		constructor.prototype[method] = function() {
			throw new Error(name + " subclasses must implement " + method + "() method");
		};
	});

	constructor.prototype.checkAbstractMethods = function checkAbstractMethods() {
		var unimplemented = [];
		var self = this;
		shim.Array.forEach(methods, function(name) {
			if (self[name] === constructor.prototype[name]) unimplemented.push(name + "()");
		});
		return unimplemented;
	};
};
},{"./shim.js":28}],28:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint eqeqeq: "off", no-eq-null: "off", no-bitwise: "off" */
"use strict";

exports.Array = {

	// WORKAROUND IE 8: no Array.isArray
	isArray: function isArray(thing) {
		if (Array.isArray) return Array.isArray(thing);

		return Object.prototype.toString.call(thing) === '[object Array]';
	},

	// WORKAROUND IE 8: no Array.every
	every: function every(obj, callbackfn, thisArg) {
		/*jshint bitwise:false, eqeqeq:false, -W041:false */
		if (Array.prototype.every) return obj.every(callbackfn, thisArg);

		// This workaround based on polyfill code from MDN:
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
		var T, k;

		if (this == null) {
			throw new TypeError('this is null or not defined');
		}

		// 1. Let O be the result of calling ToObject passing the this
		//    value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method
		//    of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
		if (typeof callbackfn !== 'function') {
			throw new TypeError();
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let k be 0.
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal
			//    method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal method
				//    of O with argument Pk.
				kValue = O[k];

				// ii. Let testResult be the result of calling the Call internal method
				//     of callbackfn with T as the this value and argument list
				//     containing kValue, k, and O.
				var testResult = callbackfn.call(T, kValue, k, O);

				// iii. If ToBoolean(testResult) is false, return false.
				if (!testResult) {
					return false;
				}
			}
			k++;
		}
		return true;
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


exports.Document = {

	// WORKAROUND IE 8: no document.head
	head: function head(doc) {
		if (doc.head) return doc.head;

		return doc.querySelector("head");
	}

};


exports.Element = {

	// WORKAROUND IE 8, IE 9, IE 10, IE 11: no Element.remove()
	remove: function remove(element) {
		element.parentNode.removeChild(element);
	}

};


exports.EventTarget = {

	// WORKAROUND IE 8: no EventTarget.addEventListener()
	addEventListener: function addEventListener(element, event, callback) {
		if (element.addEventListener) return element.addEventListener(event, callback);

		element.attachEvent("on" + event, callback);
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
	},

};


exports.Object = {

	// WORKAROUND IE 8: no Object.create()
	create: function create(prototype) {
		if (Object.create) return Object.create(prototype);

		var Temp = function Temp() {};
		Temp.prototype = prototype;
		return new Temp();
	},

	// WORKAROUND IE 8: no Object.getPrototypeOf
	// Caution: Doesn't work on IE 8 if constructor has been changed, as is the case with a subclass.
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


exports.String = {

	// WORKAROUND IE 8: No String.trim()
	trim: function(str) {
		if (str.trim !== undefined) return str.trim();

		// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
		return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	}

};


exports.Window = {

	// WORKAROUND IE 8: No Window.pageXOffset
	pageXOffset: function(window, document) {
		if (window.pageXOffset !== undefined) return window.pageXOffset;

		// Based on https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
		return isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
	},


	// WORKAROUND IE 8: No Window.pageYOffset
	pageYOffset: function(window, document) {
		if (window.pageYOffset !== undefined) return window.pageYOffset;

		// Based on https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
		return isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	}

};
},{}],29:[function(require,module,exports){
// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");

var Me = module.exports = function Pixels(amount) {
	ensure.signature(arguments, [ [ Number, null ] ]);
	this._none = (amount === null);
	this._amount = amount;
};
Value.extend(Me);

Me.create = function create(amount) {
	return new Me(amount);
};

Me.createNone = function createNone() {
	return new Me(null);
};

Me.ZERO = Me.create(0);
Me.NONE = Me.createNone();

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.isNone = function() {
	ensure.signature(arguments, []);
	return this._none;
};

Me.prototype.plus = Value.safe(function plus(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me(this._amount + operand._amount);
});

Me.prototype.minus = Value.safe(function minus(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me(this._amount - operand._amount);
});

Me.prototype.difference = Value.safe(function difference(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me(Math.abs(this._amount - operand._amount));
});

Me.prototype.times = function times(operand) {
	ensure.signature(arguments, [ Number ]);

	if (this._none) return Me.createNone();
	return new Me(this._amount * operand);
};

Me.prototype.average = Value.safe(function average(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me((this._amount + operand._amount) / 2);
});

Me.prototype.compare = Value.safe(function compare(operand) {
	var bothHavePixels = !this._none && !operand._none;
	var neitherHavePixels = this._none && operand._none;
	var onlyLeftHasPixels = !this._none && operand._none;

	if (bothHavePixels) {
		var difference = this._amount - operand._amount;
		if (Math.abs(difference) <= 0.5) return 0;
		else return difference;
	}
	else if (neitherHavePixels) {
				return 0;
	}
	else if (onlyLeftHasPixels) {
		return 1;
	}
	else {
		return -1;
	}
});

Me.min = function(l, r) {
	ensure.signature(arguments, [ Me, Me ]);

	if (l._none || r._none) return Me.createNone();
	return l.compare(r) <= 0 ? l : r;
};

Me.max = function(l, r) {
	ensure.signature(arguments, [ Me, Me ]);

	if (l._none || r._none) return Me.createNone();
	return l.compare(r) >= 0 ? l : r;
};

Me.prototype.diff = Value.safe(function diff(expected) {
	if (this.compare(expected) === 0) return "";
	if (this._none || expected._none) return "non-measurable";

	var difference = Math.abs(this._amount - expected._amount);

	var desc = difference;
	if (difference * 100 !== Math.floor(difference * 100)) desc = "about " + difference.toFixed(2);
	return desc + "px";
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._none ? "no pixels" : this._amount + "px";
};

},{"../util/ensure.js":26,"./value.js":33}],30:[function(require,module,exports){
// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");
var Size = require("./size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Position(dimension, value) {
	ensure.signature(arguments, [ String, [ Number, Pixels ] ]);

	this._dimension = dimension;
	this._value = (typeof value === "number") ? Pixels.create(value) : value;
};
Value.extend(Me);

Me.x = function x(value) {
	ensure.signature(arguments, [ [ Number, Pixels ] ]);

	return new Me(X_DIMENSION, value);
};

Me.y = function y(value) {
	ensure.signature(arguments, [ [ Number, Pixels ] ]);

	return new Me(Y_DIMENSION, value);
};

Me.noX = function noX() {
	ensure.signature(arguments, []);

	return new Me(X_DIMENSION, Pixels.NONE);
};

Me.noY = function noY() {
	ensure.signature(arguments, []);

	return new Me(Y_DIMENSION, Pixels.NONE);
};

Me.prototype.compatibility = function compatibility() {
	return [ Me, Size ];
};

Me.prototype.isNone = function isNone() {
	return this._value.isNone();
};

Me.prototype.distanceTo = function(operand) {
	ensure.signature(arguments, [ Me ]);
	checkAxis(this, operand);
	return Size.create(this._value.difference(operand.toPixels()));
};

Me.prototype.plus = Value.safe(function plus(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, this._value.plus(operand.toPixels()));
});

Me.prototype.minus = Value.safe(function minus(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, this._value.minus(operand.toPixels()));
});

Me.prototype.midpoint = Value.safe(function midpoint(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, this._value.average(operand.toPixels()));
});

Me.prototype.compare = Value.safe(function compare(operand) {
	checkAxis(this, operand);
	return this._value.compare(operand.toPixels());
});

Me.prototype.min = Value.safe(function min(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, Pixels.min(this._value, operand.toPixels()));
});

Me.prototype.max = Value.safe(function max(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, Pixels.max(this._value, operand.toPixels()));
});

Me.prototype.diff = Value.safe(function diff(expected) {
	ensure.signature(arguments, [ Me ]);
	checkAxis(this, expected);

	var actualValue = this._value;
	var expectedValue = expected._value;

	if (actualValue.equals(expectedValue)) return "";
	else if (isNone(expected) && !isNone(this)) return "rendered";
	else if (!isNone(expected) && isNone(this)) return "not rendered";

	var direction;
	var comparison = actualValue.compare(expectedValue);
	if (this._dimension === X_DIMENSION) direction = comparison < 0 ? "to left" : "to right";
	else direction = comparison < 0 ? "higher" : "lower";

	return actualValue.diff(expectedValue) + " " + direction;
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	if (isNone(this)) return "not rendered";
	else return this._value.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);
	return this._value;
};

function checkAxis(self, other) {
	if (other instanceof Me) {
		ensure.that(self._dimension === other._dimension, "Can't compare X coordinate to Y coordinate");
	}
}

function isNone(position) {
	return position._value.equals(Pixels.NONE);
}
},{"../util/ensure.js":26,"./pixels.js":29,"./size.js":32,"./value.js":33}],31:[function(require,module,exports){
// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");

var RENDERED = "rendered";
var NOT_RENDERED = "not rendered";

var Me = module.exports = function RenderState(state) {
	ensure.signature(arguments, [ String ]);

	this._state = state;
};
Value.extend(Me);

Me.rendered = function rendered() {
	return new Me(RENDERED);
};

Me.notRendered = function notRendered() {
	return new Me(NOT_RENDERED);
};

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.diff = Value.safe(function diff(expected) {
	var thisState = this._state;
	var expectedState = expected._state;

	if (thisState === expectedState) return "";
	else return this.toString();
});

Me.prototype.toString = function toString() {
	return this._state;
};

},{"../util/ensure.js":26,"./value.js":33}],32:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ [Number, Pixels] ]);

	this._value = (typeof value === "number") ? Pixels.create(value) : value;
};
Value.extend(Me);

Me.create = function create(value) {
	return new Me(value);
};

Me.createNone = function createNone() {
	ensure.signature(arguments, []);

	return new Me(Pixels.NONE);
};

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.isNone = function isNone() {
	return this._value.isNone();
};

Me.prototype.plus = Value.safe(function plus(operand) {
	return new Me(this._value.plus(operand._value));
});

Me.prototype.minus = Value.safe(function minus(operand) {
	return new Me(this._value.minus(operand._value));
});

Me.prototype.times = function times(operand) {
	return new Me(this._value.times(operand));
};

Me.prototype.compare = Value.safe(function compare(that) {
	return this._value.compare(that._value);
});

Me.prototype.diff = Value.safe(function diff(expected) {
	var actualValue = this._value;
	var expectedValue = expected._value;

	if (actualValue.equals(expectedValue)) return "";
	if (isNone(expected) && !isNone(this)) return "rendered";
	if (!isNone(expected) && isNone(this)) return "not rendered";

	var desc = actualValue.compare(expectedValue) > 0 ? " bigger" : " smaller";
	return actualValue.diff(expectedValue) + desc;
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	if (isNone(this)) return "not rendered";
	else return this._value.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);
	return this._value;
};

function isNone(size) {
	return size._value.equals(Pixels.NONE);
}
},{"../util/ensure.js":26,"./pixels.js":29,"./value.js":33}],33:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Value() {};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"compatibility",
	"diff",
	"toString"
]);

Me.safe = function safe(fn) {
	return function() {
		ensureCompatibility(this, this.compatibility(), arguments);
		return fn.apply(this, arguments);
	};
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);
	return this;
};

Me.prototype.equals = function equals(that) {
	return this.diff(that) === "";
};

Me.prototype.isCompatibleWith = function isCompatibleWith(that) {
	if (that === null || typeof that !== "object") return false;

	var compatibleTypes = this.compatibility();
	for (var i = 0; i < compatibleTypes.length; i++) {
		if (that instanceof compatibleTypes[i]) return true;
	}
	return false;
};

function ensureCompatibility(self, compatible, args) {
	var arg;
	for (var i = 0; i < args.length; i++) {   // args is not an Array, can't use forEach
		arg = args[i];
		if (!self.isCompatibleWith(arg)) {
			var type = typeof arg;
			if (arg === null) type = "null";
			if (type === "object") type = oop.instanceName(arg);

			throw new Error(
				"A descriptor doesn't make sense. (" + oop.instanceName(self) + " can't combine with " + type + ")"
			);
		}
	}
}


},{"../util/ensure.js":26,"../util/oop.js":27,"../util/shim.js":28}],34:[function(require,module,exports){
(function (process,global,setImmediate){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
            if (err) {
                callback(err);
            }
            else {
                completed += 1;
                if (completed >= size) {
                    callback(null);
                }
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback(null);
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = q.payload ?
                            q.tasks.splice(0, q.payload) :
                            q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"_process":1,"timers":2}],35:[function(require,module,exports){
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

},{}]},{},[25])(25)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvYXNzZXJ0YWJsZS5qcyIsInNyYy9icm93c2VyLmpzIiwic3JjL2Jyb3dzaW5nX2NvbnRleHQuanMiLCJzcmMvZGVzY3JpcHRvcnMvYWJzb2x1dGVfcG9zaXRpb24uanMiLCJzcmMvZGVzY3JpcHRvcnMvY2VudGVyLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2Rlc2NyaXB0b3IuanMiLCJzcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9lZGdlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2VsZW1lbnRfcmVuZGVyZWQuanMiLCJzcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9yZW5kZXJlZF9lZGdlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3BhZ2VfZWRnZS5qcyIsInNyYy9kZXNjcmlwdG9ycy9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3JlbGF0aXZlX3Bvc2l0aW9uLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3JlbGF0aXZlX3NpemUuanMiLCJzcmMvZGVzY3JpcHRvcnMvc2l6ZV9kZXNjcmlwdG9yLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3NpemVfbXVsdGlwbGUuanMiLCJzcmMvZGVzY3JpcHRvcnMvc3Bhbi5qcyIsInNyYy9kZXNjcmlwdG9ycy92aWV3cG9ydF9lZGdlLmpzIiwic3JjL3FfZWxlbWVudC5qcyIsInNyYy9xX2VsZW1lbnRfbGlzdC5qcyIsInNyYy9xX2ZyYW1lLmpzIiwic3JjL3FfcGFnZS5qcyIsInNyYy9xX3ZpZXdwb3J0LmpzIiwic3JjL3F1aXhvdGUuanMiLCJzcmMvdXRpbC9lbnN1cmUuanMiLCJzcmMvdXRpbC9vb3AuanMiLCJzcmMvdXRpbC9zaGltLmpzIiwic3JjL3ZhbHVlcy9waXhlbHMuanMiLCJzcmMvdmFsdWVzL3Bvc2l0aW9uLmpzIiwic3JjL3ZhbHVlcy9yZW5kZXJfc3RhdGUuanMiLCJzcmMvdmFsdWVzL3NpemUuanMiLCJzcmMvdmFsdWVzL3ZhbHVlLmpzIiwidmVuZG9yL2FzeW5jLTEuNC4yLmpzIiwidmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0c0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIG5leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy9icm93c2VyLmpzJykubmV4dFRpY2s7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaW1tZWRpYXRlSWRzID0ge307XG52YXIgbmV4dEltbWVkaWF0ZUlkID0gMDtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHsgdGltZW91dC5jbG9zZSgpOyB9O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIFRoYXQncyBub3QgaG93IG5vZGUuanMgaW1wbGVtZW50cyBpdCBidXQgdGhlIGV4cG9zZWQgYXBpIGlzIHRoZSBzYW1lLlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBmdW5jdGlvbihmbikge1xuICB2YXIgaWQgPSBuZXh0SW1tZWRpYXRlSWQrKztcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGZhbHNlIDogc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGltbWVkaWF0ZUlkc1tpZF0gPSB0cnVlO1xuXG4gIG5leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKSB7XG4gICAgaWYgKGltbWVkaWF0ZUlkc1tpZF0pIHtcbiAgICAgIC8vIGZuLmNhbGwoKSBpcyBmYXN0ZXIgc28gd2Ugb3B0aW1pemUgZm9yIHRoZSBjb21tb24gdXNlLWNhc2VcbiAgICAgIC8vIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vY2FsbC1hcHBseS1zZWd1XG4gICAgICBpZiAoYXJncykge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBQcmV2ZW50IGlkcyBmcm9tIGxlYWtpbmdcbiAgICAgIGV4cG9ydHMuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IHR5cGVvZiBjbGVhckltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xlYXJJbW1lZGlhdGUgOiBmdW5jdGlvbihpZCkge1xuICBkZWxldGUgaW1tZWRpYXRlSWRzW2lkXTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4vdXRpbC9vb3AuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3V0aWwvc2hpbS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBBc3NlcnRhYmxlKCkge1xuXHRlbnN1cmUudW5yZWFjaGFibGUoXCJBc3NlcnRhYmxlIGlzIGFic3RyYWN0IGFuZCBzaG91bGQgbm90IGJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5LlwiKTtcbn07XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW10pO1xuXG5NZS5wcm90b3R5cGUuYXNzZXJ0ID0gZnVuY3Rpb24gYXNzZXJ0KGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgW3VuZGVmaW5lZCwgU3RyaW5nXSBdKTtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRGlmZmVyZW5jZXMgZm91bmRcIjtcblxuXHR2YXIgZGlmZiA9IHRoaXMuZGlmZihleHBlY3RlZCk7XG5cdGlmIChkaWZmICE9PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSArIFwiOlxcblwiICsgZGlmZiArIFwiXFxuXCIpO1xufTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCBdKTtcblxuXHR2YXIgcmVzdWx0ID0gW107XG5cdHZhciBrZXlzID0gc2hpbS5PYmplY3Qua2V5cyhleHBlY3RlZCk7XG5cdHZhciBrZXksIG9uZURpZmYsIGRlc2NyaXB0b3I7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdGtleSA9IGtleXNbaV07XG5cdFx0ZGVzY3JpcHRvciA9IHRoaXNba2V5XTtcblx0XHRlbnN1cmUudGhhdChcblx0XHRcdFx0ZGVzY3JpcHRvciAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHR0aGlzICsgXCIgZG9lc24ndCBoYXZlIGEgcHJvcGVydHkgbmFtZWQgJ1wiICsga2V5ICsgXCInLiBEaWQgeW91IG1pc3NwZWxsIGl0P1wiXG5cdFx0KTtcblx0XHRvbmVEaWZmID0gZGVzY3JpcHRvci5kaWZmKGV4cGVjdGVkW2tleV0pO1xuXHRcdGlmIChvbmVEaWZmICE9PSBcIlwiKSByZXN1bHQucHVzaChvbmVEaWZmKTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQuam9pbihcIlxcblwiKTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgVGl0YW5pdW0gSS5ULiBMTEMuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFFGcmFtZSA9IHJlcXVpcmUoXCIuL3FfZnJhbWUuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlcy9zaXplLmpzXCIpO1xuXG52YXIgRlJBTUVfV0lEVEggPSAxNTAwO1xudmFyIEZSQU1FX0hFSUdIVCA9IDIwMDtcblxudmFyIGZlYXR1cmVzID0gbnVsbDtcblxuZXhwb3J0cy5lbmxhcmdlc0ZyYW1lVG9QYWdlU2l6ZSA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcImVubGFyZ2VzRnJhbWVcIik7XG5leHBvcnRzLmVubGFyZ2VzRm9udHMgPSBjcmVhdGVEZXRlY3Rpb25NZXRob2QoXCJlbmxhcmdlc0ZvbnRzXCIpO1xuZXhwb3J0cy5taXNyZXBvcnRzQ2xpcEF1dG9Qcm9wZXJ0eSA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcIm1pc3JlcG9ydHNDbGlwQXV0b1wiKTtcbmV4cG9ydHMubWlzcmVwb3J0c0F1dG9WYWx1ZXNJbkNsaXBQcm9wZXJ0eSA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcIm1pc3JlcG9ydHNDbGlwVmFsdWVzXCIpO1xuZXhwb3J0cy5yb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9ucyA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcInJvdW5kc09mZlBpeGVsQ2FsY3VsYXRpb25zXCIpO1xuXG5leHBvcnRzLmRldGVjdEJyb3dzZXJGZWF0dXJlcyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciBmcmFtZSA9IFFGcmFtZS5jcmVhdGUoZG9jdW1lbnQuYm9keSwgeyB3aWR0aDogRlJBTUVfV0lEVEgsIGhlaWdodDogRlJBTUVfSEVJR0hUIH0sIGZ1bmN0aW9uKGVycikge1xuXHRcdGlmIChlcnIpIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJFcnJvciB3aGlsZSBjcmVhdGluZyBRdWl4b3RlIGJyb3dzZXIgZmVhdHVyZSBkZXRlY3Rpb24gZnJhbWU6IFwiICsgZXJyKSk7XG5cdFx0fVxuXHRcdHJldHVybiBkZXRlY3RGZWF0dXJlcyhmcmFtZSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRmcmFtZS5yZW1vdmUoKTtcblx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdH0pO1xuXHR9KTtcbn07XG5cbmZ1bmN0aW9uIGRldGVjdEZlYXR1cmVzKGZyYW1lLCBjYWxsYmFjaykge1xuXHR0cnkge1xuXHRcdGZlYXR1cmVzID0ge307XG5cdFx0ZmVhdHVyZXMuZW5sYXJnZXNGcmFtZSA9IGRldGVjdEZyYW1lRW5sYXJnZW1lbnQoZnJhbWUsIEZSQU1FX1dJRFRIKTtcblx0XHRmZWF0dXJlcy5taXNyZXBvcnRzQ2xpcEF1dG8gPSBkZXRlY3RSZXBvcnRlZENsaXBBdXRvKGZyYW1lKTtcblx0XHRmZWF0dXJlcy5taXNyZXBvcnRzQ2xpcFZhbHVlcyA9IGRldGVjdFJlcG9ydGVkQ2xpcFByb3BlcnR5VmFsdWVzKGZyYW1lKTtcblx0XHRmZWF0dXJlcy5yb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9ucyA9IGRldGVjdFJvdW5kc09mZlBpeGVsQ2FsY3VsYXRpb25zKGZyYW1lKTtcblxuXHRcdGRldGVjdEZvbnRFbmxhcmdlbWVudChmcmFtZSwgRlJBTUVfV0lEVEgsIGZ1bmN0aW9uKHJlc3VsdCkge1xuXHRcdFx0ZmVhdHVyZXMuZW5sYXJnZXNGb250cyA9IHJlc3VsdDtcblx0XHRcdGZyYW1lLnJlbW92ZSgpO1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuXHRcdH0pO1xuXG5cdH1cblx0Y2F0Y2goZXJyKSB7XG5cdFx0ZmVhdHVyZXMgPSBudWxsO1xuXHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJFcnJvciBkdXJpbmcgUXVpeG90ZSBicm93c2VyIGZlYXR1cmUgZGV0ZWN0aW9uOiBcIiArIGVycikpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURldGVjdGlvbk1ldGhvZChwcm9wZXJ0eU5hbWUpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdFx0ZW5zdXJlLnRoYXQoXG5cdFx0XHRmZWF0dXJlcyAhPT0gbnVsbCxcblx0XHRcdFwiTXVzdCBjYWxsIHF1aXhvdGUuY3JlYXRlRnJhbWUoKSBiZWZvcmUgdXNpbmcgUXVpeG90ZSBicm93c2VyIGZlYXR1cmUgZGV0ZWN0aW9uLlwiXG5cdFx0KTtcblxuXHRcdHJldHVybiBmZWF0dXJlc1twcm9wZXJ0eU5hbWVdO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBkZXRlY3RGcmFtZUVubGFyZ2VtZW50KGZyYW1lLCBmcmFtZVdpZHRoKSB7XG5cdGZyYW1lLnJlc2V0KCk7XG5cblx0ZnJhbWUuYWRkKFwiPGRpdiBzdHlsZT0nd2lkdGg6IFwiICsgKGZyYW1lV2lkdGggKyAyMDApICsgXCJweCc+Zm9yY2Ugc2Nyb2xsaW5nPC9kaXY+XCIpO1xuXHRyZXR1cm4gIWZyYW1lLnZpZXdwb3J0KCkud2lkdGgudmFsdWUoKS5lcXVhbHMoU2l6ZS5jcmVhdGUoZnJhbWVXaWR0aCkpO1xufVxuXG5mdW5jdGlvbiBkZXRlY3RSZXBvcnRlZENsaXBBdXRvKGZyYW1lKSB7XG5cdGZyYW1lLnJlc2V0KCk7XG5cblx0dmFyIGVsZW1lbnQgPSBmcmFtZS5hZGQoXCI8ZGl2IHN0eWxlPSdjbGlwOiBhdXRvOyc+PC9kaXY+XCIpO1xuXHR2YXIgY2xpcCA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJjbGlwXCIpO1xuXG5cdHJldHVybiBjbGlwICE9PSBcImF1dG9cIjtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0UmVwb3J0ZWRDbGlwUHJvcGVydHlWYWx1ZXMoZnJhbWUpIHtcblx0ZnJhbWUucmVzZXQoKTtcblxuXHR2YXIgZWxlbWVudCA9IGZyYW1lLmFkZChcIjxkaXYgc3R5bGU9J2NsaXA6IHJlY3QoYXV0bywgYXV0bywgYXV0bywgYXV0byk7Jz48L2Rpdj5cIik7XG5cdHZhciBjbGlwID0gZWxlbWVudC5nZXRSYXdTdHlsZShcImNsaXBcIik7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBQcm92aWRlcyAnY2xpcFRvcCcgZXRjLiBpbnN0ZWFkIG9mICdjbGlwJyBwcm9wZXJ0eVxuXHRpZiAoY2xpcCA9PT0gXCJcIiAmJiBlbGVtZW50LmdldFJhd1N0eWxlKFwiY2xpcC10b3BcIikgPT09IFwiYXV0b1wiKSByZXR1cm4gZmFsc2U7XG5cblx0cmV0dXJuIGNsaXAgIT09IFwicmVjdChhdXRvLCBhdXRvLCBhdXRvLCBhdXRvKVwiICYmIGNsaXAgIT09IFwicmVjdChhdXRvIGF1dG8gYXV0byBhdXRvKVwiO1xufVxuXG5mdW5jdGlvbiBkZXRlY3RSb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9ucyhmcmFtZSkge1xuXHR2YXIgZWxlbWVudCA9IGZyYW1lLmFkZChcIjxkaXYgc3R5bGU9J2ZvbnQtc2l6ZTogMTVweDsnPjwvZGl2PlwiKTtcblx0dmFyIHNpemUgPSBlbGVtZW50LmNhbGN1bGF0ZVBpeGVsVmFsdWUoXCIwLjVlbVwiKTtcblxuXHRpZiAoc2l6ZSA9PT0gNy41KSByZXR1cm4gZmFsc2U7XG5cdGlmIChzaXplID09PSA4KSByZXR1cm4gdHJ1ZTtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiRmFpbHVyZSBpbiByb3VuZHNPZmZQaXhlbFZhbHVlcygpIGRldGVjdGlvbjogZXhwZWN0ZWQgNy41IG9yIDgsIGJ1dCBnb3QgXCIgKyBzaXplKTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0Rm9udEVubGFyZ2VtZW50KGZyYW1lLCBmcmFtZVdpZHRoLCBjYWxsYmFjaykge1xuXHRlbnN1cmUudGhhdChmcmFtZVdpZHRoID49IDE1MDAsIFwiRGV0ZWN0b3IgZnJhbWUgd2lkdGggbXVzdCBiZSBsYXJnZXIgdGhhbiBzY3JlZW4gdG8gZGV0ZWN0IGZvbnQgZW5sYXJnZW1lbnRcIik7XG5cdGZyYW1lLnJlc2V0KCk7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiB3ZSB1c2UgYSA8ZGl2PiBiZWNhdXNlIHRoZSA8c3R5bGU+IHRhZyBjYW4ndCBiZSBhZGRlZCBieSBmcmFtZS5hZGQoKS4gQXQgdGhlIHRpbWUgb2YgdGhpc1xuXHQvLyB3cml0aW5nLCBJJ20gbm90IHN1cmUgaWYgdGhlIGlzc3VlIGlzIHdpdGggZnJhbWUuYWRkKCkgb3IgaWYgSUUganVzdCBjYW4ndCBwcm9ncmFtbWF0aWNhbGx5IGFkZCA8c3R5bGU+IHRhZ3MuXG5cdGZyYW1lLmFkZChcIjxkaXY+PHN0eWxlPnAgeyBmb250LXNpemU6IDE1cHg7IH08L3N0eWxlPjwvZGl2PlwiKTtcblxuXHR2YXIgdGV4dCA9IGZyYW1lLmFkZChcIjxwPmFyYml0cmFyeSB0ZXh0PC9wPlwiKTtcblx0ZnJhbWUuYWRkKFwiPHA+bXVzdCBoYXZlIHR3byBwIHRhZ3MgdG8gd29yazwvcD5cIik7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBuZWVkIHRvIGZvcmNlIHJlZmxvdyBvciBnZXR0aW5nIGZvbnQtc2l6ZSBtYXkgZmFpbCBiZWxvd1xuXHQvLyBUaGlzIHNlZW1zIHRvIG9jY3VyIHdoZW4gSUUgaXMgcnVubmluZyBpbiBhIHNsb3cgVmlydHVhbEJveCBWTS4gVGhlcmUgaXMgbm8gdGVzdCBmb3IgdGhpcyBsaW5lLlxuXHRmcmFtZS5mb3JjZVJlZmxvdygpO1xuXG5cdC8vIFdPUktBUk9VTkQgU2FmYXJpIDguMC4wOiB0aW1lb3V0IHJlcXVpcmVkIGJlY2F1c2UgZm9udCBpcyBlbmxhcmdlZCBhc3luY2hyb25vdXNseVxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmb250U2l6ZSA9IHRleHQuZ2V0UmF3U3R5bGUoXCJmb250LXNpemVcIik7XG5cdFx0ZW5zdXJlLnRoYXQoZm9udFNpemUgIT09IFwiXCIsIFwiRXhwZWN0ZWQgZm9udC1zaXplIHRvIGJlIGEgdmFsdWVcIik7XG5cblx0XHQvLyBXT1JLQVJPVU5EIElFIDg6IGlnbm9yZXMgPHN0eWxlPiB0YWcgd2UgYWRkZWQgYWJvdmVcblx0XHRpZiAoZm9udFNpemUgPT09IFwiMTJwdFwiKSByZXR1cm4gY2FsbGJhY2soZmFsc2UpO1xuXG5cdFx0cmV0dXJuIGNhbGxiYWNrKGZvbnRTaXplICE9PSBcIjE1cHhcIik7XG5cdH0sIDApO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50LmpzXCIpO1xudmFyIFFFbGVtZW50TGlzdCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudF9saXN0LmpzXCIpO1xudmFyIFFWaWV3cG9ydCA9IHJlcXVpcmUoXCIuL3Ffdmlld3BvcnQuanNcIik7XG52YXIgUVBhZ2UgPSByZXF1aXJlKFwiLi9xX3BhZ2UuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQnJvd3NpbmdDb250ZXh0KGNvbnRlbnREb2N1bWVudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW09iamVjdF0pO1xuXG5cdHRoaXMuY29udGVudFdpbmRvdyA9IGNvbnRlbnREb2N1bWVudC5kZWZhdWx0VmlldyB8fCBjb250ZW50RG9jdW1lbnQucGFyZW50V2luZG93O1xuXHR0aGlzLmNvbnRlbnREb2N1bWVudCA9IGNvbnRlbnREb2N1bWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS5ib2R5ID0gZnVuY3Rpb24gYm9keSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gUUVsZW1lbnQuY3JlYXRlKHRoaXMuY29udGVudERvY3VtZW50LmJvZHksIFwiPGJvZHk+XCIpO1xufTtcblxuTWUucHJvdG90eXBlLnZpZXdwb3J0ID0gZnVuY3Rpb24gdmlld3BvcnQoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIG5ldyBRVmlld3BvcnQodGhpcyk7XG59O1xuXG5NZS5wcm90b3R5cGUucGFnZSA9IGZ1bmN0aW9uIHBhZ2UoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIG5ldyBRUGFnZSh0aGlzKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoaHRtbCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtTdHJpbmcsIFt1bmRlZmluZWQsIFN0cmluZ11dKTtcblx0cmV0dXJuIHRoaXMuYm9keSgpLmFkZChodG1sLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KHNlbGVjdG9yLCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1N0cmluZywgW3VuZGVmaW5lZCwgU3RyaW5nXV0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBzZWxlY3RvcjtcblxuXHR2YXIgbm9kZXMgPSB0aGlzLmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblx0ZW5zdXJlLnRoYXQobm9kZXMubGVuZ3RoID09PSAxLCBcIkV4cGVjdGVkIG9uZSBlbGVtZW50IHRvIG1hdGNoICdcIiArIHNlbGVjdG9yICsgXCInLCBidXQgZm91bmQgXCIgKyBub2Rlcy5sZW5ndGgpO1xuXHRyZXR1cm4gUUVsZW1lbnQuY3JlYXRlKG5vZGVzWzBdLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24gZ2V0QWxsKHNlbGVjdG9yLCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1N0cmluZywgW3VuZGVmaW5lZCwgU3RyaW5nXV0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBzZWxlY3RvcjtcblxuXHRyZXR1cm4gbmV3IFFFbGVtZW50TGlzdCh0aGlzLmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIHNjcm9sbCh4LCB5KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbTnVtYmVyLCBOdW1iZXJdKTtcblxuXHR0aGlzLmNvbnRlbnRXaW5kb3cuc2Nyb2xsKHgsIHkpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1Njcm9sbFBvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UmF3U2Nyb2xsUG9zaXRpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHtcblx0XHR4OiBzaGltLldpbmRvdy5wYWdlWE9mZnNldCh0aGlzLmNvbnRlbnRXaW5kb3csIHRoaXMuY29udGVudERvY3VtZW50KSxcblx0XHR5OiBzaGltLldpbmRvdy5wYWdlWU9mZnNldCh0aGlzLmNvbnRlbnRXaW5kb3csIHRoaXMuY29udGVudERvY3VtZW50KVxuXHR9O1xufTtcblxuLy8gVGhpcyBtZXRob2QgaXMgbm90IHRlc3RlZC0tZG9uJ3Qga25vdyBob3cuXG5NZS5wcm90b3R5cGUuZm9yY2VSZWZsb3cgPSBmdW5jdGlvbiBmb3JjZVJlZmxvdygpIHtcblx0dGhpcy5ib2R5KCkudG9Eb21FbGVtZW50KCkub2Zmc2V0VG9wO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbTWVdKTtcblx0cmV0dXJuIHRoaXMuY29udGVudFdpbmRvdyA9PT0gdGhhdC5jb250ZW50V2luZG93O1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbkRlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBBYnNvbHV0ZVBvc2l0aW9uKGRpbWVuc2lvbiwgdmFsdWUpIHtcbiAgZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBOdW1iZXIgXSk7XG5cbiAgdGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXG4gIHN3aXRjaChkaW1lbnNpb24pIHtcblx0XHRjYXNlIFhfRElNRU5TSU9OOlxuXHRcdFx0UG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdFx0XHR0aGlzLl92YWx1ZSA9IFBvc2l0aW9uLngodmFsdWUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBZX0RJTUVOU0lPTjpcblx0XHRcdFBvc2l0aW9uRGVzY3JpcHRvci55KHRoaXMpO1xuXHRcdFx0dGhpcy5fdmFsdWUgPSBQb3NpdGlvbi55KHZhbHVlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZShcIlVua25vd24gZGltZW5zaW9uOiBcIiArIGRpbWVuc2lvbik7XG4gIH1cbiAgdGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xufTtcblBvc2l0aW9uRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuICByZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl92YWx1ZSArIFwiIFwiICsgdGhpcy5fZGltZW5zaW9uICsgXCItY29vcmRpbmF0ZVwiO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbkRlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENlbnRlcihkaW1lbnNpb24sIHBvc2l0aW9uMSwgcG9zaXRpb24yLCBkZXNjcmlwdGlvbikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFBvc2l0aW9uRGVzY3JpcHRvciwgUG9zaXRpb25EZXNjcmlwdG9yLCBTdHJpbmcgXSk7XG5cblx0dGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXHRcblx0aWYgKGRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIFBvc2l0aW9uRGVzY3JpcHRvci54KHRoaXMpO1xuXHRlbHNlIGlmIChkaW1lbnNpb24gPT09IFlfRElNRU5TSU9OKSBQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0ZWxzZSBlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fcG9zaXRpb24xID0gcG9zaXRpb24xO1xuXHR0aGlzLl9wb3NpdGlvbjIgPSBwb3NpdGlvbjI7XG5cdHRoaXMuX2Rlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnggPSBmYWN0b3J5Rm4oWF9ESU1FTlNJT04pO1xuTWUueSA9IGZhY3RvcnlGbihZX0RJTUVOU0lPTik7XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fcG9zaXRpb24xLnZhbHVlKCkubWlkcG9pbnQodGhpcy5fcG9zaXRpb24yLnZhbHVlKCkpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjtcbn07XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihkaW1lbnNpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHBvc2l0aW9uMSwgcG9zaXRpb24yLCBkZXNjcmlwdGlvbikge1xuXHRcdHJldHVybiBuZXcgTWUoZGltZW5zaW9uLCBwb3NpdGlvbjEsIHBvc2l0aW9uMiwgZGVzY3JpcHRpb24pO1xuXHR9O1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIG9vcCA9IHJlcXVpcmUoXCIuLi91dGlsL29vcC5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvdmFsdWUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRGVzY3JpcHRvcigpIHtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiRGVzY3JpcHRvciBpcyBhYnN0cmFjdCBhbmQgc2hvdWxkIG5vdCBiZSBjb25zdHJ1Y3RlZCBkaXJlY3RseS5cIik7XG59O1xuTWUuZXh0ZW5kID0gb29wLmV4dGVuZEZuKE1lKTtcbm9vcC5tYWtlQWJzdHJhY3QoTWUsIFtcblx0XCJ2YWx1ZVwiLFxuXHRcInRvU3RyaW5nXCJcbl0pO1xuXG4vLyBXT1JLQVJPVU5EIElFIDg6IERvZXNuJ3Qgc3VwcG9ydCBPYmplY3QuZGVmaW5lUHJvcGVydHkoKSwgd2hpY2ggd291bGQgYWxsb3cgdXMgdG8gY3JlYXRlIE1lLnByb3RvdHlwZS5zaG91bGRcbi8vIGRpcmVjdGx5IG9uIHRoaXMgY2xhc3MgYXMgYW4gYWNjZXNzb3IgbWV0aG9kLlxuLy8gV09SS0FST1VORCBJRSAxMTogRG9lc24ndCBzdXBwb3J0IEVTNiAnY2xhc3MnIHN5bnRheCwgd2hpY2ggd291bGQgYWxsb3cgdXMgdG8gdXNlIGdldHRlciBtZXRob2RzIGFuZCBpbmhlcml0YW5jZS5cbk1lLnByb3RvdHlwZS5jcmVhdGVTaG91bGQgPSBmdW5jdGlvbiBjcmVhdGVBc3NlcnQoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0cmV0dXJuIHtcblxuXHRcdGVxdWFsOiBmdW5jdGlvbihleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0c2VsZi5kb0Fzc2VydGlvbihleHBlY3RlZCwgbWVzc2FnZSwgZnVuY3Rpb24oYWN0dWFsVmFsdWUsIGV4cGVjdGVkVmFsdWUsIGV4cGVjdGVkRGVzYywgbWVzc2FnZSkge1xuXHRcdFx0XHRpZiAoIWFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkge1xuXHRcdFx0XHRcdHJldHVybiBtZXNzYWdlICsgc2VsZiArIFwiIHNob3VsZCBiZSBcIiArIGV4cGVjdGVkVmFsdWUuZGlmZihhY3R1YWxWYWx1ZSkgKyBcIi5cXG5cIiArXG5cdFx0XHRcdFx0XHRcIiAgRXhwZWN0ZWQ6IFwiICsgZXhwZWN0ZWREZXNjICsgXCJcXG5cIiArXG5cdFx0XHRcdFx0XHRcIiAgQnV0IHdhczogIFwiICsgYWN0dWFsVmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRub3RFcXVhbDogZnVuY3Rpb24oZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0XHRcdHNlbGYuZG9Bc3NlcnRpb24oZXhwZWN0ZWQsIG1lc3NhZ2UsIGZ1bmN0aW9uKGFjdHVhbFZhbHVlLCBleHBlY3RlZFZhbHVlLCBleHBlY3RlZERlc2MsIG1lc3NhZ2UpIHtcblx0XHRcdFx0aWYgKGFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkge1xuXHRcdFx0XHRcdHJldHVybiBtZXNzYWdlICsgc2VsZiArIFwiIHNob3VsZG4ndCBiZSBcIiArIGV4cGVjdGVkVmFsdWUgKyBcIi5cXG5cIiArXG5cdFx0XHRcdFx0XHRcIiAgRXhwZWN0ZWQ6IGFueXRoaW5nIGJ1dCBcIiArIGV4cGVjdGVkRGVzYyArIFwiXFxuXCIgK1xuXHRcdFx0XHRcdFx0XCIgIEJ1dCB3YXM6ICBcIiArIGFjdHVhbFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdH07XG59O1xuXG5NZS5wcm90b3R5cGUuZG9Bc3NlcnRpb24gPSBmdW5jdGlvbiBkb0Fzc2VydGlvbihleHBlY3RlZCwgbWVzc2FnZSwgYXNzZXJ0Rm4pIHtcblx0bWVzc2FnZSA9IG1lc3NhZ2UgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBtZXNzYWdlICsgXCI6IFwiO1xuXHRleHBlY3RlZCA9IGNvbnZlcnRQcmltaXRpdmVFeHBlY3RhdGlvblRvVmFsdWVPYmplY3RJZk5lZWRlZCh0aGlzLCBleHBlY3RlZCwgbWVzc2FnZSk7XG5cblx0dmFyIGFjdHVhbFZhbHVlO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZTtcblx0dHJ5IHtcblx0XHRhY3R1YWxWYWx1ZSA9IHRoaXMudmFsdWUoKTtcblx0XHRleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQudmFsdWUoKTtcblx0fVxuXHRjYXRjaCAoZXJyKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0bWVzc2FnZSArIFwiRXJyb3IgaW4gdGVzdC4gVW5hYmxlIHRvIGNvbnZlcnQgZGVzY3JpcHRvcnMgdG8gdmFsdWVzLlxcblwiICtcblx0XHRcdFwiRXJyb3IgbWVzc2FnZTogXCIgKyBlcnIubWVzc2FnZSArIFwiXFxuXCIgK1xuXHRcdFx0XCIgICdhY3R1YWwnIGRlc2NyaXB0b3I6ICAgXCIgKyB0aGlzICsgXCIgKFwiICsgb29wLmluc3RhbmNlTmFtZSh0aGlzKSArIFwiKVxcblwiICtcblx0XHRcdFwiICAnZXhwZWN0ZWQnIGRlc2NyaXB0b3I6IFwiICsgZXhwZWN0ZWQgKyBcIiAoXCIgKyBvb3AuaW5zdGFuY2VOYW1lKGV4cGVjdGVkKSArIFwiKVxcblwiICtcblx0XHRcdFwiSWYgdGhpcyBlcnJvciBpcyB1bmNsZWFyIG9yIHlvdSB0aGluayBRdWl4b3RlIGlzIGF0IGZhdWx0LCBwbGVhc2Ugb3BlblxcblwiICtcblx0XHRcdFwiYW4gaXNzdWUgYXQgaHR0cHM6Ly9naXRodWIuY29tL2phbWVzc2hvcmUvcXVpeG90ZS9pc3N1ZXMuIEluY2x1ZGUgdGhpc1xcblwiICtcblx0XHRcdFwiZXJyb3IgbWVzc2FnZSBhbmQgYSBzdGFuZGFsb25lIGV4YW1wbGUgdGVzdCB0aGF0IHJlcHJvZHVjZXMgdGhlIGVycm9yLlxcblwiICtcblx0XHRcdFwiRXJyb3Igc3RhY2sgdHJhY2U6XFxuXCIgK1xuXHRcdFx0ZXJyLnN0YWNrXG5cdFx0KTtcblx0fVxuXG5cdGlmICghYWN0dWFsVmFsdWUuaXNDb21wYXRpYmxlV2l0aChleHBlY3RlZFZhbHVlKSkge1xuXHRcdHRocm93QmFkRXhwZWN0YXRpb24oXG5cdFx0XHR0aGlzLCBvb3AuaW5zdGFuY2VOYW1lKGV4cGVjdGVkKSArIFwiIChcIiArIGV4cGVjdGVkICsgXCIpXCIsIG1lc3NhZ2UsXG5cdFx0XHRcIkF0dGVtcHRlZCB0byBjb21wYXJlIHR3byBpbmNvbXBhdGlibGUgdHlwZXM6XCJcblx0XHQpO1xuXHR9XG5cblx0dmFyIGV4cGVjdGVkRGVzYyA9IGV4cGVjdGVkVmFsdWUudG9TdHJpbmcoKTtcblx0aWYgKGV4cGVjdGVkIGluc3RhbmNlb2YgTWUpIGV4cGVjdGVkRGVzYyArPSBcIiAoXCIgKyBleHBlY3RlZCArIFwiKVwiO1xuXG5cdHZhciBmYWlsdXJlO1xuXHR0cnkge1xuXHRcdGZhaWx1cmUgPSBhc3NlcnRGbihhY3R1YWxWYWx1ZSwgZXhwZWN0ZWRWYWx1ZSwgZXhwZWN0ZWREZXNjLCBtZXNzYWdlKTtcblx0fVxuXHRjYXRjaCAoZXJyMikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdG1lc3NhZ2UgKyBcIkVycm9yIGluIHRlc3QuIFVuYWJsZSB0byBwZXJmb3JtIGFzc2VydGlvbi5cXG5cIiArXG5cdFx0XHRcIkVycm9yIG1lc3NhZ2U6IFwiICsgZXJyMi5tZXNzYWdlICsgXCJcXG5cIiArXG5cdFx0XHRcIiAgJ2FjdHVhbCcgZGVzY3JpcHRvcjogICBcIiArIHRoaXMgKyBcIiAoXCIgKyBvb3AuaW5zdGFuY2VOYW1lKHRoaXMpICsgXCIpXFxuXCIgK1xuXHRcdFx0XCIgICdleHBlY3RlZCcgZGVzY3JpcHRvcjogXCIgKyBleHBlY3RlZCArIFwiIChcIiArIG9vcC5pbnN0YW5jZU5hbWUoZXhwZWN0ZWQpICsgXCIpXFxuXCIgK1xuXHRcdFx0XCIgICdhY3R1YWwnIHZhbHVlOiAgIFwiICsgYWN0dWFsVmFsdWUgKyBcIiAoXCIgKyBvb3AuaW5zdGFuY2VOYW1lKGFjdHVhbFZhbHVlKSArIFwiKVxcblwiICtcblx0XHRcdFwiICAnZXhwZWN0ZWQnIHZhbHVlOiBcIiArIGV4cGVjdGVkVmFsdWUgKyBcIiAoXCIgKyBvb3AuaW5zdGFuY2VOYW1lKGV4cGVjdGVkVmFsdWUpICsgXCIpXFxuXCIgK1xuXHRcdFx0XCJJZiB0aGlzIGVycm9yIGlzIHVuY2xlYXIgb3IgeW91IHRoaW5rIFF1aXhvdGUgaXMgYXQgZmF1bHQsIHBsZWFzZSBvcGVuXFxuXCIgK1xuXHRcdFx0XCJhbiBpc3N1ZSBhdCBodHRwczovL2dpdGh1Yi5jb20vamFtZXNzaG9yZS9xdWl4b3RlL2lzc3Vlcy4gSW5jbHVkZSB0aGlzXFxuXCIgK1xuXHRcdFx0XCJlcnJvciBtZXNzYWdlIGFuZCBhIHN0YW5kYWxvbmUgZXhhbXBsZSB0ZXN0IHRoYXQgcmVwcm9kdWNlcyB0aGUgZXJyb3IuXFxuXCJcblx0XHQpO1xuXHR9XG5cdGlmIChmYWlsdXJlICE9PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihmYWlsdXJlKTtcbn07XG5cblxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdC8vIExlZ2FjeSBjb2RlLCBzdHJpY3RseSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGRlcHJlY2F0ZWQgQXNzZXJ0YWJsZS5lcXVhbHMoKSBhbmQgQXNzZXJ0YWJsZS5kaWZmKCkgbWV0aG9kcy5cblx0Ly8gSXQncyB3ZWlyZCBiZWNhdXNlIHdlIG1vdmVkIHRvIHNob3VsZC5lcXVhbHMoKSwgd2hpY2ggYWx3YXlzIHRocm93cyBhbiBleGNlcHRpb24sIGJ1dCBkaWZmIHJldHVybnMgYSBzdHJpbmcuXG5cdC8vIFRvIGF2b2lkIGR1cGxpY2F0aW5nIGNvbXBsZXggbG9naWMsIHdlIGNhbGwgc2hvdWxkLmVxdWFscygpIGFuZCB0aGVuIHVud3JhcCB0aGUgZXhjZXB0aW9uLCBidXQgb25seSBpZiBpdCdzXG5cdC8vIHRoZSByaWdodCBraW5kIG9mIGV4Y2VwdGlvbi5cblx0dHJ5IHtcblx0XHR0aGlzLnNob3VsZC5lcXVhbChleHBlY3RlZCk7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblx0Y2F0Y2ggKGVycikge1xuXHRcdHZhciBtZXNzYWdlID0gZXJyLm1lc3NhZ2U7XG5cdFx0aWYgKG1lc3NhZ2UuaW5kZXhPZihcIkJ1dCB3YXM6XCIpID09PSAtMSkgdGhyb3cgZXJyOyAgICAvLyBpdCdzIG5vdCBhbiBhc3NlcnRpb24gZXJyb3IsIGl0J3Mgc29tZSBvdGhlciBleGNlcHRpb25cblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fVxufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHQvLyBUaGlzIG1ldGhvZCBpcyBtZWFudCB0byBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMuIEl0IHNob3VsZCByZXR1cm4gJ3VuZGVmaW5lZCcgd2hlbiBhbiBhcmd1bWVudFxuXHQvLyBjYW4ndCBiZSBjb252ZXJ0ZWQuIEluIHRoaXMgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiwgbm8gYXJndW1lbnRzIGNhbiBiZSBjb252ZXJ0ZWQsIHNvIHdlIGFsd2F5c1xuXHQvLyByZXR1cm4gJ3VuZGVmaW5lZCcuXG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0Ly8gRGVzY3JpcHRvcnMgYXJlbid0IHZhbHVlIG9iamVjdHMuIFRoZXkncmUgbmV2ZXIgZXF1YWwgdG8gYW55dGhpbmcuIEJ1dCBzb21ldGltZXNcblx0Ly8gdGhleSdyZSB1c2VkIGluIHRoZSBzYW1lIHBsYWNlcyB2YWx1ZSBvYmplY3RzIGFyZSB1c2VkLCBhbmQgdGhlbiB0aGlzIG1ldGhvZCBnZXRzIGNhbGxlZC5cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuZnVuY3Rpb24gY29udmVydFByaW1pdGl2ZUV4cGVjdGF0aW9uVG9WYWx1ZU9iamVjdElmTmVlZGVkKHNlbGYsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdHZhciBleHBlY3RlZFR5cGUgPSB0eXBlb2YgZXhwZWN0ZWQ7XG5cdGlmIChleHBlY3RlZCA9PT0gbnVsbCkgZXhwZWN0ZWRUeXBlID0gXCJudWxsXCI7XG5cblx0aWYgKGV4cGVjdGVkVHlwZSA9PT0gXCJvYmplY3RcIiAmJiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSkpIHJldHVybiBleHBlY3RlZDtcblxuXHRpZiAoZXhwZWN0ZWQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93QmFkRXhwZWN0YXRpb24oXG5cdFx0XHRzZWxmLCBcInVuZGVmaW5lZFwiLCBtZXNzYWdlLFxuXHRcdFx0XCJUaGUgJ2V4cGVjdGVkJyBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkLiBEaWQgeW91IG1pc3NwZWxsIGEgcHJvcGVydHkgbmFtZT9cIlxuXHRcdCk7XG5cdH1cblx0ZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0dGhyb3dCYWRFeHBlY3RhdGlvbihcblx0XHRcdHNlbGYsIG9vcC5pbnN0YW5jZU5hbWUoZXhwZWN0ZWQpLCBtZXNzYWdlLFxuXHRcdFx0XCJUaGUgJ2V4cGVjdGVkJyBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgZGVzY3JpcHRvciwgYnV0IGl0IHdhc24ndCByZWNvZ25pemVkLlwiXG5cdFx0KTtcblx0fVxuXHRlbHNlIHtcblx0XHR2YXIgY29udmVydGVkID0gc2VsZi5jb252ZXJ0KGV4cGVjdGVkLCBleHBlY3RlZFR5cGUpO1xuXHRcdGlmIChjb252ZXJ0ZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGNvbnZlcnRlZDtcblxuXHRcdHRocm93QmFkRXhwZWN0YXRpb24oXG5cdFx0XHRzZWxmLCBleHBlY3RlZFR5cGUsIG1lc3NhZ2UsXG5cdFx0XHRcIlRoZSAnZXhwZWN0ZWQnIHByaW1pdGl2ZSBpc24ndCBlcXVpdmFsZW50IHRvIHRoZSAnYWN0dWFsJyBkZXNjcmlwdG9yLlwiXG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiB0aHJvd0JhZEV4cGVjdGF0aW9uKHNlbGYsIGV4cGVjdGVkVHlwZSwgbWVzc2FnZSwgaGVhZGxpbmUpIHtcblx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdG1lc3NhZ2UgKyBcIkVycm9yIGluIHRlc3QuIFVzZSBhIGRpZmZlcmVudCAnZXhwZWN0ZWQnIHBhcmFtZXRlci5cXG5cIiArXG5cdFx0aGVhZGxpbmUgKyBcIlxcblwiICtcblx0XHRcIiAgJ2FjdHVhbCcgdHlwZTogICBcIiArIG9vcC5pbnN0YW5jZU5hbWUoc2VsZikgKyBcIiAoXCIgKyBzZWxmICsgXCIpXFxuXCIgK1xuXHRcdFwiICAnZXhwZWN0ZWQnIHR5cGU6IFwiICsgZXhwZWN0ZWRUeXBlXG5cdCk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIFBvc2l0aW9uRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uX2Rlc2NyaXB0b3IuanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRFZGdlKGVsZW1lbnQsIHBvc2l0aW9uKSB7XG5cdHZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuLi9xX2VsZW1lbnQuanNcIik7ICAgICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1FFbGVtZW50LCBTdHJpbmddKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKHBvc2l0aW9uID09PSBMRUZUIHx8IHBvc2l0aW9uID09PSBSSUdIVCkgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvbik7XG5cblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG5cdHRoaXMuX3Bvc2l0aW9uID0gcG9zaXRpb247XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgcmF3UG9zaXRpb24gPSB0aGlzLl9lbGVtZW50LmdldFJhd1Bvc2l0aW9uKCk7XG5cdHZhciBlZGdlID0gcmF3UG9zaXRpb25bdGhpcy5fcG9zaXRpb25dO1xuXG5cdHZhciBzY3JvbGwgPSB0aGlzLl9lbGVtZW50LmNvbnRleHQoKS5nZXRSYXdTY3JvbGxQb3NpdGlvbigpO1xuXHR2YXIgcmVuZGVyZWQgPSBlbGVtZW50UmVuZGVyZWQodGhpcy5fZWxlbWVudCk7XG5cblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBSSUdIVCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gTEVGVCkge1xuXHRcdGlmICghcmVuZGVyZWQpIHJldHVybiBQb3NpdGlvbi5ub1goKTtcblx0XHRyZXR1cm4gUG9zaXRpb24ueChlZGdlICsgc2Nyb2xsLngpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGlmICghcmVuZGVyZWQpIHJldHVybiBQb3NpdGlvbi5ub1koKTtcblx0XHRyZXR1cm4gUG9zaXRpb24ueShlZGdlICsgc2Nyb2xsLnkpO1xuXHR9XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZWxlbWVudCkge1xuXHRcdHJldHVybiBuZXcgTWUoZWxlbWVudCwgcG9zaXRpb24pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBlbGVtZW50UmVuZGVyZWQoZWxlbWVudCkge1xuXHR2YXIgaW5Eb20gPSBlbGVtZW50LmNvbnRleHQoKS5ib2R5KCkuY29udGFpbnMoZWxlbWVudCk7XG5cdHZhciBkaXNwbGF5Tm9uZSA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJkaXNwbGF5XCIpID09PSBcIm5vbmVcIjtcblxuXHRyZXR1cm4gaW5Eb20gJiYgIWRpc3BsYXlOb25lO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE2LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUmVuZGVyU3RhdGUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3JlbmRlcl9zdGF0ZS5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgRWxlbWVudFJlbmRlcmVkRWRnZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfcmVuZGVyZWRfZWRnZS5qc1wiKTtcbnZhciBTcGFuID0gcmVxdWlyZShcIi4vc3Bhbi5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9jZW50ZXIuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudFJlbmRlcmVkKGVsZW1lbnQpIHtcblx0dmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKTsgICAgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFFFbGVtZW50IF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG5cblx0Ly8gcHJvcGVydGllc1xuXHR0aGlzLnRvcCA9IEVsZW1lbnRSZW5kZXJlZEVkZ2UudG9wKGVsZW1lbnQpO1xuXHR0aGlzLnJpZ2h0ID0gRWxlbWVudFJlbmRlcmVkRWRnZS5yaWdodChlbGVtZW50KTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50UmVuZGVyZWRFZGdlLmJvdHRvbShlbGVtZW50KTtcblx0dGhpcy5sZWZ0ID0gRWxlbWVudFJlbmRlcmVkRWRnZS5sZWZ0KGVsZW1lbnQpO1xuXG5cdHRoaXMud2lkdGggPSBTcGFuLmNyZWF0ZSh0aGlzLmxlZnQsIHRoaXMucmlnaHQsIFwicmVuZGVyZWQgd2lkdGggb2YgXCIgKyBlbGVtZW50KTtcblx0dGhpcy5oZWlnaHQgPSBTcGFuLmNyZWF0ZSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwicmVuZGVyZWQgaGVpZ2h0IG9mIFwiICsgZWxlbWVudCk7XG5cblx0dGhpcy5jZW50ZXIgPSBDZW50ZXIueCh0aGlzLmxlZnQsIHRoaXMucmlnaHQsIFwicmVuZGVyZWQgY2VudGVyIG9mIFwiICsgZWxlbWVudCk7XG5cdHRoaXMubWlkZGxlID0gQ2VudGVyLnkodGhpcy50b3AsIHRoaXMuYm90dG9tLCBcInJlbmRlcmVkIG1pZGRsZSBvZiBcIiArIGVsZW1lbnQpO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGVsZW1lbnQpIHtcblx0cmV0dXJuIG5ldyBNZShlbGVtZW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRpZiAodGhpcy50b3AudmFsdWUoKS5lcXVhbHMoUG9zaXRpb24ubm9ZKCkpKSByZXR1cm4gUmVuZGVyU3RhdGUubm90UmVuZGVyZWQoKTtcblx0ZWxzZSByZXR1cm4gUmVuZGVyU3RhdGUucmVuZGVyZWQoKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRyZXR1cm4gdGhpcy5fZWxlbWVudC50b1N0cmluZygpICsgXCIgcmVuZGVyaW5nXCI7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcImJvb2xlYW5cIikge1xuXHRcdHJldHVybiBhcmcgPyBSZW5kZXJTdGF0ZS5yZW5kZXJlZCgpIDogUmVuZGVyU3RhdGUubm90UmVuZGVyZWQoKTtcblx0fVxufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBxdWl4b3RlID0gcmVxdWlyZShcIi4uL3F1aXhvdGUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgUVBhZ2UgPSByZXF1aXJlKFwiLi4vcV9wYWdlLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRWaXNpYmxlRWRnZShlbGVtZW50LCBwb3NpdGlvbikge1xuXHR2YXIgUUVsZW1lbnQgPSByZXF1aXJlKFwiLi4vcV9lbGVtZW50LmpzXCIpOyAgICAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgUUVsZW1lbnQsIFN0cmluZyBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKHBvc2l0aW9uID09PSBMRUZUIHx8IHBvc2l0aW9uID09PSBSSUdIVCkgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgdW5rbm93blBvc2l0aW9uKHBvc2l0aW9uKTtcblxuXHR0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcblx0dGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcbn07XG5Qb3NpdGlvbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUudG9wID0gZmFjdG9yeUZuKFRPUCk7XG5NZS5yaWdodCA9IGZhY3RvcnlGbihSSUdIVCk7XG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oQk9UVE9NKTtcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oTEVGVCk7XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihwb3NpdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShlbGVtZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShlbGVtZW50LCBwb3NpdGlvbik7XG5cdH07XG59XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fcG9zaXRpb24gKyBcIiByZW5kZXJlZCBlZGdlIG9mIFwiICsgdGhpcy5fZWxlbWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcblx0dmFyIGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50O1xuXHR2YXIgcGFnZSA9IGVsZW1lbnQuY29udGV4dCgpLnBhZ2UoKTtcblxuXHRpZiAoZWxlbWVudC50b3AudmFsdWUoKS5lcXVhbHMoUG9zaXRpb24ubm9ZKCkpKSByZXR1cm4gbm90UmVuZGVyZWQocG9zaXRpb24pO1xuXHRpZiAoZWxlbWVudC53aWR0aC52YWx1ZSgpLmVxdWFscyhTaXplLmNyZWF0ZSgwKSkpIHJldHVybiBub3RSZW5kZXJlZChwb3NpdGlvbik7XG5cdGlmIChlbGVtZW50LmhlaWdodC52YWx1ZSgpLmVxdWFscyhTaXplLmNyZWF0ZSgwKSkpIHJldHVybiBub3RSZW5kZXJlZChwb3NpdGlvbik7XG5cblx0ZW5zdXJlLnRoYXQoXG5cdFx0IWhhc0NsaXBQYXRoUHJvcGVydHkoZWxlbWVudCksXG5cdFx0XCJDYW4ndCBkZXRlcm1pbmUgZWxlbWVudCByZW5kZXJpbmcgYmVjYXVzZSB0aGUgZWxlbWVudCBpcyBhZmZlY3RlZCBieSB0aGUgJ2NsaXAtcGF0aCcgcHJvcGVydHksIFwiICtcblx0XHRcIndoaWNoIFF1aXhvdGUgZG9lc24ndCBzdXBwb3J0LlwiXG5cdCk7XG5cblx0dmFyIGJvdW5kcyA9IHtcblx0XHR0b3A6IHBhZ2UudG9wLnZhbHVlKCksXG5cdFx0cmlnaHQ6IG51bGwsXG5cdFx0Ym90dG9tOiBudWxsLFxuXHRcdGxlZnQ6IHBhZ2UubGVmdC52YWx1ZSgpXG5cdH07XG5cblx0Ym91bmRzID0gaW50ZXJzZWN0aW9uV2l0aE92ZXJmbG93KGVsZW1lbnQsIGJvdW5kcyk7XG5cdGJvdW5kcyA9IGludGVyc2VjdGlvbldpdGhDbGlwKGVsZW1lbnQsIGJvdW5kcyk7XG5cblx0dmFyIGVkZ2VzID0gaW50ZXJzZWN0aW9uKFxuXHRcdGJvdW5kcyxcblx0XHRlbGVtZW50LnRvcC52YWx1ZSgpLFxuXHRcdGVsZW1lbnQucmlnaHQudmFsdWUoKSxcblx0XHRlbGVtZW50LmJvdHRvbS52YWx1ZSgpLFxuXHRcdGVsZW1lbnQubGVmdC52YWx1ZSgpXG5cdCk7XG5cblx0aWYgKGlzQ2xpcHBlZE91dE9mRXhpc3RlbmNlKGJvdW5kcywgZWRnZXMpKSByZXR1cm4gbm90UmVuZGVyZWQocG9zaXRpb24pO1xuXHRlbHNlIHJldHVybiBlZGdlKGVkZ2VzLCBwb3NpdGlvbik7XG59O1xuXG5mdW5jdGlvbiBoYXNDbGlwUGF0aFByb3BlcnR5KGVsZW1lbnQpIHtcblx0dmFyIGNsaXBQYXRoID0gZWxlbWVudC5nZXRSYXdTdHlsZShcImNsaXAtcGF0aFwiKTtcblx0cmV0dXJuIGNsaXBQYXRoICE9PSBcIm5vbmVcIiAmJiBjbGlwUGF0aCAhPT0gXCJcIjtcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uV2l0aE92ZXJmbG93KGVsZW1lbnQsIGJvdW5kcykge1xuXHRmb3IgKHZhciBjb250YWluZXIgPSBlbGVtZW50LnBhcmVudCgpOyBjb250YWluZXIgIT09IG51bGw7IGNvbnRhaW5lciA9IGNvbnRhaW5lci5wYXJlbnQoKSkge1xuXHRcdGlmIChpc0NsaXBwZWRCeUFuY2VzdG9yT3ZlcmZsb3coZWxlbWVudCwgY29udGFpbmVyKSkge1xuXHRcdFx0Ym91bmRzID0gaW50ZXJzZWN0aW9uKFxuXHRcdFx0XHRib3VuZHMsXG5cdFx0XHRcdGNvbnRhaW5lci50b3AudmFsdWUoKSxcblx0XHRcdFx0Y29udGFpbmVyLnJpZ2h0LnZhbHVlKCksXG5cdFx0XHRcdGNvbnRhaW5lci5ib3R0b20udmFsdWUoKSxcblx0XHRcdFx0Y29udGFpbmVyLmxlZnQudmFsdWUoKVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gYm91bmRzO1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3Rpb25XaXRoQ2xpcChlbGVtZW50LCBib3VuZHMpIHtcblx0Ly8gV09SS0FST1VORCBJRSA4OiBEb2Vzbid0IGhhdmUgYW55IHdheSB0byBkZXRlY3QgJ2NsaXA6IGF1dG8nIHZhbHVlLlxuXHRlbnN1cmUudGhhdCghcXVpeG90ZS5icm93c2VyLm1pc3JlcG9ydHNDbGlwQXV0b1Byb3BlcnR5KCksXG5cdFx0XCJDYW4ndCBkZXRlcm1pbmUgZWxlbWVudCByZW5kZXJpbmcgb24gdGhpcyBicm93c2VyIGJlY2F1c2UgaXQgbWlzcmVwb3J0cyB0aGUgdmFsdWUgb2YgdGhlXCIgK1xuXHRcdFwiIGBjbGlwOiBhdXRvYCBwcm9wZXJ0eS4gWW91IGNhbiB1c2UgYHF1aXhvdGUuYnJvd3Nlci5taXNyZXBvcnRzQ2xpcEF1dG9Qcm9wZXJ0eSgpYCB0byBza2lwIHRoaXMgYnJvd3Nlci5cIlxuXHQpO1xuXG5cdGZvciAoIDsgZWxlbWVudCAhPT0gbnVsbDsgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50KCkpIHtcblx0XHR2YXIgY2xpcCA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJjbGlwXCIpO1xuXHRcdGlmIChjbGlwID09PSBcImF1dG9cIiB8fCAhY2FuQmVDbGlwcGVkQnlDbGlwUHJvcGVydHkoZWxlbWVudCkpIGNvbnRpbnVlO1xuXG5cdFx0dmFyIGNsaXBFZGdlcyA9IG5vcm1hbGl6ZUNsaXBQcm9wZXJ0eShlbGVtZW50LCBjbGlwKTtcblx0XHRib3VuZHMgPSBpbnRlcnNlY3Rpb24oXG5cdFx0XHRib3VuZHMsXG5cdFx0XHRjbGlwRWRnZXMudG9wLFxuXHRcdFx0Y2xpcEVkZ2VzLnJpZ2h0LFxuXHRcdFx0Y2xpcEVkZ2VzLmJvdHRvbSxcblx0XHRcdGNsaXBFZGdlcy5sZWZ0XG5cdFx0KTtcblx0fVxuXG5cdHJldHVybiBib3VuZHM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNsaXBQcm9wZXJ0eShlbGVtZW50LCBjbGlwKSB7XG5cdHZhciBjbGlwVmFsdWVzID0gcGFyc2VDbGlwUHJvcGVydHkoZWxlbWVudCwgY2xpcCk7XG5cblx0cmV0dXJuIHtcblx0XHR0b3A6IGNsaXBWYWx1ZXNbMF0gPT09IFwiYXV0b1wiID9cblx0XHRcdGVsZW1lbnQudG9wLnZhbHVlKCkgOlxuXHRcdFx0ZWxlbWVudC50b3AudmFsdWUoKS5wbHVzKFBvc2l0aW9uLnkoTnVtYmVyKGNsaXBWYWx1ZXNbMF0pKSksXG5cdFx0cmlnaHQ6IGNsaXBWYWx1ZXNbMV0gPT09IFwiYXV0b1wiID9cblx0XHRcdGVsZW1lbnQucmlnaHQudmFsdWUoKSA6XG5cdFx0XHRlbGVtZW50LmxlZnQudmFsdWUoKS5wbHVzKFBvc2l0aW9uLngoTnVtYmVyKGNsaXBWYWx1ZXNbMV0pKSksXG5cdFx0Ym90dG9tOiBjbGlwVmFsdWVzWzJdID09PSBcImF1dG9cIiA/XG5cdFx0XHRlbGVtZW50LmJvdHRvbS52YWx1ZSgpIDpcblx0XHRcdGVsZW1lbnQudG9wLnZhbHVlKCkucGx1cyhQb3NpdGlvbi55KE51bWJlcihjbGlwVmFsdWVzWzJdKSkpLFxuXHRcdGxlZnQ6IGNsaXBWYWx1ZXNbM10gPT09IFwiYXV0b1wiID9cblx0XHRcdGVsZW1lbnQubGVmdC52YWx1ZSgpIDpcblx0XHRcdGVsZW1lbnQubGVmdC52YWx1ZSgpLnBsdXMoUG9zaXRpb24ueChOdW1iZXIoY2xpcFZhbHVlc1szXSkpKVxuXHR9O1xuXG5cdGZ1bmN0aW9uIHBhcnNlQ2xpcFByb3BlcnR5KGVsZW1lbnQsIGNsaXApIHtcblx0XHQvLyBXT1JLQVJPVU5EIElFIDExLCBDaHJvbWUgTW9iaWxlIDQ0OiBSZXBvcnRzIDBweCBpbnN0ZWFkIG9mICdhdXRvJyB3aGVuIGNvbXB1dGluZyByZWN0KCkgaW4gY2xpcCBwcm9wZXJ0eS5cblx0XHRlbnN1cmUudGhhdCghcXVpeG90ZS5icm93c2VyLm1pc3JlcG9ydHNBdXRvVmFsdWVzSW5DbGlwUHJvcGVydHkoKSxcblx0XHRcdFwiQ2FuJ3QgZGV0ZXJtaW5lIGVsZW1lbnQgcmVuZGVyaW5nIG9uIHRoaXMgYnJvd3NlciBiZWNhdXNlIGl0IG1pc3JlcG9ydHMgdGhlIHZhbHVlIG9mIHRoZSBgY2xpcGBcIiArXG5cdFx0XHRcIiBwcm9wZXJ0eS4gWW91IGNhbiB1c2UgYHF1aXhvdGUuYnJvd3Nlci5taXNyZXBvcnRzQXV0b1ZhbHVlc0luQ2xpcFByb3BlcnR5KClgIHRvIHNraXAgdGhpcyBicm93c2VyLlwiXG5cdFx0KTtcblxuXHRcdHZhciBjbGlwUmVnZXggPSAvcmVjdFxcKCguKj8pLD8gKC4qPyksPyAoLio/KSw/ICguKj8pXFwpLztcblx0XHR2YXIgbWF0Y2hlcyA9IGNsaXBSZWdleC5leGVjKGNsaXApO1xuXHRcdGVuc3VyZS50aGF0KG1hdGNoZXMgIT09IG51bGwsIFwiVW5hYmxlIHRvIHBhcnNlIGNsaXAgcHJvcGVydHk6IFwiICsgY2xpcCk7XG5cblx0XHRyZXR1cm4gW1xuXHRcdFx0cGFyc2VMZW5ndGgobWF0Y2hlc1sxXSwgY2xpcCksXG5cdFx0XHRwYXJzZUxlbmd0aChtYXRjaGVzWzJdLCBjbGlwKSxcblx0XHRcdHBhcnNlTGVuZ3RoKG1hdGNoZXNbM10sIGNsaXApLFxuXHRcdFx0cGFyc2VMZW5ndGgobWF0Y2hlc1s0XSwgY2xpcClcblx0XHRdO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGFyc2VMZW5ndGgocHhTdHJpbmcsIGNsaXApIHtcblx0XHRpZiAocHhTdHJpbmcgPT09IFwiYXV0b1wiKSByZXR1cm4gcHhTdHJpbmc7XG5cblx0XHR2YXIgcHhSZWdleCA9IC9eKC4qPylweCQvO1xuXHRcdHZhciBtYXRjaGVzID0gcHhSZWdleC5leGVjKHB4U3RyaW5nKTtcblx0XHRlbnN1cmUudGhhdChtYXRjaGVzICE9PSBudWxsLCBcIlVuYWJsZSB0byBwYXJzZSAnXCIgKyBweFN0cmluZyArIFwiJyBpbiBjbGlwIHByb3BlcnR5OiBcIiArIGNsaXApO1xuXG5cdFx0cmV0dXJuIG1hdGNoZXNbMV07XG5cdH1cbn1cblxuZnVuY3Rpb24gaXNDbGlwcGVkQnlBbmNlc3Rvck92ZXJmbG93KGVsZW1lbnQsIGFuY2VzdG9yKSB7XG5cdHJldHVybiBjYW5CZUNsaXBwZWRCeU92ZXJmbG93UHJvcGVydHkoZWxlbWVudCkgJiYgaGFzQ2xpcHBpbmdPdmVyZmxvdyhhbmNlc3Rvcik7XG59XG5cbmZ1bmN0aW9uIGNhbkJlQ2xpcHBlZEJ5T3ZlcmZsb3dQcm9wZXJ0eShlbGVtZW50KSB7XG5cdHZhciBwb3NpdGlvbiA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJwb3NpdGlvblwiKTtcblx0c3dpdGNoIChwb3NpdGlvbikge1xuXHRcdGNhc2UgXCJzdGF0aWNcIjpcblx0XHRjYXNlIFwicmVsYXRpdmVcIjpcblx0XHRjYXNlIFwiYWJzb2x1dGVcIjpcblx0XHRjYXNlIFwic3RpY2t5XCI6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRjYXNlIFwiZml4ZWRcIjpcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbiBwcm9wZXJ0eTogXCIgKyBwb3NpdGlvbik7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFzQ2xpcHBpbmdPdmVyZmxvdyhlbGVtZW50KSB7XG5cdHJldHVybiBjbGlwcyhcIm92ZXJmbG93LXhcIikgfHwgY2xpcHMoXCJvdmVyZmxvdy15XCIpO1xuXG5cdGZ1bmN0aW9uIGNsaXBzKHN0eWxlKSB7XG5cdFx0dmFyIG92ZXJmbG93ID0gZWxlbWVudC5nZXRSYXdTdHlsZShzdHlsZSk7XG5cdFx0c3dpdGNoIChvdmVyZmxvdykge1xuXHRcdFx0Y2FzZSBcImhpZGRlblwiOlxuXHRcdFx0Y2FzZSBcInNjcm9sbFwiOlxuXHRcdFx0Y2FzZSBcImF1dG9cIjpcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRjYXNlIFwidmlzaWJsZVwiOlxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIFwiICsgc3R5bGUgKyBcIiBwcm9wZXJ0eTogXCIgKyBvdmVyZmxvdyk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGNhbkJlQ2xpcHBlZEJ5Q2xpcFByb3BlcnR5KGVsZW1lbnQpIHtcblx0dmFyIHBvc2l0aW9uID0gZWxlbWVudC5nZXRSYXdTdHlsZShcInBvc2l0aW9uXCIpO1xuXHRzd2l0Y2ggKHBvc2l0aW9uKSB7XG5cdFx0Y2FzZSBcImFic29sdXRlXCI6XG5cdFx0Y2FzZSBcImZpeGVkXCI6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRjYXNlIFwic3RhdGljXCI6XG5cdFx0Y2FzZSBcInJlbGF0aXZlXCI6XG5cdFx0Y2FzZSBcInN0aWNreVwiOlxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIHBvc2l0aW9uIHByb3BlcnR5OiBcIiArIHBvc2l0aW9uKTtcblx0fVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3Rpb24oYm91bmRzLCB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQpIHtcblx0Ym91bmRzLnRvcCA9IGJvdW5kcy50b3AubWF4KHRvcCk7XG5cdGJvdW5kcy5yaWdodCA9IChib3VuZHMucmlnaHQgPT09IG51bGwpID8gcmlnaHQgOiBib3VuZHMucmlnaHQubWluKHJpZ2h0KTtcblx0Ym91bmRzLmJvdHRvbSA9IChib3VuZHMuYm90dG9tID09PSBudWxsKSA/IGJvdHRvbSA6IGJvdW5kcy5ib3R0b20ubWluKGJvdHRvbSk7XG5cdGJvdW5kcy5sZWZ0ID0gYm91bmRzLmxlZnQubWF4KGxlZnQpO1xuXG5cdHJldHVybiBib3VuZHM7XG59XG5cbmZ1bmN0aW9uIGlzQ2xpcHBlZE91dE9mRXhpc3RlbmNlKGJvdW5kcywgZWRnZXMpIHtcblx0cmV0dXJuIChib3VuZHMudG9wLmNvbXBhcmUoZWRnZXMuYm90dG9tKSA+PSAwKSB8fFxuXHRcdChib3VuZHMucmlnaHQgIT09IG51bGwgJiYgYm91bmRzLnJpZ2h0LmNvbXBhcmUoZWRnZXMubGVmdCkgPD0gMCkgfHxcblx0XHQoYm91bmRzLmJvdHRvbSAhPT0gbnVsbCAmJiBib3VuZHMuYm90dG9tLmNvbXBhcmUoZWRnZXMudG9wKSA8PSAwKSB8fFxuXHRcdChib3VuZHMubGVmdC5jb21wYXJlKGVkZ2VzLnJpZ2h0KSA+PSAwKTtcbn1cblxuZnVuY3Rpb24gbm90UmVuZGVyZWQocG9zaXRpb24pIHtcblx0c3dpdGNoKHBvc2l0aW9uKSB7XG5cdFx0Y2FzZSBUT1A6XG5cdFx0Y2FzZSBCT1RUT006XG5cdFx0XHRyZXR1cm4gUG9zaXRpb24ubm9ZKCk7XG5cdFx0Y2FzZSBMRUZUOlxuXHRcdGNhc2UgUklHSFQ6XG5cdFx0XHRyZXR1cm4gUG9zaXRpb24ubm9YKCk7XG5cdFx0ZGVmYXVsdDogdW5rbm93blBvc2l0aW9uKHBvc2l0aW9uKTtcblx0fVxufVxuXG5mdW5jdGlvbiBlZGdlKGVkZ2VzLCBwb3NpdGlvbikge1xuXHRzd2l0Y2gocG9zaXRpb24pIHtcblx0XHRjYXNlIFRPUDogcmV0dXJuIGVkZ2VzLnRvcDtcblx0XHRjYXNlIFJJR0hUOiByZXR1cm4gZWRnZXMucmlnaHQ7XG5cdFx0Y2FzZSBCT1RUT006IHJldHVybiBlZGdlcy5ib3R0b207XG5cdFx0Y2FzZSBMRUZUOiByZXR1cm4gZWRnZXMubGVmdDtcblx0XHRkZWZhdWx0OiB1bmtub3duUG9zaXRpb24ocG9zaXRpb24pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVua25vd25Qb3NpdGlvbihwb3NpdGlvbikge1xuXHRlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIHBvc2l0aW9uOiBcIiArIHBvc2l0aW9uKTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBhZ2VFZGdlKGVkZ2UsIGJyb3dzaW5nQ29udGV4dCkge1xuXHR2YXIgQnJvd3NpbmdDb250ZXh0ID0gcmVxdWlyZShcIi4uL2Jyb3dzaW5nX2NvbnRleHQuanNcIik7ICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIEJyb3dzaW5nQ29udGV4dCBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKGVkZ2UgPT09IExFRlQgfHwgZWRnZSA9PT0gUklHSFQpIFBvc2l0aW9uRGVzY3JpcHRvci54KHRoaXMpO1xuXHRlbHNlIGlmIChlZGdlID09PSBUT1AgfHwgZWRnZSA9PT0gQk9UVE9NKSBQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0ZWxzZSBlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIGVkZ2U6IFwiICsgZWRnZSk7XG5cblx0dGhpcy5fZWRnZSA9IGVkZ2U7XG5cdHRoaXMuX2Jyb3dzaW5nQ29udGV4dCA9IGJyb3dzaW5nQ29udGV4dDtcbn07XG5Qb3NpdGlvbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUudG9wID0gZmFjdG9yeUZuKFRPUCk7XG5NZS5yaWdodCA9IGZhY3RvcnlGbihSSUdIVCk7XG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oQk9UVE9NKTtcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oTEVGVCk7XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBzaXplID0gcGFnZVNpemUodGhpcy5fYnJvd3NpbmdDb250ZXh0LmNvbnRlbnREb2N1bWVudCk7XG5cdHN3aXRjaCh0aGlzLl9lZGdlKSB7XG5cdFx0Y2FzZSBUT1A6IHJldHVybiBQb3NpdGlvbi55KDApO1xuXHRcdGNhc2UgUklHSFQ6IHJldHVybiBQb3NpdGlvbi54KHNpemUud2lkdGgpO1xuXHRcdGNhc2UgQk9UVE9NOiByZXR1cm4gUG9zaXRpb24ueShzaXplLmhlaWdodCk7XG5cdFx0Y2FzZSBMRUZUOiByZXR1cm4gUG9zaXRpb24ueCgwKTtcblxuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZSgpO1xuXHR9XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRzd2l0Y2godGhpcy5fZWRnZSkge1xuXHRcdGNhc2UgVE9QOiByZXR1cm4gXCJ0b3Agb2YgcGFnZVwiO1xuXHRcdGNhc2UgUklHSFQ6IHJldHVybiBcInJpZ2h0IHNpZGUgb2YgcGFnZVwiO1xuXHRcdGNhc2UgQk9UVE9NOiByZXR1cm4gXCJib3R0b20gb2YgcGFnZVwiO1xuXHRcdGNhc2UgTEVGVDogcmV0dXJuIFwibGVmdCBzaWRlIG9mIHBhZ2VcIjtcblxuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZSgpO1xuXHR9XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4oZWRnZSkge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShicm93c2luZ0NvbnRleHQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGVkZ2UsIGJyb3dzaW5nQ29udGV4dCk7XG5cdH07XG59XG5cblxuLy8gVVNFRlVMIFJFQURJTkc6IGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvbW9iaWxlL3ZpZXdwb3J0cy5odG1sXG4vLyBhbmQgaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9tb2JpbGUvdmlld3BvcnRzMi5odG1sXG5cbi8vIEFQSSBTRU1BTlRJQ1MuXG4vLyBSZWYgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NTU19PYmplY3RfTW9kZWwvRGV0ZXJtaW5pbmdfdGhlX2RpbWVuc2lvbnNfb2ZfZWxlbWVudHNcbi8vICAgIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoOiBzdW0gb2YgYm91bmRpbmcgYm94ZXMgb2YgZWxlbWVudCAodGhlIGRpc3BsYXllZCB3aWR0aCBvZiB0aGUgZWxlbWVudCxcbi8vICAgICAgaW5jbHVkaW5nIHBhZGRpbmcgYW5kIGJvcmRlcikuIEZyYWN0aW9uYWwuIEFwcGxpZXMgdHJhbnNmb3JtYXRpb25zLlxuLy8gICAgY2xpZW50V2lkdGg6IHZpc2libGUgd2lkdGggb2YgZWxlbWVudCBpbmNsdWRpbmcgcGFkZGluZyAoYnV0IG5vdCBib3JkZXIpLiBFWENFUFQgb24gcm9vdCBlbGVtZW50IChodG1sKSwgd2hlcmVcbi8vICAgICAgaXQgaXMgdGhlIHdpZHRoIG9mIHRoZSB2aWV3cG9ydC4gUm91bmRzIHRvIGFuIGludGVnZXIuIERvZXNuJ3QgYXBwbHkgdHJhbnNmb3JtYXRpb25zLlxuLy8gICAgb2Zmc2V0V2lkdGg6IHZpc2libGUgd2lkdGggb2YgZWxlbWVudCBpbmNsdWRpbmcgcGFkZGluZywgYm9yZGVyLCBhbmQgc2Nyb2xsYmFycyAoaWYgYW55KS4gUm91bmRzIHRvIGFuIGludGVnZXIuXG4vLyAgICAgIERvZXNuJ3QgYXBwbHkgdHJhbnNmb3JtYXRpb25zLlxuLy8gICAgc2Nyb2xsV2lkdGg6IGVudGlyZSB3aWR0aCBvZiBlbGVtZW50LCBpbmNsdWRpbmcgYW55IHBhcnQgdGhhdCdzIG5vdCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxiYXJzLiBSb3VuZHMgdG9cbi8vICAgICAgYW4gaW50ZWdlci4gRG9lc24ndCBhcHBseSB0cmFuc2Zvcm1hdGlvbnMuIE5vdCBjbGVhciBpZiBpdCBpbmNsdWRlcyBzY3JvbGxiYXJzLCBidXQgSSB0aGluayBub3QuIEFsc29cbi8vICAgICAgbm90IGNsZWFyIGlmIGl0IGluY2x1ZGVzIGJvcmRlcnMgb3IgcGFkZGluZy4gKEJ1dCBmcm9tIHRlc3RzLCBhcHBhcmVudGx5IG5vdCBib3JkZXJzLiBFeGNlcHQgb24gcm9vdFxuLy8gICAgICBlbGVtZW50IGFuZCBib2R5IGVsZW1lbnQsIHdoaWNoIGhhdmUgc3BlY2lhbCByZXN1bHRzIHRoYXQgdmFyeSBieSBicm93c2VyLilcblxuLy8gVEVTVCBSRVNVTFRTOiBXSURUSFxuLy8gICDinJQgPSBjb3JyZWN0IGFuc3dlclxuLy8gICDinJggPSBpbmNvcnJlY3QgYW5zd2VyIGFuZCBkaXZlcmdlcyBmcm9tIHNwZWNcbi8vICAgfiA9IGluY29ycmVjdCBhbnN3ZXIsIGJ1dCBtYXRjaGVzIHNwZWNcbi8vIEJST1dTRVJTIFRFU1RFRDogU2FmYXJpIDYuMi4wIChNYWMgT1MgWCAxMC44LjUpOyBNb2JpbGUgU2FmYXJpIDcuMC4wIChpT1MgNy4xKTsgRmlyZWZveCAzMi4wLjAgKE1hYyBPUyBYIDEwLjgpO1xuLy8gICAgRmlyZWZveCAzMy4wLjAgKFdpbmRvd3MgNyk7IENocm9tZSAzOC4wLjIxMjUgKE1hYyBPUyBYIDEwLjguNSk7IENocm9tZSAzOC4wLjIxMjUgKFdpbmRvd3MgNyk7IElFIDgsIDksIDEwLCAxMVxuXG4vLyBodG1sIHdpZHRoIHN0eWxlIHNtYWxsZXIgdGhhbiB2aWV3cG9ydCB3aWR0aDsgYm9keSB3aWR0aCBzdHlsZSBzbWFsbGVyIHRoYW4gaHRtbCB3aWR0aCBzdHlsZVxuLy8gIE5PVEU6IFRoZXNlIHRlc3RzIHdlcmUgY29uZHVjdGVkIHdoZW4gY29ycmVjdCByZXN1bHQgd2FzIHdpZHRoIG9mIGJvcmRlci4gVGhhdCBoYXMgYmVlbiBjaGFuZ2VkXG4vLyAgdG8gXCJ3aWR0aCBvZiB2aWV3cG9ydC5cIlxuLy8gICAgaHRtbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgICDinJggSUUgOCwgOSwgMTA6IHdpZHRoIG9mIHZpZXdwb3J0XG4vLyAgICAgIOKclCBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgMTE6IHdpZHRoIG9mIGh0bWwsIGluY2x1ZGluZyBib3JkZXJcbi8vICAgIGh0bWwuY2xpZW50V2lkdGhcbi8vICAgICAgfiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB3aWR0aCBvZiB2aWV3cG9ydFxuLy8gICAgaHRtbC5vZmZzZXRXaWR0aFxuLy8gICAgICDinJggSUUgOCwgOSwgMTA6IHdpZHRoIG9mIHZpZXdwb3J0XG4vLyAgICAgIOKclCBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgMTE6IHdpZHRoIG9mIGh0bWwsIGluY2x1ZGluZyBib3JkZXJcbi8vICAgIGh0bWwuc2Nyb2xsV2lkdGhcbi8vICAgICAg4pyYIElFIDgsIDksIDEwLCAxMSwgRmlyZWZveDogd2lkdGggb2Ygdmlld3BvcnRcbi8vICAgICAgfiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZTogd2lkdGggb2YgaHRtbCwgZXhjbHVkaW5nIGJvcmRlclxuLy8gICAgYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgICB+IFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHdpZHRoIG9mIGJvZHksIGluY2x1ZGluZyBib3JkZXJcbi8vICAgIGJvZHkuY2xpZW50V2lkdGhcbi8vICAgICAgfiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB3aWR0aCBvZiBib2R5LCBleGNsdWRpbmcgYm9yZGVyXG4vLyAgICBib2R5Lm9mZnNldFdpZHRoXG4vLyAgICAgIH4gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogd2lkdGggb2YgYm9keSwgaW5jbHVkaW5nIGJvcmRlclxuLy8gICAgYm9keS5zY3JvbGxXaWR0aFxuLy8gICAgICDinJggU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IHdpZHRoIG9mIHZpZXdwb3J0XG4vLyAgICAgIH4gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB3aWR0aCBvZiBib2R5LCBleGNsdWRpbmcgYm9yZGVyXG5cbi8vIGVsZW1lbnQgd2lkdGggc3R5bGUgd2lkZXIgdGhhbiB2aWV3cG9ydDsgYm9keSBhbmQgaHRtbCB3aWR0aCBzdHlsZXMgYXQgZGVmYXVsdFxuLy8gQlJPV1NFUiBCRUhBVklPUjogaHRtbCBhbmQgYm9keSBib3JkZXIgZXh0ZW5kIHRvIHdpZHRoIG9mIHZpZXdwb3J0IGFuZCBub3QgYmV5b25kIChleGNlcHQgb24gTW9iaWxlIFNhZmFyaSlcbi8vIENvcnJlY3QgcmVzdWx0IGlzIGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlci1sZWZ0ICsgaHRtbCBib3JkZXItbGVmdCAoZXhjZXB0IG9uIE1vYmlsZSBTYWZhcmkpXG4vLyBNb2JpbGUgU2FmYXJpIHVzZXMgYSBsYXlvdXQgdmlld3BvcnQsIHNvIGl0J3MgZXhwZWN0ZWQgdG8gaW5jbHVkZSBib2R5IGJvcmRlci1yaWdodCBhbmQgaHRtbCBib3JkZXItcmlnaHQuXG4vLyAgICBodG1sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoXG4vLyAgICBodG1sLmNsaWVudFdpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoXG4vLyAgICBodG1sLm9mZnNldFdpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoXG4vLyAgICBodG1sLnNjcm9sbFdpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICDinJggU2FmYXJpLCBDaHJvbWU6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlci1sZWZ0IChCVVQgTk9UIGh0bWwgYm9yZGVyLWxlZnQpXG4vLyAgICAgIOKclCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlci1sZWZ0ICsgaHRtbCBib3JkZXItbGVmdFxuLy8gICAgYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgICB+IE1vYmlsZSBTYWZhcmk6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoIC0gaHRtbCBib3JkZXJcbi8vICAgIGJvZHkuY2xpZW50V2lkdGhcbi8vICAgICAgfiBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoXG4vLyAgICAgIH4gU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogdmlld3BvcnQgd2lkdGggLSBodG1sIGJvcmRlciAtIGJvZHkgYm9yZGVyXG4vLyAgICBib2R5Lm9mZnNldFdpZHRoXG4vLyAgICAgIH4gTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyXG4vLyAgICAgIH4gU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogdmlld3BvcnQgd2lkdGggLSBodG1sIGJvcmRlclxuLy8gICAgYm9keS5zY3JvbGxXaWR0aFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyICsgaHRtbCBib3JkZXJcbi8vICAgICAg4pyUIFNhZmFyaSwgQ2hyb21lOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXItbGVmdCArIGh0bWwgYm9yZGVyLWxlZnQgKG1hdGNoZXMgYWN0dWFsIGJyb3dzZXIpXG4vLyAgICAgIH4gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBlbGVtZW50IHdpZHRoXG5cbi8vIFRFU1QgUkVTVUxUUzogSEVJR0hUXG4vLyAgIOKclCA9IGNvcnJlY3QgYW5zd2VyXG4vLyAgIOKcmCA9IGluY29ycmVjdCBhbnN3ZXIgYW5kIGRpdmVyZ2VzIGZyb20gc3BlY1xuLy8gICB+ID0gaW5jb3JyZWN0IGFuc3dlciwgYnV0IG1hdGNoZXMgc3BlY1xuXG4vLyBodG1sIGhlaWdodCBzdHlsZSBzbWFsbGVyIHRoYW4gdmlld3BvcnQgaGVpZ2h0OyBib2R5IGhlaWdodCBzdHlsZSBzbWFsbGVyIHRoYW4gaHRtbCBoZWlnaHQgc3R5bGVcbi8vICBOT1RFOiBUaGVzZSB0ZXN0cyB3ZXJlIGNvbmR1Y3RlZCB3aGVuIGNvcnJlY3QgcmVzdWx0IHdhcyBoZWlnaHQgb2Ygdmlld3BvcnQuXG4vLyAgICBodG1sLmNsaWVudEhlaWdodFxuLy8gICAgICDinJQgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogaGVpZ2h0IG9mIHZpZXdwb3J0XG5cbi8vIGVsZW1lbnQgaGVpZ2h0IHN0eWxlIHRhbGxlciB0aGFuIHZpZXdwb3J0OyBib2R5IGFuZCBodG1sIHdpZHRoIHN0eWxlcyBhdCBkZWZhdWx0XG4vLyBCUk9XU0VSIEJFSEFWSU9SOiBodG1sIGFuZCBib2R5IGJvcmRlciBlbmNsb3NlIGVudGlyZSBlbGVtZW50XG4vLyBDb3JyZWN0IHJlc3VsdCBpcyBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXItdG9wICsgaHRtbCBib3JkZXItdG9wICsgYm9keSBib3JkZXItYm90dG9tICsgaHRtbCBib3JkZXItYm90dG9tXG4vLyAgICBodG1sLmNsaWVudEhlaWdodFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCBoZWlnaHQgKyBhbGwgYm9yZGVyc1xuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGhlaWdodCBvZiB2aWV3cG9ydFxuLy8gICAgaHRtbC5zY3JvbGxIZWlnaHRcbi8vICAgICAg4pyUIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogZWxlbWVudCBoZWlnaHQgKyBhbGwgYm9yZGVyc1xuLy8gICAgICDinJggU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IGVsZW1lbnQgaGVpZ2h0ICsgaHRtbCBib3JkZXItYm90dG9tXG4vLyAgICBib2R5LnNjcm9sbEhlaWdodFxuLy8gICAgICDinJQgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IGVsZW1lbnQgaGVpZ2h0ICsgYWxsIGJvcmRlcnNcbi8vICAgICAgfiBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGVsZW1lbnQgaGVpZ2h0IChib2R5IGhlaWdodCAtIGJvZHkgYm9yZGVyKVxuZnVuY3Rpb24gcGFnZVNpemUoZG9jdW1lbnQpIHtcblx0dmFyIGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cdHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcblxuLy8gQkVTVCBXSURUSCBBTlNXRVIgU08gRkFSIChBU1NVTUlORyBWSUVXUE9SVCBJUyBNSU5JTVVNIEFOU1dFUik6XG5cdHZhciB3aWR0aCA9IE1hdGgubWF4KGJvZHkuc2Nyb2xsV2lkdGgsIGh0bWwuc2Nyb2xsV2lkdGgpO1xuXG4vLyBCRVNUIEhFSUdIVCBBTlNXRVIgU08gRkFSIChBU1NVTUlORyBWSUVXUE9SVCBJUyBNSU5JTVVNIEFOU1dFUik6XG5cdHZhciBoZWlnaHQgPSBNYXRoLm1heChib2R5LnNjcm9sbEhlaWdodCwgaHRtbC5zY3JvbGxIZWlnaHQpO1xuXG5cdHJldHVybiB7XG5cdFx0d2lkdGg6IHdpZHRoLFxuXHRcdGhlaWdodDogaGVpZ2h0XG5cdH07XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG4vKmVzbGludCBuZXctY2FwOiBcIm9mZlwiICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBvb3AgPSByZXF1aXJlKFwiLi4vdXRpbC9vb3AuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xuXG4vLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbmZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24oKSB7XG5cdHJldHVybiByZXF1aXJlKFwiLi9yZWxhdGl2ZV9wb3NpdGlvbi5qc1wiKTtcbn1cbmZ1bmN0aW9uIEFic29sdXRlUG9zaXRpb24oKSB7XG5cdHJldHVybiByZXF1aXJlKFwiLi9hYnNvbHV0ZV9wb3NpdGlvbi5qc1wiKTtcbn1cbmZ1bmN0aW9uIFNwYW4oKSB7XG5cdHJldHVybiByZXF1aXJlKFwiLi9zcGFuLmpzXCIpO1xufVxuXG52YXIgWF9ESU1FTlNJT04gPSBcIlhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwiWVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBvc2l0aW9uRGVzY3JpcHRvcihkaW1lbnNpb24pIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXHRlbnN1cmUudW5yZWFjaGFibGUoXCJQb3NpdGlvbkRlc2NyaXB0b3IgaXMgYWJzdHJhY3QgYW5kIHNob3VsZCBub3QgYmUgY29uc3RydWN0ZWQgZGlyZWN0bHkuXCIpO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcbk1lLmV4dGVuZCA9IG9vcC5leHRlbmRGbihNZSk7XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihkaW1lbnNpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3Rvcnkoc2VsZikge1xuXHRcdC8vIF9wZGJjOiBcIlBvc2l0aW9uRGVzY3JpcHRvciBiYXNlIGNsYXNzLlwiIEFuIGF0dGVtcHQgdG8gcHJldmVudCBuYW1lIGNvbmZsaWN0cy5cblx0XHRzZWxmLl9wZGJjID0geyBkaW1lbnNpb246IGRpbWVuc2lvbiB9O1xuXHR9O1xufVxuXG5NZS54ID0gZmFjdG9yeUZuKFhfRElNRU5TSU9OKTtcbk1lLnkgPSBmYWN0b3J5Rm4oWV9ESU1FTlNJT04pO1xuXG5NZS5wcm90b3R5cGUuY3JlYXRlU2hvdWxkID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0dmFyIG5vWCA9IFBvc2l0aW9uLm5vWCgpO1xuXHR2YXIgbm9ZID0gUG9zaXRpb24ubm9ZKCk7XG5cblx0dmFyIHNob3VsZCA9IERlc2NyaXB0b3IucHJvdG90eXBlLmNyZWF0ZVNob3VsZC5jYWxsKHRoaXMpO1xuXHRzaG91bGQuYmVBYm92ZSA9IGFzc2VydEZuKFwiYmVBYm92ZVwiLCBcImJlTGVmdE9mXCIsIFlfRElNRU5TSU9OLCBmYWxzZSk7XG5cdHNob3VsZC5iZUJlbG93ID0gYXNzZXJ0Rm4oXCJiZUJlbG93XCIsIFwiYmVSaWdodE9mXCIsIFlfRElNRU5TSU9OLCB0cnVlKTtcblx0c2hvdWxkLmJlTGVmdE9mID0gYXNzZXJ0Rm4oXCJiZUxlZnRPZlwiLCBcImJlQWJvdmVcIiwgWF9ESU1FTlNJT04sIGZhbHNlKTtcblx0c2hvdWxkLmJlUmlnaHRPZiA9IGFzc2VydEZuKFwiYmVSaWdodE9mXCIsIFwiYmVCZWxvd1wiLCBYX0RJTUVOU0lPTiwgdHJ1ZSk7XG5cdHJldHVybiBzaG91bGQ7XG5cblx0ZnVuY3Rpb24gYXNzZXJ0Rm4oZnVuY3Rpb25OYW1lLCBvdGhlckF4aXNOYW1lLCBkaW1lbnNpb24sIHNob3VsZEJlQmlnZ2VyKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdFx0XHRzZWxmLmRvQXNzZXJ0aW9uKGV4cGVjdGVkLCBtZXNzYWdlLCBmdW5jdGlvbihhY3R1YWxWYWx1ZSwgZXhwZWN0ZWRWYWx1ZSwgZXhwZWN0ZWREZXNjLCBtZXNzYWdlKSB7XG5cdFx0XHRcdGlmIChzZWxmLl9wZGJjLmRpbWVuc2lvbiAhPT0gZGltZW5zaW9uKSB7XG5cdFx0XHRcdFx0dGhyb3dDb29yZGluYXRlRXJyb3IoZnVuY3Rpb25OYW1lLCBvdGhlckF4aXNOYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZXhwZWN0ZWRWYWx1ZS5pc05vbmUoKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIidleHBlY3RlZCcgdmFsdWUgaXMgbm90IHJlbmRlcmVkLCBzbyByZWxhdGl2ZSBjb21wYXJpc29ucyBhcmVuJ3QgcG9zc2libGUuXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGV4cGVjdGVkTXNnID0gKHNob3VsZEJlQmlnZ2VyID8gXCJtb3JlIHRoYW5cIiA6IFwibGVzcyB0aGFuXCIpICsgXCIgXCIgKyBleHBlY3RlZERlc2M7XG5cblx0XHRcdFx0aWYgKGFjdHVhbFZhbHVlLmlzTm9uZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yTWVzc2FnZShtZXNzYWdlLCBcInJlbmRlcmVkXCIsIGV4cGVjdGVkTXNnLCBhY3R1YWxWYWx1ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgY29tcGFyZSA9IGFjdHVhbFZhbHVlLmNvbXBhcmUoZXhwZWN0ZWRWYWx1ZSk7XG5cdFx0XHRcdGlmICgoc2hvdWxkQmVCaWdnZXIgJiYgY29tcGFyZSA8PSAwKSB8fCAoIXNob3VsZEJlQmlnZ2VyICYmIGNvbXBhcmUgPj0gMCkpIHtcblx0XHRcdFx0XHR2YXIgbnVkZ2UgPSBzaG91bGRCZUJpZ2dlciA/IC0xIDogMTtcblx0XHRcdFx0XHR2YXIgc2hvdWxkQmUgPSBcImF0IGxlYXN0IFwiICsgZXhwZWN0ZWRWYWx1ZS5kaWZmKHNlbGYucGx1cyhudWRnZSkudmFsdWUoKSk7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yTWVzc2FnZShtZXNzYWdlLCBzaG91bGRCZSwgZXhwZWN0ZWRNc2csIGFjdHVhbFZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIHRocm93Q29vcmRpbmF0ZUVycm9yKGZ1bmN0aW9uTmFtZSwgcmVjb21tZW5kZWROYW1lKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XCJDYW4ndCB1c2UgJ3Nob3VsZC5cIiArIGZ1bmN0aW9uTmFtZSArIFwiKCknIG9uIFwiICsgc2VsZi5fcGRiYy5kaW1lbnNpb24gK1xuXHRcdFx0XCIgY29vcmRpbmF0ZXMuIERpZCB5b3UgbWVhbiAnc2hvdWxkLlwiICsgcmVjb21tZW5kZWROYW1lICsgXCIoKSc/XCJcblx0XHQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZXJyb3JNZXNzYWdlKG1lc3NhZ2UsIHNob3VsZEJlLCBleHBlY3RlZCwgYWN0dWFsKSB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UgKyBzZWxmICsgXCIgc2hvdWxkIGJlIFwiICsgc2hvdWxkQmUgKyBcIi5cXG5cIiArXG5cdFx0XHRcIiAgRXhwZWN0ZWQ6IFwiICsgZXhwZWN0ZWQgKyBcIlxcblwiICtcblx0XHRcdFwiICBCdXQgd2FzOiAgXCIgKyBhY3R1YWw7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24oYW1vdW50KSB7XG5cdGlmICh0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uKCkucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbigpLmRvd24odGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uKGFtb3VudCkge1xuXHRpZiAodGhpcy5fcGRiYy5kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbigpLmxlZnQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbigpLnVwKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG8gPSBmdW5jdGlvbihwb3NpdGlvbiwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtbIE1lLCBOdW1iZXIgXSwgWyB1bmRlZmluZWQsIFN0cmluZyBdXSk7XG5cblx0aWYgKHR5cGVvZiBwb3NpdGlvbiA9PT0gXCJudW1iZXJcIikge1xuXHRcdGlmICh0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHBvc2l0aW9uID0gQWJzb2x1dGVQb3NpdGlvbigpLngocG9zaXRpb24pO1xuXHRcdGVsc2UgcG9zaXRpb24gPSBBYnNvbHV0ZVBvc2l0aW9uKCkueShwb3NpdGlvbik7XG5cdH1cblx0aWYgKHRoaXMuX3BkYmMuZGltZW5zaW9uICE9PSBwb3NpdGlvbi5fcGRiYy5kaW1lbnNpb24pIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBzcGFuIGJldHdlZW4gYW4gWCBjb29yZGluYXRlIGFuZCBhIFkgY29vcmRpbmF0ZVwiKTtcblx0fVxuXG5cdGlmIChuaWNrbmFtZSA9PT0gdW5kZWZpbmVkKSBuaWNrbmFtZSA9IFwic3BhbiBmcm9tIFwiICsgdGhpcyArIFwiIHRvIFwiICsgcG9zaXRpb247XG5cdHJldHVybiBTcGFuKCkuY3JlYXRlKHRoaXMsIHBvc2l0aW9uLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uKGFyZywgdHlwZSkge1xuXHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiB0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gPyBQb3NpdGlvbi54KGFyZykgOiBQb3NpdGlvbi55KGFyZyk7XG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0aWYgKGFyZyA9PT0gXCJub25lXCIpIHJldHVybiB0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gPyBQb3NpdGlvbi5ub1goKSA6IFBvc2l0aW9uLm5vWSgpO1xuXHRcdFx0ZWxzZSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDogcmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbkRlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4uL3ZhbHVlcy92YWx1ZS5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9zaXplLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xudmFyIFBMVVMgPSAxO1xudmFyIE1JTlVTID0gLTE7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVsYXRpdmVQb3NpdGlvbihkaW1lbnNpb24sIGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgcmVsYXRpdmVBbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBOdW1iZXIsIERlc2NyaXB0b3IsIFtOdW1iZXIsIERlc2NyaXB0b3IsIFZhbHVlXSBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKGRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIFBvc2l0aW9uRGVzY3JpcHRvci54KHRoaXMpO1xuXHRlbHNlIGlmIChkaW1lbnNpb24gPT09IFlfRElNRU5TSU9OKSBQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0ZWxzZSBlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXHR0aGlzLl9yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblxuXHRpZiAodHlwZW9mIHJlbGF0aXZlQW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0aWYgKHJlbGF0aXZlQW1vdW50IDwgMCkgdGhpcy5fZGlyZWN0aW9uICo9IC0xO1xuXHRcdHRoaXMuX2Ftb3VudCA9IFNpemUuY3JlYXRlKE1hdGguYWJzKHJlbGF0aXZlQW1vdW50KSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gcmVsYXRpdmVBbW91bnQ7XG5cdH1cbn07XG5Qb3NpdGlvbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUucmlnaHQgPSBjcmVhdGVGbihYX0RJTUVOU0lPTiwgUExVUyk7XG5NZS5kb3duID0gY3JlYXRlRm4oWV9ESU1FTlNJT04sIFBMVVMpO1xuTWUubGVmdCA9IGNyZWF0ZUZuKFhfRElNRU5TSU9OLCBNSU5VUyk7XG5NZS51cCA9IGNyZWF0ZUZuKFlfRElNRU5TSU9OLCBNSU5VUyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZuKGRpbWVuc2lvbiwgZGlyZWN0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBjcmVhdGUocmVsYXRpdmVUbywgcmVsYXRpdmVBbW91bnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGRpbWVuc2lvbiwgZGlyZWN0aW9uLCByZWxhdGl2ZVRvLCByZWxhdGl2ZUFtb3VudCk7XG5cdH07XG59XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlVmFsdWUgPSB0aGlzLl9yZWxhdGl2ZVRvLnZhbHVlKCk7XG5cdHZhciByZWxhdGl2ZVZhbHVlID0gdGhpcy5fYW1vdW50LnZhbHVlKCk7XG5cblx0aWYgKHRoaXMuX2RpcmVjdGlvbiA9PT0gUExVUykgcmV0dXJuIGJhc2VWYWx1ZS5wbHVzKHJlbGF0aXZlVmFsdWUpO1xuXHRlbHNlIHJldHVybiBiYXNlVmFsdWUubWludXMocmVsYXRpdmVWYWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgYmFzZSA9IHRoaXMuX3JlbGF0aXZlVG8udG9TdHJpbmcoKTtcblx0aWYgKHRoaXMuX2Ftb3VudC5lcXVhbHMoU2l6ZS5jcmVhdGUoMCkpKSByZXR1cm4gYmFzZTtcblxuXHR2YXIgcmVsYXRpb24gPSB0aGlzLl9hbW91bnQudG9TdHJpbmcoKTtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJlbGF0aW9uICs9ICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpID8gXCIgdG8gcmlnaHQgb2YgXCIgOiBcIiB0byBsZWZ0IG9mIFwiO1xuXHRlbHNlIHJlbGF0aW9uICs9ICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpID8gXCIgYmVsb3cgXCIgOiBcIiBhYm92ZSBcIjtcblxuXHRyZXR1cm4gcmVsYXRpb24gKyBiYXNlO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9zaXplLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemVEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vc2l6ZV9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4uL3ZhbHVlcy92YWx1ZS5qc1wiKTtcbnZhciBTaXplTXVsdGlwbGUgPSByZXF1aXJlKFwiLi9zaXplX211bHRpcGxlLmpzXCIpO1xuXG52YXIgUExVUyA9IDE7XG52YXIgTUlOVVMgPSAtMTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBSZWxhdGl2ZVNpemUoZGlyZWN0aW9uLCByZWxhdGl2ZVRvLCBhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyLCBEZXNjcmlwdG9yLCBbTnVtYmVyLCBEZXNjcmlwdG9yLCBWYWx1ZV0gXSk7XG5cblx0dGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXG5cdHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cblx0aWYgKHR5cGVvZiBhbW91bnQgPT09IFwibnVtYmVyXCIpIHtcblx0XHR0aGlzLl9hbW91bnQgPSBTaXplLmNyZWF0ZShNYXRoLmFicyhhbW91bnQpKTtcblx0XHRpZiAoYW1vdW50IDwgMCkgdGhpcy5fZGlyZWN0aW9uICo9IC0xO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcblx0fVxufTtcblNpemVEZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLmxhcmdlciA9IGZhY3RvcnlGbihQTFVTKTtcbk1lLnNtYWxsZXIgPSBmYWN0b3J5Rm4oTUlOVVMpO1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgYmFzZVZhbHVlID0gdGhpcy5fcmVsYXRpdmVUby52YWx1ZSgpO1xuXHR2YXIgcmVsYXRpdmVWYWx1ZSA9IHRoaXMuX2Ftb3VudC52YWx1ZSgpO1xuXG5cdGlmICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpIHJldHVybiBiYXNlVmFsdWUucGx1cyhyZWxhdGl2ZVZhbHVlKTtcblx0ZWxzZSByZXR1cm4gYmFzZVZhbHVlLm1pbnVzKHJlbGF0aXZlVmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9hbW91bnQuZXF1YWxzKFNpemUuY3JlYXRlKDApKSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIHJlbGF0aW9uID0gdGhpcy5fYW1vdW50LnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpIHJlbGF0aW9uICs9IFwiIGxhcmdlciB0aGFuIFwiO1xuXHRlbHNlIHJlbGF0aW9uICs9IFwiIHNtYWxsZXIgdGhhbiBcIjtcblxuXHRyZXR1cm4gcmVsYXRpb24gKyBiYXNlO1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKGRpcmVjdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShyZWxhdGl2ZVRvLCBhbW91bnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgYW1vdW50KTtcblx0fTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG4vKmVzbGludCBuZXctY2FwOiBcIm9mZlwiICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBvb3AgPSByZXF1aXJlKFwiLi4vdXRpbC9vb3AuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcblxuZnVuY3Rpb24gUmVsYXRpdmVTaXplKCkge1xuXHRyZXR1cm4gcmVxdWlyZShcIi4vcmVsYXRpdmVfc2l6ZS5qc1wiKTsgICBcdC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcbn1cblxuZnVuY3Rpb24gU2l6ZU11bHRpcGxlKCkge1xuXHRyZXR1cm4gcmVxdWlyZShcIi4vc2l6ZV9tdWx0aXBsZS5qc1wiKTsgICBcdC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcbn1cblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaXplRGVzY3JpcHRvcigpIHtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiU2l6ZURlc2NyaXB0b3IgaXMgYWJzdHJhY3QgYW5kIHNob3VsZCBub3QgYmUgY29uc3RydWN0ZWQgZGlyZWN0bHkuXCIpO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcbk1lLmV4dGVuZCA9IG9vcC5leHRlbmRGbihNZSk7XG5cbk1lLnByb3RvdHlwZS5jcmVhdGVTaG91bGQgPSBmdW5jdGlvbigpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHZhciBzaG91bGQgPSBEZXNjcmlwdG9yLnByb3RvdHlwZS5jcmVhdGVTaG91bGQuY2FsbCh0aGlzKTtcblx0c2hvdWxkLmJlQmlnZ2VyVGhhbiA9IGFzc2VydEZuKC0xLCB0cnVlKTtcblx0c2hvdWxkLmJlU21hbGxlclRoYW4gPSBhc3NlcnRGbigxLCBmYWxzZSk7XG5cdHJldHVybiBzaG91bGQ7XG5cblx0ZnVuY3Rpb24gYXNzZXJ0Rm4oZGlyZWN0aW9uLCBzaG91bGRCZUJpZ2dlcikge1xuXHRcdHJldHVybiBmdW5jdGlvbihleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0c2VsZi5kb0Fzc2VydGlvbihleHBlY3RlZCwgbWVzc2FnZSwgZnVuY3Rpb24oYWN0dWFsVmFsdWUsIGV4cGVjdGVkVmFsdWUsIGV4cGVjdGVkRGVzYywgbWVzc2FnZSkge1xuXHRcdFx0XHRpZiAoZXhwZWN0ZWRWYWx1ZS5pc05vbmUoKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIidleHBlY3RlZCcgdmFsdWUgaXMgbm90IHJlbmRlcmVkLCBzbyByZWxhdGl2ZSBjb21wYXJpc29ucyBhcmVuJ3QgcG9zc2libGUuXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGV4cGVjdGVkTXNnID0gKHNob3VsZEJlQmlnZ2VyID8gXCJtb3JlIHRoYW5cIiA6IFwibGVzcyB0aGFuXCIpICsgXCIgXCIgKyBleHBlY3RlZERlc2M7XG5cblx0XHRcdFx0aWYgKGFjdHVhbFZhbHVlLmlzTm9uZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yTWVzc2FnZShtZXNzYWdlLCBcInJlbmRlcmVkXCIsIGV4cGVjdGVkTXNnLCBhY3R1YWxWYWx1ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgY29tcGFyZSA9IGFjdHVhbFZhbHVlLmNvbXBhcmUoZXhwZWN0ZWRWYWx1ZSk7XG5cdFx0XHRcdGlmICgoc2hvdWxkQmVCaWdnZXIgJiYgY29tcGFyZSA8PSAwKSB8fCAoIXNob3VsZEJlQmlnZ2VyICYmIGNvbXBhcmUgPj0gMCkpIHtcblx0XHRcdFx0XHR2YXIgbnVkZ2UgPSBzaG91bGRCZUJpZ2dlciA/IC0xIDogMTtcblx0XHRcdFx0XHR2YXIgc2hvdWxkQmUgPSBcImF0IGxlYXN0IFwiICsgZXhwZWN0ZWRWYWx1ZS5kaWZmKHNlbGYucGx1cyhudWRnZSkudmFsdWUoKSk7XG5cdFx0XHRcdFx0cmV0dXJuIGVycm9yTWVzc2FnZShtZXNzYWdlLCBzaG91bGRCZSwgZXhwZWN0ZWRNc2csIGFjdHVhbFZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGVycm9yTWVzc2FnZShtZXNzYWdlLCBzaG91bGRCZSwgZXhwZWN0ZWQsIGFjdHVhbCkge1xuXHRcdHJldHVybiBtZXNzYWdlICsgc2VsZiArIFwiIHNob3VsZCBiZSBcIiArIHNob3VsZEJlICsgXCIuXFxuXCIgK1xuXHRcdFx0XCIgIEV4cGVjdGVkOiBcIiArIGV4cGVjdGVkICsgXCJcXG5cIiArXG5cdFx0XHRcIiAgQnV0IHdhczogIFwiICsgYWN0dWFsO1xuXHR9XG5cbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0cmV0dXJuIFJlbGF0aXZlU2l6ZSgpLmxhcmdlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdHJldHVybiBSZWxhdGl2ZVNpemUoKS5zbWFsbGVyKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudGltZXMgPSBmdW5jdGlvbiB0aW1lcyhhbW91bnQpIHtcblx0cmV0dXJuIFNpemVNdWx0aXBsZSgpLmNyZWF0ZSh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHRzd2l0Y2godHlwZSkge1xuXHRcdGNhc2UgXCJudW1iZXJcIjogcmV0dXJuIFNpemUuY3JlYXRlKGFyZyk7XG5cdFx0Y2FzZSBcInN0cmluZ1wiOiByZXR1cm4gYXJnID09PSBcIm5vbmVcIiA/IFNpemUuY3JlYXRlTm9uZSgpIDogdW5kZWZpbmVkO1xuXHRcdGRlZmF1bHQ6IHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZURlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9zaXplX2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaXplTXVsdGlwbGUocmVsYXRpdmVUbywgbXVsdGlwbGUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgRGVzY3JpcHRvciwgTnVtYmVyIF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblxuXHR0aGlzLl9yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblx0dGhpcy5fbXVsdGlwbGUgPSBtdWx0aXBsZTtcbn07XG5TaXplRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUocmVsYXRpdmVUbywgbXVsdGlwbGUpIHtcblx0cmV0dXJuIG5ldyBNZShyZWxhdGl2ZVRvLCBtdWx0aXBsZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fcmVsYXRpdmVUby52YWx1ZSgpLnRpbWVzKHRoaXMuX211bHRpcGxlKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBtdWx0aXBsZSA9IHRoaXMuX211bHRpcGxlO1xuXHR2YXIgYmFzZSA9IHRoaXMuX3JlbGF0aXZlVG8udG9TdHJpbmcoKTtcblx0aWYgKG11bHRpcGxlID09PSAxKSByZXR1cm4gYmFzZTtcblxuXHR2YXIgZGVzYztcblx0c3dpdGNoKG11bHRpcGxlKSB7XG5cdFx0Y2FzZSAxLzI6IGRlc2MgPSBcImhhbGYgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS8zOiBkZXNjID0gXCJvbmUtdGhpcmQgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMi8zOiBkZXNjID0gXCJ0d28tdGhpcmRzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvNDogZGVzYyA9IFwib25lLXF1YXJ0ZXIgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy80OiBkZXNjID0gXCJ0aHJlZS1xdWFydGVycyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzU6IGRlc2MgPSBcIm9uZS1maWZ0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAyLzU6IGRlc2MgPSBcInR3by1maWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy81OiBkZXNjID0gXCJ0aHJlZS1maWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNC81OiBkZXNjID0gXCJmb3VyLWZpZnRocyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzY6IGRlc2MgPSBcIm9uZS1zaXh0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSA1LzY6IGRlc2MgPSBcImZpdmUtc2l4dGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvODogZGVzYyA9IFwib25lLWVpZ2h0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAzLzg6IGRlc2MgPSBcInRocmVlLWVpZ2h0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNS84OiBkZXNjID0gXCJmaXZlLWVpZ2h0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNy84OiBkZXNjID0gXCJzZXZlbi1laWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0aWYgKG11bHRpcGxlID4gMSkgZGVzYyA9IG11bHRpcGxlICsgXCIgdGltZXMgXCI7XG5cdFx0XHRlbHNlIGRlc2MgPSAobXVsdGlwbGUgKiAxMDApICsgXCIlIG9mIFwiO1xuXHR9XG5cblx0cmV0dXJuIGRlc2MgKyBiYXNlO1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBTaXplRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3NpemVfZGVzY3JpcHRvci5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9jZW50ZXIuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU3Bhbihmcm9tLCB0bywgZGVzY3JpcHRpb24pIHtcbiAgZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgUG9zaXRpb25EZXNjcmlwdG9yLCBQb3NpdGlvbkRlc2NyaXB0b3IsIFN0cmluZyBdKTtcblxuICB0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cbiAgdGhpcy5jZW50ZXIgPSBDZW50ZXIueChmcm9tLCB0bywgXCJjZW50ZXIgb2YgXCIgKyBkZXNjcmlwdGlvbik7XG4gIHRoaXMubWlkZGxlID0gQ2VudGVyLnkoZnJvbSwgdG8sIFwibWlkZGxlIG9mIFwiICsgZGVzY3JpcHRpb24pO1xuXG4gIHRoaXMuX2Zyb20gPSBmcm9tO1xuICB0aGlzLl90byA9IHRvO1xuICB0aGlzLl9kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xufTtcblNpemVEZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uKGZyb20sIHRvLCBkZXNjcmlwdGlvbikge1xuICByZXR1cm4gbmV3IE1lKGZyb20sIHRvLCBkZXNjcmlwdGlvbik7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcbiAgcmV0dXJuIHRoaXMuX2Zyb20udmFsdWUoKS5kaXN0YW5jZVRvKHRoaXMuX3RvLnZhbHVlKCkpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFZpZXdwb3J0RWRnZShwb3NpdGlvbiwgYnJvd3NpbmdDb250ZXh0KSB7XG5cdHZhciBCcm93c2luZ0NvbnRleHQgPSByZXF1aXJlKFwiLi4vYnJvd3NpbmdfY29udGV4dC5qc1wiKTsgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgQnJvd3NpbmdDb250ZXh0IF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblxuXHRpZiAocG9zaXRpb24gPT09IExFRlQgfHwgcG9zaXRpb24gPT09IFJJR0hUKSBQb3NpdGlvbkRlc2NyaXB0b3IueCh0aGlzKTtcblx0ZWxzZSBpZiAocG9zaXRpb24gPT09IFRPUCB8fCBwb3NpdGlvbiA9PT0gQk9UVE9NKSBQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0ZWxzZSBlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIHBvc2l0aW9uOiBcIiArIHBvc2l0aW9uKTtcblxuXHR0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHR0aGlzLl9icm93c2luZ0NvbnRleHQgPSBicm93c2luZ0NvbnRleHQ7XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgc2Nyb2xsID0gdGhpcy5fYnJvd3NpbmdDb250ZXh0LmdldFJhd1Njcm9sbFBvc2l0aW9uKCk7XG5cdHZhciB4ID0gUG9zaXRpb24ueChzY3JvbGwueCk7XG5cdHZhciB5ID0gUG9zaXRpb24ueShzY3JvbGwueSk7XG5cblx0dmFyIHNpemUgPSB2aWV3cG9ydFNpemUodGhpcy5fYnJvd3NpbmdDb250ZXh0LmNvbnRlbnREb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xuXG5cdHN3aXRjaCh0aGlzLl9wb3NpdGlvbikge1xuXHRcdGNhc2UgVE9QOiByZXR1cm4geTtcblx0XHRjYXNlIFJJR0hUOiByZXR1cm4geC5wbHVzKFBvc2l0aW9uLngoc2l6ZS53aWR0aCkpO1xuXHRcdGNhc2UgQk9UVE9NOiByZXR1cm4geS5wbHVzKFBvc2l0aW9uLnkoc2l6ZS5oZWlnaHQpKTtcblx0XHRjYXNlIExFRlQ6IHJldHVybiB4O1xuXG5cdFx0ZGVmYXVsdDogZW5zdXJlLnVucmVhY2hhYmxlKCk7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fcG9zaXRpb24gKyBcIiBlZGdlIG9mIHZpZXdwb3J0XCI7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoY29udGVudCkge1xuXHRcdHJldHVybiBuZXcgTWUocG9zaXRpb24sIGNvbnRlbnQpO1xuXHR9O1xufVxuXG5cblxuLy8gVVNFRlVMIFJFQURJTkc6IGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvbW9iaWxlL3ZpZXdwb3J0cy5odG1sXG4vLyBhbmQgaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9tb2JpbGUvdmlld3BvcnRzMi5odG1sXG5cbi8vIEJST1dTRVJTIFRFU1RFRDogU2FmYXJpIDYuMi4wIChNYWMgT1MgWCAxMC44LjUpOyBNb2JpbGUgU2FmYXJpIDcuMC4wIChpT1MgNy4xKTsgRmlyZWZveCAzMi4wLjAgKE1hYyBPUyBYIDEwLjgpO1xuLy8gICAgRmlyZWZveCAzMy4wLjAgKFdpbmRvd3MgNyk7IENocm9tZSAzOC4wLjIxMjUgKE1hYyBPUyBYIDEwLjguNSk7IENocm9tZSAzOC4wLjIxMjUgKFdpbmRvd3MgNyk7IElFIDgsIDksIDEwLCAxMVxuXG4vLyBXaWR0aCB0ZWNobmlxdWVzIEkndmUgdHJpZWQ6IChOb3RlOiByZXN1bHRzIGFyZSBkaWZmZXJlbnQgaW4gcXVpcmtzIG1vZGUpXG4vLyBib2R5LmNsaWVudFdpZHRoXG4vLyBib2R5Lm9mZnNldFdpZHRoXG4vLyBib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG4vLyAgICBmYWlscyBvbiBhbGwgYnJvd3NlcnM6IGRvZXNuJ3QgaW5jbHVkZSBtYXJnaW5cbi8vIGJvZHkuc2Nyb2xsV2lkdGhcbi8vICAgIHdvcmtzIG9uIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lXG4vLyAgICBmYWlscyBvbiBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGRvZXNuJ3QgaW5jbHVkZSBtYXJnaW5cbi8vIGh0bWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcbi8vIGh0bWwub2Zmc2V0V2lkdGhcbi8vICAgIHdvcmtzIG9uIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94XG4vLyAgICBmYWlscyBvbiBJRSA4LCA5LCAxMDogaW5jbHVkZXMgc2Nyb2xsYmFyXG4vLyBodG1sLnNjcm9sbFdpZHRoXG4vLyBodG1sLmNsaWVudFdpZHRoXG4vLyAgICBXT1JLUyEgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMVxuXG4vLyBIZWlnaHQgdGVjaG5pcXVlcyBJJ3ZlIHRyaWVkOiAoTm90ZSB0aGF0IHJlc3VsdHMgYXJlIGRpZmZlcmVudCBpbiBxdWlya3MgbW9kZSlcbi8vIGJvZHkuY2xpZW50SGVpZ2h0XG4vLyBib2R5Lm9mZnNldEhlaWdodFxuLy8gYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHRcbi8vICAgIGZhaWxzIG9uIGFsbCBicm93c2Vyczogb25seSBpbmNsdWRlcyBoZWlnaHQgb2YgY29udGVudFxuLy8gYm9keSBnZXRDb21wdXRlZFN0eWxlKFwiaGVpZ2h0XCIpXG4vLyAgICBmYWlscyBvbiBhbGwgYnJvd3NlcnM6IElFOCByZXR1cm5zIFwiYXV0b1wiOyBvdGhlcnMgb25seSBpbmNsdWRlIGhlaWdodCBvZiBjb250ZW50XG4vLyBib2R5LnNjcm9sbEhlaWdodFxuLy8gICAgd29ya3Mgb24gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU7XG4vLyAgICBmYWlscyBvbiBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcbi8vIGh0bWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0XG4vLyBodG1sLm9mZnNldEhlaWdodFxuLy8gICAgd29ya3Mgb24gSUUgOCwgOSwgMTBcbi8vICAgIGZhaWxzIG9uIElFIDExLCBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZTogb25seSBpbmNsdWRlcyBoZWlnaHQgb2YgY29udGVudFxuLy8gaHRtbC5zY3JvbGxIZWlnaHRcbi8vICAgIHdvcmtzIG9uIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMVxuLy8gICAgZmFpbHMgb24gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcbi8vIGh0bWwuY2xpZW50SGVpZ2h0XG4vLyAgICBXT1JLUyEgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMVxuZnVuY3Rpb24gdmlld3BvcnRTaXplKGh0bWxFbGVtZW50KSB7XG5cdHJldHVybiB7XG5cdFx0d2lkdGg6IGh0bWxFbGVtZW50LmNsaWVudFdpZHRoLFxuXHRcdGhlaWdodDogaHRtbEVsZW1lbnQuY2xpZW50SGVpZ2h0XG5cdH07XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi91dGlsL3NoaW0uanNcIik7XG52YXIgY2FtZWxjYXNlID0gcmVxdWlyZShcIi4uL3ZlbmRvci9jYW1lbGNhc2UtMS4wLjEtbW9kaWZpZWQuanNcIik7XG52YXIgRWxlbWVudFJlbmRlcmVkID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZWxlbWVudF9yZW5kZXJlZC5qc1wiKTtcbnZhciBFbGVtZW50RWRnZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfZWRnZS5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9jZW50ZXIuanNcIik7XG52YXIgU3BhbiA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL3NwYW4uanNcIik7XG52YXIgQXNzZXJ0YWJsZSA9IHJlcXVpcmUoXCIuL2Fzc2VydGFibGUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUUVsZW1lbnQoZG9tRWxlbWVudCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0LCBTdHJpbmcgXSk7XG5cblx0dGhpcy5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XG5cdHRoaXMuX25pY2tuYW1lID0gbmlja25hbWU7XG5cblx0Ly8gcHJvcGVydGllc1xuXHR0aGlzLnRvcCA9IEVsZW1lbnRFZGdlLnRvcCh0aGlzKTtcblx0dGhpcy5yaWdodCA9IEVsZW1lbnRFZGdlLnJpZ2h0KHRoaXMpO1xuXHR0aGlzLmJvdHRvbSA9IEVsZW1lbnRFZGdlLmJvdHRvbSh0aGlzKTtcblx0dGhpcy5sZWZ0ID0gRWxlbWVudEVkZ2UubGVmdCh0aGlzKTtcblxuXHR0aGlzLmNlbnRlciA9IENlbnRlci54KHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJjZW50ZXIgb2YgXCIgKyB0aGlzKTtcblx0dGhpcy5taWRkbGUgPSBDZW50ZXIueSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwibWlkZGxlIG9mIFwiICsgdGhpcyk7XG5cblx0dGhpcy53aWR0aCA9IFNwYW4uY3JlYXRlKHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJ3aWR0aCBvZiBcIiArIHRoaXMpO1xuXHR0aGlzLmhlaWdodCA9IFNwYW4uY3JlYXRlKHRoaXMudG9wLCB0aGlzLmJvdHRvbSwgXCJoZWlnaHQgb2YgXCIgKyB0aGlzKTtcblxuXHR0aGlzLnJlbmRlcmVkID0gRWxlbWVudFJlbmRlcmVkLmNyZWF0ZSh0aGlzKTtcbn07XG5Bc3NlcnRhYmxlLmV4dGVuZChNZSk7XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uKGRvbUVsZW1lbnQsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgWyB1bmRlZmluZWQsIFN0cmluZyBdIF0pO1xuXG5cdGlmIChuaWNrbmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRvbUVsZW1lbnQuaWQgIT09IFwiXCIpIG5pY2tuYW1lID0gXCIjXCIgKyBkb21FbGVtZW50LmlkO1xuXHRcdGVsc2UgaWYgKGRvbUVsZW1lbnQuY2xhc3NOYW1lICE9PSBcIlwiKSBuaWNrbmFtZSA9IFwiLlwiICsgZG9tRWxlbWVudC5jbGFzc05hbWUuc3BsaXQoL1xccysvKS5qb2luKFwiLlwiKTtcblx0XHRlbHNlIG5pY2tuYW1lID0gXCI8XCIgKyBkb21FbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSArIFwiPlwiO1xuXHR9XG5cdHJldHVybiBuZXcgTWUoZG9tRWxlbWVudCwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1N0eWxlID0gZnVuY3Rpb24oc3R5bGVOYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbU3RyaW5nXSk7XG5cblx0dmFyIHN0eWxlcztcblx0dmFyIHJlc3VsdDtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIGdldENvbXB1dGVkU3R5bGUoKVxuXHRpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcblx0XHQvLyBXT1JLQVJPVU5EIEZpcmVmb3ggNDAuMC4zOiBtdXN0IHVzZSBmcmFtZSdzIGNvbnRlbnRXaW5kb3cgKHJlZiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xMjA0MDYyKVxuXHRcdHN0eWxlcyA9IHRoaXMuY29udGV4dCgpLmNvbnRlbnRXaW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLl9kb21FbGVtZW50KTtcblx0XHRyZXN1bHQgPSBzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHN0eWxlcyA9IHRoaXMuX2RvbUVsZW1lbnQuY3VycmVudFN0eWxlO1xuXHRcdHJlc3VsdCA9IHN0eWxlc1tjYW1lbGNhc2Uoc3R5bGVOYW1lKV07XG5cdH1cblx0aWYgKHJlc3VsdCA9PT0gbnVsbCB8fCByZXN1bHQgPT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gXCJcIjtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gVGV4dFJlY3RhbmdsZS5oZWlnaHQgb3IgLndpZHRoXG5cdHZhciByZWN0ID0gdGhpcy5fZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0cmV0dXJuIHtcblx0XHRsZWZ0OiByZWN0LmxlZnQsXG5cdFx0cmlnaHQ6IHJlY3QucmlnaHQsXG5cdFx0d2lkdGg6IHJlY3Qud2lkdGggIT09IHVuZGVmaW5lZCA/IHJlY3Qud2lkdGggOiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LFxuXG5cdFx0dG9wOiByZWN0LnRvcCxcblx0XHRib3R0b206IHJlY3QuYm90dG9tLFxuXHRcdGhlaWdodDogcmVjdC5oZWlnaHQgIT09IHVuZGVmaW5lZCA/IHJlY3QuaGVpZ2h0IDogcmVjdC5ib3R0b20gLSByZWN0LnRvcFxuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLmNhbGN1bGF0ZVBpeGVsVmFsdWUgPSBmdW5jdGlvbihzaXplU3RyaW5nKSB7XG5cdHZhciBkb20gPSB0aGlzLl9kb21FbGVtZW50O1xuXHRpZiAoZG9tLnJ1bnRpbWVTdHlsZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gaWU4V29ya2Fyb3VuZCgpO1xuXG5cdHZhciByZXN1bHQ7XG5cdHZhciBzdHlsZSA9IGRvbS5zdHlsZTtcblx0dmFyIG9sZFBvc2l0aW9uID0gc3R5bGUucG9zaXRpb247XG5cdHZhciBvbGRMZWZ0ID0gc3R5bGUubGVmdDtcblxuXHRzdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0c3R5bGUubGVmdCA9IHNpemVTdHJpbmc7XG5cdHJlc3VsdCA9IHBhcnNlRmxvYXQodGhpcy5nZXRSYXdTdHlsZShcImxlZnRcIikpOyAgICAvLyBwYXJzZUludCBzdHJpcHMgb2ZmICdweCcgdmFsdWVcblxuXHRzdHlsZS5wb3NpdGlvbiA9IG9sZFBvc2l0aW9uO1xuXHRzdHlsZS5sZWZ0ID0gb2xkTGVmdDtcblx0cmV0dXJuIHJlc3VsdDtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IGdldFJhd1N0eWxlKCkgZG9lc24ndCBub3JtYWxpemUgdmFsdWVzIHRvIHB4XG5cdC8vIEJhc2VkIG9uIGNvZGUgYnkgRGVhbiBFZHdhcmRzOiBodHRwOi8vZGlzcS51cy9wL215bDk5eFxuXHRmdW5jdGlvbiBpZThXb3JrYXJvdW5kKCkge1xuXHRcdHZhciBydW50aW1lU3R5bGVMZWZ0ID0gZG9tLnJ1bnRpbWVTdHlsZS5sZWZ0O1xuXHRcdHZhciBzdHlsZUxlZnQgPSBkb20uc3R5bGUubGVmdDtcblxuXHRcdGRvbS5ydW50aW1lU3R5bGUubGVmdCA9IGRvbS5jdXJyZW50U3R5bGUubGVmdDtcblx0XHRkb20uc3R5bGUubGVmdCA9IHNpemVTdHJpbmc7XG5cdFx0cmVzdWx0ID0gZG9tLnN0eWxlLnBpeGVsTGVmdDtcblxuXHRcdGRvbS5ydW50aW1lU3R5bGUubGVmdCA9IHJ1bnRpbWVTdHlsZUxlZnQ7XG5cdFx0ZG9tLnN0eWxlLmxlZnQgPSBzdHlsZUxlZnQ7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufTtcblxuTWUucHJvdG90eXBlLnBhcmVudCA9IGZ1bmN0aW9uKG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbWyB1bmRlZmluZWQsIFN0cmluZyBdXSk7XG5cblx0dmFyIHBhcmVudEJvZHkgPSB0aGlzLmNvbnRleHQoKS5ib2R5KCk7XG5cdGlmICh0aGlzLmVxdWFscyhwYXJlbnRCb2R5KSkgcmV0dXJuIG51bGw7XG5cblx0dmFyIHBhcmVudCA9IHRoaXMuX2RvbUVsZW1lbnQucGFyZW50RWxlbWVudDtcblx0aWYgKHBhcmVudCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cblx0cmV0dXJuIE1lLmNyZWF0ZShwYXJlbnQsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihodG1sLCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFsgdW5kZWZpbmVkLCBTdHJpbmcgXSBdKTtcblxuXHR2YXIgdGVtcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHR0ZW1wRWxlbWVudC5pbm5lckhUTUwgPSBzaGltLlN0cmluZy50cmltKGh0bWwpO1xuXHRlbnN1cmUudGhhdChcblx0XHR0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSxcblx0XHRcIkV4cGVjdGVkIG9uZSBlbGVtZW50LCBidXQgZ290IFwiICsgdGVtcEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggKyBcIiAoXCIgKyBodG1sICsgXCIpXCJcblx0KTtcblxuXHR2YXIgaW5zZXJ0ZWRFbGVtZW50ID0gdGVtcEVsZW1lbnQuY2hpbGROb2Rlc1swXTtcblx0dGhpcy5fZG9tRWxlbWVudC5hcHBlbmRDaGlsZChpbnNlcnRlZEVsZW1lbnQpO1xuXHRyZXR1cm4gTWUuY3JlYXRlKGluc2VydGVkRWxlbWVudCwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRzaGltLkVsZW1lbnQucmVtb3ZlKHRoaXMuX2RvbUVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSBdKTtcblx0cmV0dXJuIHRoaXMudG9Eb21FbGVtZW50KCkuY29udGFpbnMoZWxlbWVudC50b0RvbUVsZW1lbnQoKSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50O1xufTtcblxuTWUucHJvdG90eXBlLmNvbnRleHQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgQnJvd3NpbmdDb250ZXh0ID0gcmVxdWlyZShcIi4vYnJvd3NpbmdfY29udGV4dC5qc1wiKTsgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdHJldHVybiBuZXcgQnJvd3NpbmdDb250ZXh0KHRoaXMuX2RvbUVsZW1lbnQub3duZXJEb2N1bWVudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIFwiJ1wiICsgdGhpcy5fbmlja25hbWUgKyBcIidcIjtcbn07XG5cbk1lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbih0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudCA9PT0gdGhhdC5fZG9tRWxlbWVudDtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudC5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudExpc3Qobm9kZUxpc3QsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgU3RyaW5nIF0pO1xuXG5cdHRoaXMuX25vZGVMaXN0ID0gbm9kZUxpc3Q7XG5cdHRoaXMuX25pY2tuYW1lID0gbmlja25hbWU7XG59O1xuXG5NZS5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24gbGVuZ3RoKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzLl9ub2RlTGlzdC5sZW5ndGg7XG59O1xuXG5NZS5wcm90b3R5cGUuYXQgPSBmdW5jdGlvbiBhdChyZXF1ZXN0ZWRJbmRleCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyLCBbdW5kZWZpbmVkLCBTdHJpbmddIF0pO1xuXG5cdHZhciBpbmRleCA9IHJlcXVlc3RlZEluZGV4O1xuXHR2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGgoKTtcblx0aWYgKGluZGV4IDwgMCkgaW5kZXggPSBsZW5ndGggKyBpbmRleDtcblxuXHRlbnN1cmUudGhhdChcblx0XHRpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoLFxuXHRcdFwiJ1wiICsgdGhpcy5fbmlja25hbWUgKyBcIidbXCIgKyByZXF1ZXN0ZWRJbmRleCArIFwiXSBpcyBvdXQgb2YgYm91bmRzOyBsaXN0IGxlbmd0aCBpcyBcIiArIGxlbmd0aFxuXHQpO1xuXHR2YXIgZWxlbWVudCA9IHRoaXMuX25vZGVMaXN0W2luZGV4XTtcblxuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSB0aGlzLl9uaWNrbmFtZSArIFwiW1wiICsgaW5kZXggKyBcIl1cIjtcblx0cmV0dXJuIFFFbGVtZW50LmNyZWF0ZShlbGVtZW50LCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gXCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJyBsaXN0XCI7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNC0yMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3V0aWwvc2hpbS5qc1wiKTtcbnZhciBCcm93c2luZ0NvbnRleHQgPSByZXF1aXJlKFwiLi9icm93c2luZ19jb250ZXh0LmpzXCIpO1xudmFyIGFzeW5jID0gcmVxdWlyZShcIi4uL3ZlbmRvci9hc3luYy0xLjQuMi5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRnJhbWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dGhpcy5fZG9tRWxlbWVudCA9IG51bGw7XG5cdHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xuXHR0aGlzLl9yZW1vdmVkID0gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBsb2FkZWQoc2VsZiwgd2lkdGgsIGhlaWdodCwgc3JjLCBzdHlsZXNoZWV0cykge1xuXG5cdHNlbGYuX2xvYWRlZCA9IHRydWU7XG5cdHNlbGYuX2RvY3VtZW50ID0gc2VsZi5fZG9tRWxlbWVudC5jb250ZW50RG9jdW1lbnQ7XG5cdHNlbGYuX2Jyb3dzaW5nQ29udGV4dCA9IG5ldyBCcm93c2luZ0NvbnRleHQoc2VsZi5fZG9jdW1lbnQpO1xuXHRzZWxmLl9vcmlnaW5hbEJvZHkgPSBzZWxmLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTDtcblx0c2VsZi5fb3JpZ2luYWxXaWR0aCA9IHdpZHRoO1xuXHRzZWxmLl9vcmlnaW5hbEhlaWdodCA9IGhlaWdodDtcblx0c2VsZi5fb3JpZ2luYWxTcmMgPSBzcmM7XG5cdHNlbGYuX29yaWdpbmFsU3R5bGVzaGVldHMgPSBzdHlsZXNoZWV0cztcbn1cblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHBhcmVudEVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbT2JqZWN0LCBbT2JqZWN0LCBGdW5jdGlvbl0sIFt1bmRlZmluZWQsIEZ1bmN0aW9uXV0pO1xuXHRpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuXHRcdGNhbGxiYWNrID0gb3B0aW9ucztcblx0XHRvcHRpb25zID0ge307XG5cdH1cblx0dmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCB8fCAyMDAwO1xuXHR2YXIgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgfHwgMjAwMDtcblx0dmFyIHNyYyA9IG9wdGlvbnMuc3JjO1xuXHR2YXIgc3R5bGVzaGVldHMgPSBvcHRpb25zLnN0eWxlc2hlZXQgfHwgW107XG5cdHZhciBjc3MgPSBvcHRpb25zLmNzcztcblx0aWYgKCFzaGltLkFycmF5LmlzQXJyYXkoc3R5bGVzaGVldHMpKSBzdHlsZXNoZWV0cyA9IFsgc3R5bGVzaGVldHMgXTtcblxuXHR2YXIgZnJhbWUgPSBuZXcgTWUoKTtcblx0Y2hlY2tVcmxzKHNyYywgc3R5bGVzaGVldHMsIGZ1bmN0aW9uKGVycikge1xuXHRcdGlmIChlcnIpIHJldHVybiBjYWxsYmFjayhlcnIpO1xuXG5cdFx0dmFyIGlmcmFtZSA9IGluc2VydElmcmFtZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0KTtcblx0XHRzaGltLkV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoaWZyYW1lLCBcImxvYWRcIiwgb25GcmFtZUxvYWQpO1xuXHRcdHNldElmcmFtZUNvbnRlbnQoaWZyYW1lLCBzcmMpO1xuXG5cdFx0ZnJhbWUuX2RvbUVsZW1lbnQgPSBpZnJhbWU7XG5cdFx0c2V0RnJhbWVMb2FkQ2FsbGJhY2soZnJhbWUsIGNhbGxiYWNrKTtcblx0fSk7XG5cdHJldHVybiBmcmFtZTtcblxuXHRmdW5jdGlvbiBvbkZyYW1lTG9hZCgpIHtcblx0XHQvLyBXT1JLQVJPVU5EIE1vYmlsZSBTYWZhcmkgNy4wLjAsIFNhZmFyaSA2LjIuMCwgQ2hyb21lIDM4LjAuMjEyNTogZnJhbWUgaXMgbG9hZGVkIHN5bmNocm9ub3VzbHlcblx0XHQvLyBXZSBmb3JjZSBpdCB0byBiZSBhc3luY2hyb25vdXMgaGVyZVxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2FkZWQoZnJhbWUsIHdpZHRoLCBoZWlnaHQsIHNyYywgc3R5bGVzaGVldHMpO1xuXHRcdFx0YWRkU3R5bGVzaGVldExpbmtUYWdzKGZyYW1lLCBzdHlsZXNoZWV0cywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmIChjc3MpIGFkZFN0eWxlVGFnKGZyYW1lLCBvcHRpb25zLmNzcyk7XG5cdFx0XHRcdGZyYW1lLl9mcmFtZUxvYWRDYWxsYmFjayhudWxsLCBmcmFtZSk7XG5cdFx0XHR9KTtcblx0XHR9LCAwKTtcblx0fVxufTtcblxuZnVuY3Rpb24gc2V0RnJhbWVMb2FkQ2FsbGJhY2soZnJhbWUsIGNhbGxiYWNrKSB7XG5cdGZyYW1lLl9mcmFtZUxvYWRDYWxsYmFjayA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBjaGVja1VybHMoc3JjLCBzdHlsZXNoZWV0cywgY2FsbGJhY2spIHtcblx0dXJsRXhpc3RzKHNyYywgZnVuY3Rpb24oZXJyLCBzcmNFeGlzdHMpIHtcblx0XHRpZiAoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRpZiAoIXNyY0V4aXN0cykgcmV0dXJuIGNhbGxiYWNrKGVycm9yKFwic3JjXCIsIHNyYykpO1xuXG5cdFx0YXN5bmMuZWFjaChzdHlsZXNoZWV0cywgY2hlY2tTdHlsZXNoZWV0LCBjYWxsYmFjayk7XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIGNoZWNrU3R5bGVzaGVldCh1cmwsIGNhbGxiYWNrMikge1xuXHRcdHVybEV4aXN0cyh1cmwsIGZ1bmN0aW9uKGVyciwgc3R5bGVzaGVldEV4aXN0cykge1xuXHRcdFx0aWYgKGVycikgcmV0dXJuIGNhbGxiYWNrMihlcnIpO1xuXG5cdFx0XHRpZiAoIXN0eWxlc2hlZXRFeGlzdHMpIHJldHVybiBjYWxsYmFjazIoZXJyb3IoXCJzdHlsZXNoZWV0XCIsIHVybCkpO1xuXHRcdFx0ZWxzZSByZXR1cm4gY2FsbGJhY2syKG51bGwpO1xuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gZXJyb3IobmFtZSwgdXJsKSB7XG5cdFx0cmV0dXJuIG5ldyBFcnJvcihcIjQwNCBlcnJvciB3aGlsZSBsb2FkaW5nIFwiICsgbmFtZSArIFwiIChcIiArIHVybCArIFwiKVwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cmxFeGlzdHModXJsLCBjYWxsYmFjaykge1xuXHR2YXIgU1RBVFVTX0FWQUlMQUJMRSA9IDI7ICAgLy8gV09SS0FST1VORCBJRSA4OiBub24tc3RhbmRhcmQgWE1MSHR0cFJlcXVlc3QgY29uc3RhbnQgbmFtZXNcblxuXHRpZiAodXJsID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgdHJ1ZSk7XG5cdH1cblxuXHR2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRodHRwLm9wZW4oXCJIRUFEXCIsIHVybCk7XG5cdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7ICAvLyBXT1JLQVJPVU5EIElFIDg6IGRvZXNuJ3Qgc3VwcG9ydCAuYWRkRXZlbnRMaXN0ZW5lcigpIG9yIC5vbmxvYWRcblx0XHRpZiAoaHR0cC5yZWFkeVN0YXRlID09PSBTVEFUVVNfQVZBSUxBQkxFKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgaHR0cC5zdGF0dXMgIT09IDQwNCk7XG5cdFx0fVxuXHR9O1xuXHRodHRwLm9uZXJyb3IgPSBmdW5jdGlvbigpIHsgICAgIC8vIG9uZXJyb3IgaGFuZGxlciBpcyBub3QgdGVzdGVkXG5cdFx0cmV0dXJuIGNhbGxiYWNrKFwiWE1MSHR0cFJlcXVlc3QgZXJyb3Igd2hpbGUgdXNpbmcgSFRUUCBIRUFEIG9uIFVSTCAnXCIgKyB1cmwgKyBcIic6IFwiICsgaHR0cC5zdGF0dXNUZXh0KTtcblx0fTtcblx0aHR0cC5zZW5kKCk7XG59XG5cbmZ1bmN0aW9uIGluc2VydElmcmFtZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0KSB7XG5cdHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgd2lkdGgpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJmcmFtZWJvcmRlclwiLCBcIjBcIik7ICAgIC8vIFdPUktBUk9VTkQgSUUgODogZG9uJ3QgaW5jbHVkZSBmcmFtZSBib3JkZXIgaW4gcG9zaXRpb24gY2FsY3Ncblx0cGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuXHRyZXR1cm4gaWZyYW1lO1xufVxuXG5mdW5jdGlvbiBzZXRJZnJhbWVDb250ZW50KGlmcmFtZSwgc3JjKSB7XG5cdGlmIChzcmMgPT09IHVuZGVmaW5lZCkge1xuXHRcdHdyaXRlU3RhbmRhcmRzTW9kZUh0bWwoaWZyYW1lKTtcblx0fVx0ZWxzZSB7XG5cdFx0c2V0SWZyYW1lU3JjKGlmcmFtZSwgc3JjKTtcblx0fVxufVxuXG5mdW5jdGlvbiBzZXRJZnJhbWVTcmMoaWZyYW1lLCBzcmMpIHtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzcmMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZVN0YW5kYXJkc01vZGVIdG1sKGlmcmFtZSkge1xuXHR2YXIgc3RhbmRhcmRzTW9kZSA9IFwiPCFET0NUWVBFIGh0bWw+XFxuPGh0bWw+PGhlYWQ+PC9oZWFkPjxib2R5PjwvYm9keT48L2h0bWw+XCI7XG5cdGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50Lm9wZW4oKTtcblx0aWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQud3JpdGUoc3RhbmRhcmRzTW9kZSk7XG5cdGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmNsb3NlKCk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlc2hlZXRMaW5rVGFncyhzZWxmLCB1cmxzLCBjYWxsYmFjaykge1xuXHRhc3luYy5lYWNoKHVybHMsIGFkZExpbmtUYWcsIGNhbGxiYWNrKTtcblxuXHRmdW5jdGlvbiBhZGRMaW5rVGFnKHVybCwgb25MaW5rTG9hZCkge1xuXHRcdHZhciBsaW5rID0gc2VsZi5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG5cdFx0c2hpbS5FdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKGxpbmssIFwibG9hZFwiLCBmdW5jdGlvbihldmVudCkgeyBvbkxpbmtMb2FkKG51bGwpOyB9KTtcblx0XHRsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XG5cdFx0bGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG5cdFx0bGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHVybCk7XG5cdFx0c2hpbS5Eb2N1bWVudC5oZWFkKHNlbGYuX2RvY3VtZW50KS5hcHBlbmRDaGlsZChsaW5rKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRTdHlsZVRhZyhzZWxmLCBjc3MpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXHRzdHlsZS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG5cdGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0Ly8gV09SS0FST1VORCBJRSA4OiBUaHJvd3MgJ3Vua25vd24gcnVudGltZSBlcnJvcicgaWYgeW91IHNldCBpbm5lckhUTUwgb24gYSA8c3R5bGU+IHRhZ1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fVxuXHRlbHNlIHtcblx0XHRzdHlsZS5pbm5lckhUTUwgPSBjc3M7XG5cdH1cblx0c2hpbS5Eb2N1bWVudC5oZWFkKHNlbGYuX2RvY3VtZW50KS5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbk1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dGhpcy5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB0aGlzLl9vcmlnaW5hbEJvZHk7XG5cdHRoaXMuc2Nyb2xsKDAsIDApO1xuXHR0aGlzLnJlc2l6ZSh0aGlzLl9vcmlnaW5hbFdpZHRoLCB0aGlzLl9vcmlnaW5hbEhlaWdodCk7XG59O1xuXG5NZS5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtGdW5jdGlvbl0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIGZyYW1lID0gdGhpcztcblx0dmFyIGlmcmFtZSA9IHRoaXMuX2RvbUVsZW1lbnQ7XG5cdHZhciBzcmMgPSB0aGlzLl9vcmlnaW5hbFNyYztcblxuXHR0aGlzLnJlc2l6ZSh0aGlzLl9vcmlnaW5hbFdpZHRoLCB0aGlzLl9vcmlnaW5hbEhlaWdodCk7XG5cdHNldEZyYW1lTG9hZENhbGxiYWNrKGZyYW1lLCBjYWxsYmFjayk7XG5cdHNldElmcmFtZUNvbnRlbnQoaWZyYW1lLCBzcmMpO1xufTtcblxuTWUucHJvdG90eXBlLnRvRG9tRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Ccm93c2luZ0NvbnRleHQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQ7XG59O1xuXG5NZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZUxvYWRlZCh0aGlzKTtcblx0aWYgKHRoaXMuX3JlbW92ZWQpIHJldHVybjtcblxuXHR0aGlzLl9kb21FbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fZG9tRWxlbWVudCk7XG5cdHRoaXMuX3JlbW92ZWQgPSB0cnVlO1xufTtcblxuTWUucHJvdG90eXBlLnZpZXdwb3J0ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LnZpZXdwb3J0KCk7XG59O1xuXG5NZS5wcm90b3R5cGUucGFnZSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5wYWdlKCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYm9keSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5ib2R5KCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaHRtbCwgbmlja25hbWUpIHtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQuYWRkKGh0bWwsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihzZWxlY3Rvciwgbmlja25hbWUpIHtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQuZ2V0KHNlbGVjdG9yLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24oc2VsZWN0b3IsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LmdldEFsbChzZWxlY3Rvciwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIHNjcm9sbCh4LCB5KSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LnNjcm9sbCh4LCB5KTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdTY3JvbGxQb3NpdGlvbiA9IGZ1bmN0aW9uIGdldFJhd1Njcm9sbFBvc2l0aW9uKCkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5nZXRSYXdTY3JvbGxQb3NpdGlvbigpO1xufTtcblxuTWUucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uIHJlc2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbTnVtYmVyLCBOdW1iZXJdKTtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCJcIiArIHdpZHRoKTtcblx0dGhpcy5fZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCJcIiArIGhlaWdodCk7XG5cdHRoaXMuZm9yY2VSZWZsb3coKTtcbn07XG5cbk1lLnByb3RvdHlwZS5mb3JjZVJlZmxvdyA9IGZ1bmN0aW9uIGZvcmNlUmVmbG93KCkge1xuXHR0aGlzLl9icm93c2luZ0NvbnRleHQuZm9yY2VSZWZsb3coKTtcbn07XG5cbmZ1bmN0aW9uIGVuc3VyZVVzYWJsZShzZWxmKSB7XG5cdGVuc3VyZUxvYWRlZChzZWxmKTtcblx0ZW5zdXJlTm90UmVtb3ZlZChzZWxmKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTG9hZGVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoc2VsZi5fbG9hZGVkLCBcIlFGcmFtZSBub3QgbG9hZGVkOiBXYWl0IGZvciBmcmFtZSBjcmVhdGlvbiBjYWxsYmFjayB0byBleGVjdXRlIGJlZm9yZSB1c2luZyBmcmFtZVwiKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTm90UmVtb3ZlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KCFzZWxmLl9yZW1vdmVkLCBcIkF0dGVtcHRlZCB0byB1c2UgZnJhbWUgYWZ0ZXIgaXQgd2FzIHJlbW92ZWRcIik7XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQYWdlRWRnZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL3BhZ2VfZWRnZS5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9jZW50ZXIuanNcIik7XG52YXIgQXNzZXJ0YWJsZSA9IHJlcXVpcmUoXCIuL2Fzc2VydGFibGUuanNcIik7XG52YXIgU3BhbiA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL3NwYW4uanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUVBhZ2UoYnJvd3NpbmdDb250ZXh0KSB7XG5cdHZhciBCcm93c2luZ0NvbnRleHQgPSByZXF1aXJlKFwiLi9icm93c2luZ19jb250ZXh0LmpzXCIpOyAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgQnJvd3NpbmdDb250ZXh0IF0pO1xuXG5cdC8vIHByb3BlcnRpZXNcblx0dGhpcy50b3AgPSBQYWdlRWRnZS50b3AoYnJvd3NpbmdDb250ZXh0KTtcblx0dGhpcy5yaWdodCA9IFBhZ2VFZGdlLnJpZ2h0KGJyb3dzaW5nQ29udGV4dCk7XG5cdHRoaXMuYm90dG9tID0gUGFnZUVkZ2UuYm90dG9tKGJyb3dzaW5nQ29udGV4dCk7XG5cdHRoaXMubGVmdCA9IFBhZ2VFZGdlLmxlZnQoYnJvd3NpbmdDb250ZXh0KTtcblxuXHR0aGlzLndpZHRoID0gU3Bhbi5jcmVhdGUodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcIndpZHRoIG9mIHBhZ2VcIik7XG5cdHRoaXMuaGVpZ2h0ID0gU3Bhbi5jcmVhdGUodGhpcy50b3AsIHRoaXMuYm90dG9tLCBcImhlaWdodCBvZiBwYWdlXCIpO1xuXG5cdHRoaXMuY2VudGVyID0gQ2VudGVyLngodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcImNlbnRlciBvZiBwYWdlXCIpO1xuXHR0aGlzLm1pZGRsZSA9IENlbnRlci55KHRoaXMudG9wLCB0aGlzLmJvdHRvbSwgXCJtaWRkbGUgb2YgcGFnZVwiKTtcbn07XG5Bc3NlcnRhYmxlLmV4dGVuZChNZSk7XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWaWV3cG9ydEVkZ2UgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy92aWV3cG9ydF9lZGdlLmpzXCIpO1xudmFyIENlbnRlciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2NlbnRlci5qc1wiKTtcbnZhciBBc3NlcnRhYmxlID0gcmVxdWlyZShcIi4vYXNzZXJ0YWJsZS5qc1wiKTtcbnZhciBTcGFuID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvc3Bhbi5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRVmlld3BvcnQoYnJvd3NpbmdDb250ZXh0KSB7XG5cdHZhciBCcm93c2luZ0NvbnRleHQgPSByZXF1aXJlKFwiLi9icm93c2luZ19jb250ZXh0XCIpOyAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgQnJvd3NpbmdDb250ZXh0IF0pO1xuXG5cdC8vIHByb3BlcnRpZXNcblx0dGhpcy50b3AgPSBWaWV3cG9ydEVkZ2UudG9wKGJyb3dzaW5nQ29udGV4dCk7XG5cdHRoaXMucmlnaHQgPSBWaWV3cG9ydEVkZ2UucmlnaHQoYnJvd3NpbmdDb250ZXh0KTtcblx0dGhpcy5ib3R0b20gPSBWaWV3cG9ydEVkZ2UuYm90dG9tKGJyb3dzaW5nQ29udGV4dCk7XG5cdHRoaXMubGVmdCA9IFZpZXdwb3J0RWRnZS5sZWZ0KGJyb3dzaW5nQ29udGV4dCk7XG5cblx0dGhpcy53aWR0aCA9IFNwYW4uY3JlYXRlKHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJ3aWR0aCBvZiB2aWV3cG9ydFwiKTtcblx0dGhpcy5oZWlnaHQgPSBTcGFuLmNyZWF0ZSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwiaGVpZ2h0IG9mIHZpZXdwb3J0XCIpO1xuXG5cdHRoaXMuY2VudGVyID0gQ2VudGVyLngodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcImNlbnRlciBvZiB2aWV3cG9ydFwiKTtcblx0dGhpcy5taWRkbGUgPSBDZW50ZXIueSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwibWlkZGxlIG9mIHZpZXdwb3J0XCIpO1xufTtcbkFzc2VydGFibGUuZXh0ZW5kKE1lKTtcbiIsIi8vIENvcHlyaWdodCBUaXRhbml1bSBJLlQuIExMQy5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUUVsZW1lbnQgPSByZXF1aXJlKCcuL3FfZWxlbWVudC5qcycpO1xudmFyIFFGcmFtZSA9IHJlcXVpcmUoXCIuL3FfZnJhbWUuanNcIik7XG52YXIgYnJvd3NlciA9IHJlcXVpcmUoXCIuL2Jyb3dzZXIuanNcIik7XG5cbmV4cG9ydHMuYnJvd3NlciA9IGJyb3dzZXI7XG5cbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xuXHRyZXR1cm4gUUZyYW1lLmNyZWF0ZShkb2N1bWVudC5ib2R5LCBvcHRpb25zLCBmdW5jdGlvbihlcnIsIGNhbGxiYWNrRnJhbWUpIHtcblx0XHRpZiAoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRicm93c2VyLmRldGVjdEJyb3dzZXJGZWF0dXJlcyhmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNhbGxiYWNrKGVyciwgY2FsbGJhY2tGcmFtZSk7XG5cdFx0fSk7XG5cdH0pO1xufTtcblxuZXhwb3J0cy5lbGVtZW50RnJvbURvbSA9IGZ1bmN0aW9uKGRvbUVsZW1lbnQsIG5pY2tuYW1lKSB7XG5cdHJldHVybiBRRWxlbWVudC5jcmVhdGUoZG9tRWxlbWVudCwgbmlja25hbWUpO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxMy0yMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBTZWUgTElDRU5TRS5UWFQgZm9yIGRldGFpbHMuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gUnVudGltZSBhc3NlcnRpb25zIGZvciBwcm9kdWN0aW9uIGNvZGUuIChDb250cmFzdCB0byBhc3NlcnQuanMsIHdoaWNoIGlzIGZvciB0ZXN0IGNvZGUuKVxuXG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4vb29wLmpzXCIpO1xuXG5leHBvcnRzLnRoYXQgPSBmdW5jdGlvbih2YXJpYWJsZSwgbWVzc2FnZSkge1xuXHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKSBtZXNzYWdlID0gXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZVwiO1xuXG5cdGlmICh2YXJpYWJsZSA9PT0gZmFsc2UpIHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy50aGF0LCBtZXNzYWdlKTtcblx0aWYgKHZhcmlhYmxlICE9PSB0cnVlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZSBvciBmYWxzZVwiKTtcbn07XG5cbmV4cG9ydHMudW5yZWFjaGFibGUgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdGlmICghbWVzc2FnZSkgbWVzc2FnZSA9IFwiVW5yZWFjaGFibGUgY29kZSBleGVjdXRlZFwiO1xuXG5cdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy51bnJlYWNoYWJsZSwgbWVzc2FnZSk7XG59O1xuXG5leHBvcnRzLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKGFyZ3MsIHNpZ25hdHVyZSkge1xuXHRzaWduYXR1cmUgPSBzaWduYXR1cmUgfHwgW107XG5cdHZhciBleHBlY3RlZEFyZ0NvdW50ID0gc2lnbmF0dXJlLmxlbmd0aDtcblx0dmFyIGFjdHVhbEFyZ0NvdW50ID0gYXJncy5sZW5ndGg7XG5cblx0aWYgKGFjdHVhbEFyZ0NvdW50ID4gZXhwZWN0ZWRBcmdDb3VudCkge1xuXHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oXG5cdFx0XHRleHBvcnRzLnNpZ25hdHVyZSxcblx0XHRcdFwiRnVuY3Rpb24gY2FsbGVkIHdpdGggdG9vIG1hbnkgYXJndW1lbnRzOiBleHBlY3RlZCBcIiArIGV4cGVjdGVkQXJnQ291bnQgKyBcIiBidXQgZ290IFwiICsgYWN0dWFsQXJnQ291bnRcblx0XHQpO1xuXHR9XG5cblx0dmFyIGFyZywgdHlwZXMsIG5hbWU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2lnbmF0dXJlLmxlbmd0aDsgaSsrKSB7XG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHR0eXBlcyA9IHNpZ25hdHVyZVtpXTtcblx0XHRuYW1lID0gXCJBcmd1bWVudCAjXCIgKyAoaSArIDEpO1xuXG5cdFx0aWYgKCFzaGltLkFycmF5LmlzQXJyYXkodHlwZXMpKSB0eXBlcyA9IFsgdHlwZXMgXTtcblx0XHRpZiAoIWFyZ01hdGNoZXNBbnlQb3NzaWJsZVR5cGUoYXJnLCB0eXBlcykpIHtcblx0XHRcdHZhciBtZXNzYWdlID0gbmFtZSArIFwiIGV4cGVjdGVkIFwiICsgZXhwbGFpblBvc3NpYmxlVHlwZXModHlwZXMpICsgXCIsIGJ1dCB3YXMgXCIgKyBleHBsYWluQXJnKGFyZyk7XG5cdFx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMuc2lnbmF0dXJlLCBtZXNzYWdlKTtcblx0XHR9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGFyZ01hdGNoZXNBbnlQb3NzaWJsZVR5cGUoYXJnLCB0eXBlKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChhcmdNYXRjaGVzVHlwZShhcmcsIHR5cGVbaV0pKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG5cblx0ZnVuY3Rpb24gYXJnTWF0Y2hlc1R5cGUoYXJnLCB0eXBlKSB7XG5cdFx0c3dpdGNoIChnZXRBcmdUeXBlKGFyZykpIHtcblx0XHRcdGNhc2UgXCJib29sZWFuXCI6IHJldHVybiB0eXBlID09PSBCb29sZWFuO1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiByZXR1cm4gdHlwZSA9PT0gU3RyaW5nO1xuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiByZXR1cm4gdHlwZSA9PT0gTnVtYmVyO1xuXHRcdFx0Y2FzZSBcImFycmF5XCI6IHJldHVybiB0eXBlID09PSBBcnJheTtcblx0XHRcdGNhc2UgXCJmdW5jdGlvblwiOiByZXR1cm4gdHlwZSA9PT0gRnVuY3Rpb247XG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHJldHVybiB0eXBlID09PSBPYmplY3QgfHwgYXJnIGluc3RhbmNlb2YgdHlwZTtcblx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjogcmV0dXJuIHR5cGUgPT09IHVuZGVmaW5lZDtcblx0XHRcdGNhc2UgXCJudWxsXCI6IHJldHVybiB0eXBlID09PSBudWxsO1xuXHRcdFx0Y2FzZSBcIk5hTlwiOiByZXR1cm4gdHlwZW9mKHR5cGUpID09PSBcIm51bWJlclwiICYmIGlzTmFOKHR5cGUpO1xuXG5cdFx0XHRkZWZhdWx0OiBleHBvcnRzLnVucmVhY2hhYmxlKCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5Qb3NzaWJsZVR5cGVzKHR5cGUpIHtcblx0dmFyIGpvaW5lciA9IFwiXCI7XG5cdHZhciByZXN1bHQgPSBcIlwiO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRyZXN1bHQgKz0gam9pbmVyICsgZXhwbGFpbk9uZVR5cGUodHlwZVtpXSk7XG5cdFx0am9pbmVyID0gKGkgPT09IHR5cGUubGVuZ3RoIC0gMikgPyBcIiwgb3IgXCIgOiBcIiwgXCI7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcblxuXHRmdW5jdGlvbiBleHBsYWluT25lVHlwZSh0eXBlKSB7XG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRjYXNlIEJvb2xlYW46IHJldHVybiBcImJvb2xlYW5cIjtcblx0XHRcdGNhc2UgU3RyaW5nOiByZXR1cm4gXCJzdHJpbmdcIjtcblx0XHRcdGNhc2UgTnVtYmVyOiByZXR1cm4gXCJudW1iZXJcIjtcblx0XHRcdGNhc2UgQXJyYXk6IHJldHVybiBcImFycmF5XCI7XG5cdFx0XHRjYXNlIEZ1bmN0aW9uOiByZXR1cm4gXCJmdW5jdGlvblwiO1xuXHRcdFx0Y2FzZSBudWxsOiByZXR1cm4gXCJudWxsXCI7XG5cdFx0XHRjYXNlIHVuZGVmaW5lZDogcmV0dXJuIFwidW5kZWZpbmVkXCI7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4odHlwZSkpIHJldHVybiBcIk5hTlwiO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gb29wLmNsYXNzTmFtZSh0eXBlKSArIFwiIGluc3RhbmNlXCI7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhwbGFpbkFyZyhhcmcpIHtcblx0dmFyIHR5cGUgPSBnZXRBcmdUeXBlKGFyZyk7XG5cdGlmICh0eXBlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdHlwZTtcblxuXHRyZXR1cm4gb29wLmluc3RhbmNlTmFtZShhcmcpICsgXCIgaW5zdGFuY2VcIjtcbn1cblxuZnVuY3Rpb24gZ2V0QXJnVHlwZSh2YXJpYWJsZSkge1xuXHR2YXIgdHlwZSA9IHR5cGVvZiB2YXJpYWJsZTtcblx0aWYgKHZhcmlhYmxlID09PSBudWxsKSB0eXBlID0gXCJudWxsXCI7XG5cdGlmIChzaGltLkFycmF5LmlzQXJyYXkodmFyaWFibGUpKSB0eXBlID0gXCJhcnJheVwiO1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih2YXJpYWJsZSkpIHR5cGUgPSBcIk5hTlwiO1xuXHRyZXR1cm4gdHlwZTtcbn1cblxuXG4vKioqKiovXG5cbnZhciBFbnN1cmVFeGNlcHRpb24gPSBleHBvcnRzLkVuc3VyZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uIEVuc3VyZUV4Y2VwdGlvbihmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UsIG1lc3NhZ2UpIHtcblx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UpO1xuXHRlbHNlIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrO1xuXHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBzaGltLk9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnN1cmVFeGNlcHRpb247XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLm5hbWUgPSBcIkVuc3VyZUV4Y2VwdGlvblwiO1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBjYW4ndCB1c2UgZW5zdXJlLmpzIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmN5XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG5cbmV4cG9ydHMuY2xhc3NOYW1lID0gZnVuY3Rpb24oY29uc3RydWN0b3IpIHtcblx0aWYgKHR5cGVvZiBjb25zdHJ1Y3RvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYSBjb25zdHJ1Y3RvclwiKTtcblx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZShjb25zdHJ1Y3Rvcik7XG59O1xuXG5leHBvcnRzLmluc3RhbmNlTmFtZSA9IGZ1bmN0aW9uKG9iaikge1xuXHR2YXIgcHJvdG90eXBlID0gc2hpbS5PYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblx0aWYgKHByb3RvdHlwZSA9PT0gbnVsbCkgcmV0dXJuIFwiPG5vIHByb3RvdHlwZT5cIjtcblxuXHR2YXIgY29uc3RydWN0b3IgPSBwcm90b3R5cGUuY29uc3RydWN0b3I7XG5cdGlmIChjb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkIHx8IGNvbnN0cnVjdG9yID09PSBudWxsKSByZXR1cm4gXCI8YW5vbj5cIjtcblxuXHRyZXR1cm4gc2hpbS5GdW5jdGlvbi5uYW1lKGNvbnN0cnVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZXh0ZW5kRm4gPSBmdW5jdGlvbiBleHRlbmRGbihwYXJlbnRDb25zdHJ1Y3Rvcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oY2hpbGRDb25zdHJ1Y3Rvcikge1xuXHRcdGNoaWxkQ29uc3RydWN0b3IucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKHBhcmVudENvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG5cdFx0Y2hpbGRDb25zdHJ1Y3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjaGlsZENvbnN0cnVjdG9yO1xuXHR9O1xufTtcblxuZXhwb3J0cy5tYWtlQWJzdHJhY3QgPSBmdW5jdGlvbiBtYWtlQWJzdHJhY3QoY29uc3RydWN0b3IsIG1ldGhvZHMpIHtcblx0dmFyIG5hbWUgPSBzaGltLkZ1bmN0aW9uLm5hbWUoY29uc3RydWN0b3IpO1xuXHRzaGltLkFycmF5LmZvckVhY2gobWV0aG9kcywgZnVuY3Rpb24obWV0aG9kKSB7XG5cdFx0Y29uc3RydWN0b3IucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihuYW1lICsgXCIgc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBcIiArIG1ldGhvZCArIFwiKCkgbWV0aG9kXCIpO1xuXHRcdH07XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yLnByb3RvdHlwZS5jaGVja0Fic3RyYWN0TWV0aG9kcyA9IGZ1bmN0aW9uIGNoZWNrQWJzdHJhY3RNZXRob2RzKCkge1xuXHRcdHZhciB1bmltcGxlbWVudGVkID0gW107XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHNoaW0uQXJyYXkuZm9yRWFjaChtZXRob2RzLCBmdW5jdGlvbihuYW1lKSB7XG5cdFx0XHRpZiAoc2VsZltuYW1lXSA9PT0gY29uc3RydWN0b3IucHJvdG90eXBlW25hbWVdKSB1bmltcGxlbWVudGVkLnB1c2gobmFtZSArIFwiKClcIik7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHVuaW1wbGVtZW50ZWQ7XG5cdH07XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNC0yMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cbi8qZXNsaW50IGVxZXFlcTogXCJvZmZcIiwgbm8tZXEtbnVsbDogXCJvZmZcIiwgbm8tYml0d2lzZTogXCJvZmZcIiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuQXJyYXkgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBBcnJheS5pc0FycmF5XG5cdGlzQXJyYXk6IGZ1bmN0aW9uIGlzQXJyYXkodGhpbmcpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSkgcmV0dXJuIEFycmF5LmlzQXJyYXkodGhpbmcpO1xuXG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG5cdH0sXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBBcnJheS5ldmVyeVxuXHRldmVyeTogZnVuY3Rpb24gZXZlcnkob2JqLCBjYWxsYmFja2ZuLCB0aGlzQXJnKSB7XG5cdFx0Lypqc2hpbnQgYml0d2lzZTpmYWxzZSwgZXFlcWVxOmZhbHNlLCAtVzA0MTpmYWxzZSAqL1xuXHRcdGlmIChBcnJheS5wcm90b3R5cGUuZXZlcnkpIHJldHVybiBvYmouZXZlcnkoY2FsbGJhY2tmbiwgdGhpc0FyZyk7XG5cblx0XHQvLyBUaGlzIHdvcmthcm91bmQgYmFzZWQgb24gcG9seWZpbGwgY29kZSBmcm9tIE1ETjpcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9ldmVyeVxuXHRcdHZhciBULCBrO1xuXG5cdFx0aWYgKHRoaXMgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG5cdFx0fVxuXG5cdFx0Ly8gMS4gTGV0IE8gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIFRvT2JqZWN0IHBhc3NpbmcgdGhlIHRoaXNcblx0XHQvLyAgICB2YWx1ZSBhcyB0aGUgYXJndW1lbnQuXG5cdFx0dmFyIE8gPSBPYmplY3QodGhpcyk7XG5cblx0XHQvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWwgbWV0aG9kXG5cdFx0Ly8gICAgb2YgTyB3aXRoIHRoZSBhcmd1bWVudCBcImxlbmd0aFwiLlxuXHRcdC8vIDMuIExldCBsZW4gYmUgVG9VaW50MzIobGVuVmFsdWUpLlxuXHRcdHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcblxuXHRcdC8vIDQuIElmIElzQ2FsbGFibGUoY2FsbGJhY2tmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cblx0XHRpZiAodHlwZW9mIGNhbGxiYWNrZm4gIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblx0XHR9XG5cblx0XHQvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRUID0gdGhpc0FyZztcblx0XHR9XG5cblx0XHQvLyA2LiBMZXQgayBiZSAwLlxuXHRcdGsgPSAwO1xuXG5cdFx0Ly8gNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVuXG5cdFx0d2hpbGUgKGsgPCBsZW4pIHtcblxuXHRcdFx0dmFyIGtWYWx1ZTtcblxuXHRcdFx0Ly8gYS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuXHRcdFx0Ly8gICBUaGlzIGlzIGltcGxpY2l0IGZvciBMSFMgb3BlcmFuZHMgb2YgdGhlIGluIG9wZXJhdG9yXG5cdFx0XHQvLyBiLiBMZXQga1ByZXNlbnQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBIYXNQcm9wZXJ0eSBpbnRlcm5hbFxuXHRcdFx0Ly8gICAgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cblx0XHRcdC8vICAgVGhpcyBzdGVwIGNhbiBiZSBjb21iaW5lZCB3aXRoIGNcblx0XHRcdC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cblx0XHRcdGlmIChrIGluIE8pIHtcblxuXHRcdFx0XHQvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsIG1ldGhvZFxuXHRcdFx0XHQvLyAgICBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG5cdFx0XHRcdGtWYWx1ZSA9IE9ba107XG5cblx0XHRcdFx0Ly8gaWkuIExldCB0ZXN0UmVzdWx0IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQ2FsbCBpbnRlcm5hbCBtZXRob2Rcblx0XHRcdFx0Ly8gICAgIG9mIGNhbGxiYWNrZm4gd2l0aCBUIGFzIHRoZSB0aGlzIHZhbHVlIGFuZCBhcmd1bWVudCBsaXN0XG5cdFx0XHRcdC8vICAgICBjb250YWluaW5nIGtWYWx1ZSwgaywgYW5kIE8uXG5cdFx0XHRcdHZhciB0ZXN0UmVzdWx0ID0gY2FsbGJhY2tmbi5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG5cblx0XHRcdFx0Ly8gaWlpLiBJZiBUb0Jvb2xlYW4odGVzdFJlc3VsdCkgaXMgZmFsc2UsIHJldHVybiBmYWxzZS5cblx0XHRcdFx0aWYgKCF0ZXN0UmVzdWx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRrKys7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gQXJyYXkuZm9yRWFjaFxuXHRmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKG9iaiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcblx0XHQvKmpzaGludCBiaXR3aXNlOmZhbHNlLCBlcWVxZXE6ZmFsc2UsIC1XMDQxOmZhbHNlICovXG5cblx0XHRpZiAoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHJldHVybiBvYmouZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZyk7XG5cblx0XHQvLyBUaGlzIHdvcmthcm91bmQgYmFzZWQgb24gcG9seWZpbGwgY29kZSBmcm9tIE1ETjpcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mb3JFYWNoXG5cblx0XHQvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDUsIDE1LjQuNC4xOFxuXHRcdC8vIFJlZmVyZW5jZTogaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS40LjQuMThcblxuXHRcdHZhciBULCBrO1xuXG5cdFx0aWYgKG9iaiA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCcgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG5cdFx0fVxuXG5cdFx0Ly8gMS4gTGV0IE8gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIFRvT2JqZWN0IHBhc3NpbmcgdGhlIHx0aGlzfCB2YWx1ZSBhcyB0aGUgYXJndW1lbnQuXG5cdFx0dmFyIE8gPSBPYmplY3Qob2JqKTtcblxuXHRcdC8vIDIuIExldCBsZW5WYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIHRoZSBhcmd1bWVudCBcImxlbmd0aFwiLlxuXHRcdC8vIDMuIExldCBsZW4gYmUgVG9VaW50MzIobGVuVmFsdWUpLlxuXHRcdHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcblxuXHRcdC8vIDQuIElmIElzQ2FsbGFibGUoY2FsbGJhY2spIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG5cdFx0Ly8gU2VlOiBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3g5LjExXG5cdFx0aWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGNhbGxiYWNrICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuXHRcdH1cblxuXHRcdC8vIDUuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUIGJlIHVuZGVmaW5lZC5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFQgPSB0aGlzQXJnO1xuXHRcdH1cblxuXHRcdC8vIDYuIExldCBrIGJlIDBcblx0XHRrID0gMDtcblxuXHRcdC8vIDcuIFJlcGVhdCwgd2hpbGUgayA8IGxlblxuXHRcdHdoaWxlIChrIDwgbGVuKSB7XG5cblx0XHRcdHZhciBrVmFsdWU7XG5cblx0XHRcdC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cblx0XHRcdC8vICAgVGhpcyBpcyBpbXBsaWNpdCBmb3IgTEhTIG9wZXJhbmRzIG9mIHRoZSBpbiBvcGVyYXRvclxuXHRcdFx0Ly8gYi4gTGV0IGtQcmVzZW50IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgSGFzUHJvcGVydHkgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cblx0XHRcdC8vICAgVGhpcyBzdGVwIGNhbiBiZSBjb21iaW5lZCB3aXRoIGNcblx0XHRcdC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cblx0XHRcdGlmIChrIGluIE8pIHtcblxuXHRcdFx0XHQvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG5cdFx0XHRcdGtWYWx1ZSA9IE9ba107XG5cblx0XHRcdFx0Ly8gaWkuIENhbGwgdGhlIENhbGwgaW50ZXJuYWwgbWV0aG9kIG9mIGNhbGxiYWNrIHdpdGggVCBhcyB0aGUgdGhpcyB2YWx1ZSBhbmRcblx0XHRcdFx0Ly8gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIGtWYWx1ZSwgaywgYW5kIE8uXG5cdFx0XHRcdGNhbGxiYWNrLmNhbGwoVCwga1ZhbHVlLCBrLCBPKTtcblx0XHRcdH1cblx0XHRcdC8vIGQuIEluY3JlYXNlIGsgYnkgMS5cblx0XHRcdGsrKztcblx0XHR9XG5cdFx0Ly8gOC4gcmV0dXJuIHVuZGVmaW5lZFxuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5Eb2N1bWVudCA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIGRvY3VtZW50LmhlYWRcblx0aGVhZDogZnVuY3Rpb24gaGVhZChkb2MpIHtcblx0XHRpZiAoZG9jLmhlYWQpIHJldHVybiBkb2MuaGVhZDtcblxuXHRcdHJldHVybiBkb2MucXVlcnlTZWxlY3RvcihcImhlYWRcIik7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkVsZW1lbnQgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4LCBJRSA5LCBJRSAxMCwgSUUgMTE6IG5vIEVsZW1lbnQucmVtb3ZlKClcblx0cmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoZWxlbWVudCkge1xuXHRcdGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuRXZlbnRUYXJnZXQgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBFdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKClcblx0YWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50LCBldmVudCwgY2FsbGJhY2spIHtcblx0XHRpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XG5cblx0XHRlbGVtZW50LmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBjYWxsYmFjayk7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkZ1bmN0aW9uID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgOCwgSUUgOSwgSUUgMTAsIElFIDExOiBubyBmdW5jdGlvbi5uYW1lXG5cdG5hbWU6IGZ1bmN0aW9uIG5hbWUoZm4pIHtcblx0XHRpZiAoZm4ubmFtZSkgcmV0dXJuIGZuLm5hbWU7XG5cblx0XHQvLyBCYXNlZCBvbiBjb2RlIGJ5IEphc29uIEJ1bnRpbmcgZXQgYWwsIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMzMjQyOVxuXHRcdHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKyguezEsfSlcXHMqXFwoLztcblx0XHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG5cdFx0cmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdIDogXCI8YW5vbj5cIjtcblx0fSxcblxufTtcblxuXG5leHBvcnRzLk9iamVjdCA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5jcmVhdGUoKVxuXHRjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZShwcm90b3R5cGUpIHtcblx0XHRpZiAoT2JqZWN0LmNyZWF0ZSkgcmV0dXJuIE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcblxuXHRcdHZhciBUZW1wID0gZnVuY3Rpb24gVGVtcCgpIHt9O1xuXHRcdFRlbXAucHJvdG90eXBlID0gcHJvdG90eXBlO1xuXHRcdHJldHVybiBuZXcgVGVtcCgpO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gT2JqZWN0LmdldFByb3RvdHlwZU9mXG5cdC8vIENhdXRpb246IERvZXNuJ3Qgd29yayBvbiBJRSA4IGlmIGNvbnN0cnVjdG9yIGhhcyBiZWVuIGNoYW5nZWQsIGFzIGlzIHRoZSBjYXNlIHdpdGggYSBzdWJjbGFzcy5cblx0Z2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKG9iaikge1xuXHRcdGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblxuXHRcdHZhciByZXN1bHQgPSBvYmouY29uc3RydWN0b3IgPyBvYmouY29uc3RydWN0b3IucHJvdG90eXBlIDogbnVsbDtcblx0XHRyZXR1cm4gcmVzdWx0IHx8IG51bGw7XG5cdH0sXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBPYmplY3Qua2V5c1xuXHRrZXlzOiBmdW5jdGlvbiBrZXlzKG9iaikge1xuXHRcdGlmIChPYmplY3Qua2V5cykgcmV0dXJuIE9iamVjdC5rZXlzKG9iaik7XG5cblx0XHQvLyBGcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9rZXlzXG5cdFx0dmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0XHRcdGhhc0RvbnRFbnVtQnVnID0gISh7IHRvU3RyaW5nOiBudWxsIH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxuXHRcdFx0ZG9udEVudW1zID0gW1xuXHRcdFx0XHQndG9TdHJpbmcnLFxuXHRcdFx0XHQndG9Mb2NhbGVTdHJpbmcnLFxuXHRcdFx0XHQndmFsdWVPZicsXG5cdFx0XHRcdCdoYXNPd25Qcm9wZXJ0eScsXG5cdFx0XHRcdCdpc1Byb3RvdHlwZU9mJyxcblx0XHRcdFx0J3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcblx0XHRcdFx0J2NvbnN0cnVjdG9yJ1xuXHRcdFx0XSxcblx0XHRcdGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cblx0XHRpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgKHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicgfHwgb2JqID09PSBudWxsKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIG5vbi1vYmplY3QnKTtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0ID0gW10sIHByb3AsIGk7XG5cblx0XHRmb3IgKHByb3AgaW4gb2JqKSB7XG5cdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKHByb3ApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChoYXNEb250RW51bUJ1Zykge1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGRvbnRFbnVtc0xlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZG9udEVudW1zW2ldKSkge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKGRvbnRFbnVtc1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuU3RyaW5nID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gU3RyaW5nLnRyaW0oKVxuXHR0cmltOiBmdW5jdGlvbihzdHIpIHtcblx0XHRpZiAoc3RyLnRyaW0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHN0ci50cmltKCk7XG5cblx0XHQvLyBCYXNlZCBvbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmcvVHJpbVxuXHRcdHJldHVybiBzdHIucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTBdK3xbXFxzXFx1RkVGRlxceEEwXSskL2csICcnKTtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuV2luZG93ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gV2luZG93LnBhZ2VYT2Zmc2V0XG5cdHBhZ2VYT2Zmc2V0OiBmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50KSB7XG5cdFx0aWYgKHdpbmRvdy5wYWdlWE9mZnNldCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG5cdFx0Ly8gQmFzZWQgb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy5zY3JvbGxZXG5cdFx0dmFyIGlzQ1NTMUNvbXBhdCA9ICgoZG9jdW1lbnQuY29tcGF0TW9kZSB8fCBcIlwiKSA9PT0gXCJDU1MxQ29tcGF0XCIpO1xuXHRcdHJldHVybiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcblx0fSxcblxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gV2luZG93LnBhZ2VZT2Zmc2V0XG5cdHBhZ2VZT2Zmc2V0OiBmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50KSB7XG5cdFx0aWYgKHdpbmRvdy5wYWdlWU9mZnNldCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gd2luZG93LnBhZ2VZT2Zmc2V0O1xuXG5cdFx0Ly8gQmFzZWQgb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy5zY3JvbGxZXG5cdFx0dmFyIGlzQ1NTMUNvbXBhdCA9ICgoZG9jdW1lbnQuY29tcGF0TW9kZSB8fCBcIlwiKSA9PT0gXCJDU1MxQ29tcGF0XCIpO1xuXHRcdHJldHVybiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cdH1cblxufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNiBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBpeGVscyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgWyBOdW1iZXIsIG51bGwgXSBdKTtcblx0dGhpcy5fbm9uZSA9IChhbW91bnQgPT09IG51bGwpO1xuXHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKGFtb3VudCk7XG59O1xuXG5NZS5jcmVhdGVOb25lID0gZnVuY3Rpb24gY3JlYXRlTm9uZSgpIHtcblx0cmV0dXJuIG5ldyBNZShudWxsKTtcbn07XG5cbk1lLlpFUk8gPSBNZS5jcmVhdGUoMCk7XG5NZS5OT05FID0gTWUuY3JlYXRlTm9uZSgpO1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lIF07XG59O1xuXG5NZS5wcm90b3R5cGUuaXNOb25lID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9ub25lO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIHBsdXMob3BlcmFuZCkge1xuXHRpZiAodGhpcy5fbm9uZSB8fCBvcGVyYW5kLl9ub25lKSByZXR1cm4gTWUuY3JlYXRlTm9uZSgpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2Ftb3VudCArIG9wZXJhbmQuX2Ftb3VudCk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdGlmICh0aGlzLl9ub25lIHx8IG9wZXJhbmQuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50IC0gb3BlcmFuZC5fYW1vdW50KTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZmVyZW5jZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZmVyZW5jZShvcGVyYW5kKSB7XG5cdGlmICh0aGlzLl9ub25lIHx8IG9wZXJhbmQuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUoTWF0aC5hYnModGhpcy5fYW1vdW50IC0gb3BlcmFuZC5fYW1vdW50KSk7XG59KTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMob3BlcmFuZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIgXSk7XG5cblx0aWYgKHRoaXMuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50ICogb3BlcmFuZCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYXZlcmFnZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gYXZlcmFnZShvcGVyYW5kKSB7XG5cdGlmICh0aGlzLl9ub25lIHx8IG9wZXJhbmQuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUoKHRoaXMuX2Ftb3VudCArIG9wZXJhbmQuX2Ftb3VudCkgLyAyKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuY29tcGFyZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gY29tcGFyZShvcGVyYW5kKSB7XG5cdHZhciBib3RoSGF2ZVBpeGVscyA9ICF0aGlzLl9ub25lICYmICFvcGVyYW5kLl9ub25lO1xuXHR2YXIgbmVpdGhlckhhdmVQaXhlbHMgPSB0aGlzLl9ub25lICYmIG9wZXJhbmQuX25vbmU7XG5cdHZhciBvbmx5TGVmdEhhc1BpeGVscyA9ICF0aGlzLl9ub25lICYmIG9wZXJhbmQuX25vbmU7XG5cblx0aWYgKGJvdGhIYXZlUGl4ZWxzKSB7XG5cdFx0dmFyIGRpZmZlcmVuY2UgPSB0aGlzLl9hbW91bnQgLSBvcGVyYW5kLl9hbW91bnQ7XG5cdFx0aWYgKE1hdGguYWJzKGRpZmZlcmVuY2UpIDw9IDAuNSkgcmV0dXJuIDA7XG5cdFx0ZWxzZSByZXR1cm4gZGlmZmVyZW5jZTtcblx0fVxuXHRlbHNlIGlmIChuZWl0aGVySGF2ZVBpeGVscykge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0fVxuXHRlbHNlIGlmIChvbmx5TGVmdEhhc1BpeGVscykge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJldHVybiAtMTtcblx0fVxufSk7XG5cbk1lLm1pbiA9IGZ1bmN0aW9uKGwsIHIpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUsIE1lIF0pO1xuXG5cdGlmIChsLl9ub25lIHx8IHIuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBsLmNvbXBhcmUocikgPD0gMCA/IGwgOiByO1xufTtcblxuTWUubWF4ID0gZnVuY3Rpb24obCwgcikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgTWUgXSk7XG5cblx0aWYgKGwuX25vbmUgfHwgci5fbm9uZSkgcmV0dXJuIE1lLmNyZWF0ZU5vbmUoKTtcblx0cmV0dXJuIGwuY29tcGFyZShyKSA+PSAwID8gbCA6IHI7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRpZiAodGhpcy5jb21wYXJlKGV4cGVjdGVkKSA9PT0gMCkgcmV0dXJuIFwiXCI7XG5cdGlmICh0aGlzLl9ub25lIHx8IGV4cGVjdGVkLl9ub25lKSByZXR1cm4gXCJub24tbWVhc3VyYWJsZVwiO1xuXG5cdHZhciBkaWZmZXJlbmNlID0gTWF0aC5hYnModGhpcy5fYW1vdW50IC0gZXhwZWN0ZWQuX2Ftb3VudCk7XG5cblx0dmFyIGRlc2MgPSBkaWZmZXJlbmNlO1xuXHRpZiAoZGlmZmVyZW5jZSAqIDEwMCAhPT0gTWF0aC5mbG9vcihkaWZmZXJlbmNlICogMTAwKSkgZGVzYyA9IFwiYWJvdXQgXCIgKyBkaWZmZXJlbmNlLnRvRml4ZWQoMik7XG5cdHJldHVybiBkZXNjICsgXCJweFwiO1xufSk7XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fbm9uZSA/IFwibm8gcGl4ZWxzXCIgOiB0aGlzLl9hbW91bnQgKyBcInB4XCI7XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTYgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi92YWx1ZS5qc1wiKTtcbnZhciBQaXhlbHMgPSByZXF1aXJlKFwiLi9waXhlbHMuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuL3NpemUuanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUG9zaXRpb24oZGltZW5zaW9uLCB2YWx1ZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFsgTnVtYmVyLCBQaXhlbHMgXSBdKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX3ZhbHVlID0gKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikgPyBQaXhlbHMuY3JlYXRlKHZhbHVlKSA6IHZhbHVlO1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLnggPSBmdW5jdGlvbiB4KHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFsgTnVtYmVyLCBQaXhlbHMgXSBdKTtcblxuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24geSh2YWx1ZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbIE51bWJlciwgUGl4ZWxzIF0gXSk7XG5cblx0cmV0dXJuIG5ldyBNZShZX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUubm9YID0gZnVuY3Rpb24gbm9YKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiBuZXcgTWUoWF9ESU1FTlNJT04sIFBpeGVscy5OT05FKTtcbn07XG5cbk1lLm5vWSA9IGZ1bmN0aW9uIG5vWSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCBQaXhlbHMuTk9ORSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lLCBTaXplIF07XG59O1xuXG5NZS5wcm90b3R5cGUuaXNOb25lID0gZnVuY3Rpb24gaXNOb25lKCkge1xuXHRyZXR1cm4gdGhpcy5fdmFsdWUuaXNOb25lKCk7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlzdGFuY2VUbyA9IGZ1bmN0aW9uKG9wZXJhbmQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIFNpemUuY3JlYXRlKHRoaXMuX3ZhbHVlLmRpZmZlcmVuY2Uob3BlcmFuZC50b1BpeGVscygpKSk7XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3ZhbHVlLnBsdXMob3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3ZhbHVlLm1pbnVzKG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taWRwb2ludCA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWlkcG9pbnQob3BlcmFuZCkge1xuXHRjaGVja0F4aXModGhpcywgb3BlcmFuZCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fZGltZW5zaW9uLCB0aGlzLl92YWx1ZS5hdmVyYWdlKG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5jb21wYXJlID0gVmFsdWUuc2FmZShmdW5jdGlvbiBjb21wYXJlKG9wZXJhbmQpIHtcblx0Y2hlY2tBeGlzKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gdGhpcy5fdmFsdWUuY29tcGFyZShvcGVyYW5kLnRvUGl4ZWxzKCkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taW4gPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbihvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIFBpeGVscy5taW4odGhpcy5fdmFsdWUsIG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5tYXggPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1heChvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIFBpeGVscy5tYXgodGhpcy5fdmFsdWUsIG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRjaGVja0F4aXModGhpcywgZXhwZWN0ZWQpO1xuXG5cdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMuX3ZhbHVlO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLl92YWx1ZTtcblxuXHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblx0ZWxzZSBpZiAoaXNOb25lKGV4cGVjdGVkKSAmJiAhaXNOb25lKHRoaXMpKSByZXR1cm4gXCJyZW5kZXJlZFwiO1xuXHRlbHNlIGlmICghaXNOb25lKGV4cGVjdGVkKSAmJiBpc05vbmUodGhpcykpIHJldHVybiBcIm5vdCByZW5kZXJlZFwiO1xuXG5cdHZhciBkaXJlY3Rpb247XG5cdHZhciBjb21wYXJpc29uID0gYWN0dWFsVmFsdWUuY29tcGFyZShleHBlY3RlZFZhbHVlKTtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIGRpcmVjdGlvbiA9IGNvbXBhcmlzb24gPCAwID8gXCJ0byBsZWZ0XCIgOiBcInRvIHJpZ2h0XCI7XG5cdGVsc2UgZGlyZWN0aW9uID0gY29tcGFyaXNvbiA8IDAgPyBcImhpZ2hlclwiIDogXCJsb3dlclwiO1xuXG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgXCIgXCIgKyBkaXJlY3Rpb247XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0aWYgKGlzTm9uZSh0aGlzKSkgcmV0dXJuIFwibm90IHJlbmRlcmVkXCI7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3ZhbHVlLnRvU3RyaW5nKCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9QaXhlbHMgPSBmdW5jdGlvbiB0b1BpeGVscygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3ZhbHVlO1xufTtcblxuZnVuY3Rpb24gY2hlY2tBeGlzKHNlbGYsIG90aGVyKSB7XG5cdGlmIChvdGhlciBpbnN0YW5jZW9mIE1lKSB7XG5cdFx0ZW5zdXJlLnRoYXQoc2VsZi5fZGltZW5zaW9uID09PSBvdGhlci5fZGltZW5zaW9uLCBcIkNhbid0IGNvbXBhcmUgWCBjb29yZGluYXRlIHRvIFkgY29vcmRpbmF0ZVwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiBpc05vbmUocG9zaXRpb24pIHtcblx0cmV0dXJuIHBvc2l0aW9uLl92YWx1ZS5lcXVhbHMoUGl4ZWxzLk5PTkUpO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNi0yMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG5cbnZhciBSRU5ERVJFRCA9IFwicmVuZGVyZWRcIjtcbnZhciBOT1RfUkVOREVSRUQgPSBcIm5vdCByZW5kZXJlZFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbmRlclN0YXRlKHN0YXRlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblxuXHR0aGlzLl9zdGF0ZSA9IHN0YXRlO1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLnJlbmRlcmVkID0gZnVuY3Rpb24gcmVuZGVyZWQoKSB7XG5cdHJldHVybiBuZXcgTWUoUkVOREVSRUQpO1xufTtcblxuTWUubm90UmVuZGVyZWQgPSBmdW5jdGlvbiBub3RSZW5kZXJlZCgpIHtcblx0cmV0dXJuIG5ldyBNZShOT1RfUkVOREVSRUQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbiBjb21wYXRpYmlsaXR5KCkge1xuXHRyZXR1cm4gWyBNZSBdO1xufTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0dmFyIHRoaXNTdGF0ZSA9IHRoaXMuX3N0YXRlO1xuXHR2YXIgZXhwZWN0ZWRTdGF0ZSA9IGV4cGVjdGVkLl9zdGF0ZTtcblxuXHRpZiAodGhpc1N0YXRlID09PSBleHBlY3RlZFN0YXRlKSByZXR1cm4gXCJcIjtcblx0ZWxzZSByZXR1cm4gdGhpcy50b1N0cmluZygpO1xufSk7XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRyZXR1cm4gdGhpcy5fc3RhdGU7XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG52YXIgUGl4ZWxzID0gcmVxdWlyZShcIi4vcGl4ZWxzLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNpemUodmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgUGl4ZWxzXSBdKTtcblxuXHR0aGlzLl92YWx1ZSA9ICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpID8gUGl4ZWxzLmNyZWF0ZSh2YWx1ZSkgOiB2YWx1ZTtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBNZSh2YWx1ZSk7XG59O1xuXG5NZS5jcmVhdGVOb25lID0gZnVuY3Rpb24gY3JlYXRlTm9uZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gbmV3IE1lKFBpeGVscy5OT05FKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb21wYXRpYmlsaXR5ID0gZnVuY3Rpb24gY29tcGF0aWJpbGl0eSgpIHtcblx0cmV0dXJuIFsgTWUgXTtcbn07XG5cbk1lLnByb3RvdHlwZS5pc05vbmUgPSBmdW5jdGlvbiBpc05vbmUoKSB7XG5cdHJldHVybiB0aGlzLl92YWx1ZS5pc05vbmUoKTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBwbHVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS5wbHVzKG9wZXJhbmQuX3ZhbHVlKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fdmFsdWUubWludXMob3BlcmFuZC5fdmFsdWUpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUudGltZXMgPSBmdW5jdGlvbiB0aW1lcyhvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fdmFsdWUudGltZXMob3BlcmFuZCkpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbXBhcmUgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGNvbXBhcmUodGhhdCkge1xuXHRyZXR1cm4gdGhpcy5fdmFsdWUuY29tcGFyZSh0aGF0Ll92YWx1ZSk7XG59KTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0dmFyIGFjdHVhbFZhbHVlID0gdGhpcy5fdmFsdWU7XG5cdHZhciBleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQuX3ZhbHVlO1xuXG5cdGlmIChhY3R1YWxWYWx1ZS5lcXVhbHMoZXhwZWN0ZWRWYWx1ZSkpIHJldHVybiBcIlwiO1xuXHRpZiAoaXNOb25lKGV4cGVjdGVkKSAmJiAhaXNOb25lKHRoaXMpKSByZXR1cm4gXCJyZW5kZXJlZFwiO1xuXHRpZiAoIWlzTm9uZShleHBlY3RlZCkgJiYgaXNOb25lKHRoaXMpKSByZXR1cm4gXCJub3QgcmVuZGVyZWRcIjtcblxuXHR2YXIgZGVzYyA9IGFjdHVhbFZhbHVlLmNvbXBhcmUoZXhwZWN0ZWRWYWx1ZSkgPiAwID8gXCIgYmlnZ2VyXCIgOiBcIiBzbWFsbGVyXCI7XG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgZGVzYztcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRpZiAoaXNOb25lKHRoaXMpKSByZXR1cm4gXCJub3QgcmVuZGVyZWRcIjtcblx0ZWxzZSByZXR1cm4gdGhpcy5fdmFsdWUudG9TdHJpbmcoKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1BpeGVscyA9IGZ1bmN0aW9uIHRvUGl4ZWxzKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fdmFsdWU7XG59O1xuXG5mdW5jdGlvbiBpc05vbmUoc2l6ZSkge1xuXHRyZXR1cm4gc2l6ZS5fdmFsdWUuZXF1YWxzKFBpeGVscy5OT05FKTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi4vdXRpbC9zaGltLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFZhbHVlKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcImNvbXBhdGliaWxpdHlcIixcblx0XCJkaWZmXCIsXG5cdFwidG9TdHJpbmdcIlxuXSk7XG5cbk1lLnNhZmUgPSBmdW5jdGlvbiBzYWZlKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRlbnN1cmVDb21wYXRpYmlsaXR5KHRoaXMsIHRoaXMuY29tcGF0aWJpbGl0eSgpLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdHJldHVybiB0aGlzLmRpZmYodGhhdCkgPT09IFwiXCI7XG59O1xuXG5NZS5wcm90b3R5cGUuaXNDb21wYXRpYmxlV2l0aCA9IGZ1bmN0aW9uIGlzQ29tcGF0aWJsZVdpdGgodGhhdCkge1xuXHRpZiAodGhhdCA9PT0gbnVsbCB8fCB0eXBlb2YgdGhhdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xuXG5cdHZhciBjb21wYXRpYmxlVHlwZXMgPSB0aGlzLmNvbXBhdGliaWxpdHkoKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb21wYXRpYmxlVHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAodGhhdCBpbnN0YW5jZW9mIGNvbXBhdGlibGVUeXBlc1tpXSkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuZnVuY3Rpb24gZW5zdXJlQ29tcGF0aWJpbGl0eShzZWxmLCBjb21wYXRpYmxlLCBhcmdzKSB7XG5cdHZhciBhcmc7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykgeyAgIC8vIGFyZ3MgaXMgbm90IGFuIEFycmF5LCBjYW4ndCB1c2UgZm9yRWFjaFxuXHRcdGFyZyA9IGFyZ3NbaV07XG5cdFx0aWYgKCFzZWxmLmlzQ29tcGF0aWJsZVdpdGgoYXJnKSkge1xuXHRcdFx0dmFyIHR5cGUgPSB0eXBlb2YgYXJnO1xuXHRcdFx0aWYgKGFyZyA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRcdFx0aWYgKHR5cGUgPT09IFwib2JqZWN0XCIpIHR5cGUgPSBvb3AuaW5zdGFuY2VOYW1lKGFyZyk7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XCJBIGRlc2NyaXB0b3IgZG9lc24ndCBtYWtlIHNlbnNlLiAoXCIgKyBvb3AuaW5zdGFuY2VOYW1lKHNlbGYpICsgXCIgY2FuJ3QgY29tYmluZSB3aXRoIFwiICsgdHlwZSArIFwiKVwiXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuXG4iLCIvKiFcbiAqIGFzeW5jXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2FvbGFuL2FzeW5jXG4gKlxuICogQ29weXJpZ2h0IDIwMTAtMjAxNCBDYW9sYW4gTWNNYWhvblxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgYXN5bmMgPSB7fTtcbiAgICBmdW5jdGlvbiBub29wKCkge31cbiAgICBmdW5jdGlvbiBpZGVudGl0eSh2KSB7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b0Jvb2wodikge1xuICAgICAgICByZXR1cm4gISF2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBub3RJZCh2KSB7XG4gICAgICAgIHJldHVybiAhdjtcbiAgICB9XG5cbiAgICAvLyBnbG9iYWwgb24gdGhlIHNlcnZlciwgd2luZG93IGluIHRoZSBicm93c2VyXG4gICAgdmFyIHByZXZpb3VzX2FzeW5jO1xuXG4gICAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gICAgLy8gb24gdGhlIHNlcnZlciwgb3IgYHRoaXNgIGluIHNvbWUgdmlydHVhbCBtYWNoaW5lcy4gV2UgdXNlIGBzZWxmYFxuICAgIC8vIGluc3RlYWQgb2YgYHdpbmRvd2AgZm9yIGBXZWJXb3JrZXJgIHN1cHBvcnQuXG4gICAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcgJiYgc2VsZi5zZWxmID09PSBzZWxmICYmIHNlbGYgfHxcbiAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnICYmIGdsb2JhbC5nbG9iYWwgPT09IGdsb2JhbCAmJiBnbG9iYWwgfHxcbiAgICAgICAgICAgIHRoaXM7XG5cbiAgICBpZiAocm9vdCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZpb3VzX2FzeW5jID0gcm9vdC5hc3luYztcbiAgICB9XG5cbiAgICBhc3luYy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByb290LmFzeW5jID0gcHJldmlvdXNfYXN5bmM7XG4gICAgICAgIHJldHVybiBhc3luYztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25seV9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gY3Jvc3MtYnJvd3NlciBjb21wYXRpYmxpdHkgZnVuY3Rpb25zIC8vLy9cblxuICAgIHZhciBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gICAgdmFyIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBfdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICAvLyBQb3J0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzIGlzT2JqZWN0XG4gICAgdmFyIF9pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaXNBcnJheUxpa2UoYXJyKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheShhcnIpIHx8IChcbiAgICAgICAgICAgIC8vIGhhcyBhIHBvc2l0aXZlIGludGVnZXIgbGVuZ3RoIHByb3BlcnR5XG4gICAgICAgICAgICB0eXBlb2YgYXJyLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCA+PSAwICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoICUgMSA9PT0gMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9lYWNoKGNvbGwsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheUxpa2UoY29sbCkgP1xuICAgICAgICAgICAgX2FycmF5RWFjaChjb2xsLCBpdGVyYXRvcikgOlxuICAgICAgICAgICAgX2ZvckVhY2hPZihjb2xsLCBpdGVyYXRvcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGk7IH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWR1Y2UoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBfYXJyYXlFYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mb3JFYWNoT2Yob2JqZWN0LCBpdGVyYXRvcikge1xuICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnIsIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICB2YXIgX2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfa2V5SXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICB2YXIga2V5cztcbiAgICAgICAgaWYgKF9pc0FycmF5TGlrZShjb2xsKSkge1xuICAgICAgICAgICAgbGVuID0gY29sbC5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gX2tleXMoY29sbCk7XG4gICAgICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgdG8gRVM2J3MgcmVzdCBwYXJhbSAoaHR0cDovL2FyaXlhLm9maWxhYnMuY29tLzIwMTMvMDMvZXM2LWFuZC1yZXN0LXBhcmFtZXRlci5odG1sKVxuICAgIC8vIFRoaXMgYWNjdW11bGF0ZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgaW50byBhbiBhcnJheSwgYWZ0ZXIgYSBnaXZlbiBpbmRleC5cbiAgICAvLyBGcm9tIHVuZGVyc2NvcmUuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzIxNDApLlxuICAgIGZ1bmN0aW9uIF9yZXN0UGFyYW0oZnVuYywgc3RhcnRJbmRleCkge1xuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbihmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBfZGVsYXk7XG4gICAgfVxuICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IF9zZXRJbW1lZGlhdGUgPyBfZGVsYXkgOiBhc3luYy5uZXh0VGljaztcblxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG4gICAgICAgIHZhciBzaXplID0gX2lzQXJyYXlMaWtlKG9iamVjdCkgPyBvYmplY3QubGVuZ3RoIDogX2tleXMob2JqZWN0KS5sZW5ndGg7XG4gICAgICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBfZWFjaChvYmplY3QsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMgPVxuICAgIGFzeW5jLmVhY2hPZlNlcmllcyA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGUoKSB7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGl0ZXJhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVyYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaXRlcmF0ZSgpO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMuZm9yRWFjaE9mTGltaXQgPVxuICAgIGFzeW5jLmVhY2hPZkxpbWl0ID0gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZWFjaE9mTGltaXQobGltaXQpKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2VhY2hPZkxpbWl0KGxpbWl0KSB7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgICAgICBpZiAobGltaXQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgcnVubmluZyA9IDA7XG4gICAgICAgICAgICB2YXIgZXJyb3JlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24gcmVwbGVuaXNoICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSAmJiBydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdoaWxlIChydW5uaW5nIDwgbGltaXQgJiYgIWVycm9yZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcnVubmluZyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsZW5pc2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2YsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbExpbWl0KGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oX2VhY2hPZkxpbWl0KGxpbWl0KSwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1Nlcmllcyhmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mU2VyaWVzLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FzeW5jTWFwKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMubWFwID0gZG9QYXJhbGxlbChfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcFNlcmllcyA9IGRvU2VyaWVzKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2FzeW5jTWFwKTtcblxuICAgIC8vIHJlZHVjZSBvbmx5IGhhcyBhIHNlcmllcyB2ZXJzaW9uLCBhcyBkb2luZyByZWR1Y2UgaW4gcGFyYWxsZWwgd29uJ3RcbiAgICAvLyB3b3JrIGluIG1hbnkgc2l0dWF0aW9ucy5cbiAgICBhc3luYy5pbmplY3QgPVxuICAgIGFzeW5jLmZvbGRsID1cbiAgICBhc3luYy5yZWR1Y2UgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgZnVuY3Rpb24gKHgsIGksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihtZW1vLCB4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgbWVtbyA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIgfHwgbnVsbCwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5mb2xkciA9XG4gICAgYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGlkZW50aXR5KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtpbmRleDogaW5kZXgsIHZhbHVlOiB4fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soX21hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgICAgICB9KSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuc2VsZWN0ID1cbiAgICBhc3luYy5maWx0ZXIgPSBkb1BhcmFsbGVsKF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0TGltaXQgPVxuICAgIGFzeW5jLmZpbHRlckxpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0U2VyaWVzID1cbiAgICBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcblxuICAgIGZ1bmN0aW9uIF9yZWplY3QoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZmlsdGVyKGVhY2hmbiwgYXJyLCBmdW5jdGlvbih2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgY2IoIXYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgYXN5bmMucmVqZWN0ID0gZG9QYXJhbGxlbChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RTZXJpZXMgPSBkb1NlcmllcyhfcmVqZWN0KTtcblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVUZXN0ZXIoZWFjaGZuLCBjaGVjaywgZ2V0UmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNiKSBjYihnZXRSZXN1bHQoZmFsc2UsIHZvaWQgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2IgJiYgY2hlY2sodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGxpbWl0LCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3I7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBsaW1pdDtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMuYW55ID1cbiAgICBhc3luYy5zb21lID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuc29tZUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5hbGwgPVxuICAgIGFzeW5jLmV2ZXJ5ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIG5vdElkLCBub3RJZCk7XG5cbiAgICBhc3luYy5ldmVyeUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgbm90SWQsIG5vdElkKTtcblxuICAgIGZ1bmN0aW9uIF9maW5kR2V0UmVzdWx0KHYsIHgpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIGFzeW5jLmRldGVjdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mU2VyaWVzLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdExpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIGFzeW5jLnNvcnRCeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5tYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge3ZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoY29tcGFyYXRvciksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBjb21wYXJhdG9yKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWEsIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIga2V5cyA9IF9rZXlzKHRhc2tzKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZ1Rhc2tzID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG5cbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnVuc2hpZnQoZm4pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gX2luZGV4T2YobGlzdGVuZXJzLCBmbik7XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIGxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0YXNrQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgX2FycmF5RWFjaChsaXN0ZW5lcnMuc2xpY2UoMCksIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2FycmF5RWFjaChrZXlzLCBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBfaXNBcnJheSh0YXNrc1trXSkgPyB0YXNrc1trXTogW3Rhc2tzW2tdXTtcbiAgICAgICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfZm9yRWFjaE9mKHJlc3VsdHMsIGZ1bmN0aW9uKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSh0YXNrQ29tcGxldGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVzID0gdGFzay5zbGljZSgwLCB0YXNrLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgLy8gcHJldmVudCBkZWFkLWxvY2tzXG4gICAgICAgICAgICB2YXIgbGVuID0gcmVxdWlyZXMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRlcDtcbiAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICAgIGlmICghKGRlcCA9IHRhc2tzW3JlcXVpcmVzW2xlbl1dKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBpbmV4aXN0YW50IGRlcGVuZGVuY3knKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9pc0FycmF5KGRlcCkgJiYgX2luZGV4T2YoZGVwLCBrKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGN5Y2xpYyBkZXBlbmRlbmNpZXMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiByZWFkeSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlZHVjZShyZXF1aXJlcywgZnVuY3Rpb24gKGEsIHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhICYmIHJlc3VsdHMuaGFzT3duUHJvcGVydHkoeCkpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpICYmICFyZXN1bHRzLmhhc093blByb3BlcnR5KGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLnJldHJ5ID0gZnVuY3Rpb24odGltZXMsIHRhc2ssIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBERUZBVUxUX1RJTUVTID0gNTtcbiAgICAgICAgdmFyIERFRkFVTFRfSU5URVJWQUwgPSAwO1xuXG4gICAgICAgIHZhciBhdHRlbXB0cyA9IFtdO1xuXG4gICAgICAgIHZhciBvcHRzID0ge1xuICAgICAgICAgICAgdGltZXM6IERFRkFVTFRfVElNRVMsXG4gICAgICAgICAgICBpbnRlcnZhbDogREVGQVVMVF9JTlRFUlZBTFxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhcnNlVGltZXMoYWNjLCB0KXtcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0ID09PSAnbnVtYmVyJyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodCwgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHQgPT09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LnRpbWVzLCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgICAgICBhY2MuaW50ZXJ2YWwgPSBwYXJzZUludCh0LmludGVydmFsLCAxMCkgfHwgREVGQVVMVF9JTlRFUlZBTDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBhcmd1bWVudCB0eXBlIGZvciBcXCd0aW1lc1xcJzogJyArIHR5cGVvZiB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuZ3RoIDwgMSB8fCBsZW5ndGggPiAzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnRzIC0gbXVzdCBiZSBlaXRoZXIgKHRhc2spLCAodGFzaywgY2FsbGJhY2spLCAodGltZXMsIHRhc2spIG9yICh0aW1lcywgdGFzaywgY2FsbGJhY2spJyk7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoIDw9IDIgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHRhc2s7XG4gICAgICAgICAgICB0YXNrID0gdGltZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcGFyc2VUaW1lcyhvcHRzLCB0aW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgb3B0cy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBvcHRzLnRhc2sgPSB0YXNrO1xuXG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZWRUYXNrKHdyYXBwZWRDYWxsYmFjaywgd3JhcHBlZFJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5QXR0ZW1wdCh0YXNrLCBmaW5hbEF0dGVtcHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzayhmdW5jdGlvbihlcnIsIHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayghZXJyIHx8IGZpbmFsQXR0ZW1wdCwge2VycjogZXJyLCByZXN1bHQ6IHJlc3VsdH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCB3cmFwcGVkUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlJbnRlcnZhbChpbnRlcnZhbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSAob3B0cy50aW1lcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpbmFsQXR0ZW1wdCA9ICEob3B0cy50aW1lcy09MSk7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUF0dGVtcHQob3B0cy50YXNrLCBmaW5hbEF0dGVtcHQpKTtcbiAgICAgICAgICAgICAgICBpZighZmluYWxBdHRlbXB0ICYmIG9wdHMuaW50ZXJ2YWwgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUludGVydmFsKG9wdHMuaW50ZXJ2YWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnNlcmllcyhhdHRlbXB0cywgZnVuY3Rpb24oZG9uZSwgZGF0YSl7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGFbZGF0YS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAod3JhcHBlZENhbGxiYWNrIHx8IG9wdHMuY2FsbGJhY2spKGRhdGEuZXJyLCBkYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGEgY2FsbGJhY2sgaXMgcGFzc2VkLCBydW4gdGhpcyBhcyBhIGNvbnRyb2xsIGZsb3dcbiAgICAgICAgcmV0dXJuIG9wdHMuY2FsbGJhY2sgPyB3cmFwcGVkVGFzaygpIDogd3JhcHBlZFRhc2s7XG4gICAgfTtcblxuICAgIGFzeW5jLndhdGVyZmFsbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgaWYgKCFfaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IHRvIHdhdGVyZmFsbCBtdXN0IGJlIGFuIGFycmF5IG9mIGZ1bmN0aW9ucycpO1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHdyYXBJdGVyYXRvcihpdGVyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW2Vycl0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKHdyYXBJdGVyYXRvcihuZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuc3VyZUFzeW5jKGl0ZXJhdG9yKS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB3cmFwSXRlcmF0b3IoYXN5bmMuaXRlcmF0b3IodGFza3MpKSgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcGFyYWxsZWwoZWFjaGZuLCB0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IF9pc0FycmF5TGlrZSh0YXNrcykgPyBbXSA6IHt9O1xuXG4gICAgICAgIGVhY2hmbih0YXNrcywgZnVuY3Rpb24gKHRhc2ssIGtleSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhc2soX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMucGFyYWxsZWwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2YsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnBhcmFsbGVsTGltaXQgPSBmdW5jdGlvbih0YXNrcywgbGltaXQsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChfZWFjaE9mTGltaXQobGltaXQpLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXJpZXMgPSBmdW5jdGlvbih0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZlNlcmllcywgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuaXRlcmF0b3IgPSBmdW5jdGlvbiAodGFza3MpIHtcbiAgICAgICAgZnVuY3Rpb24gbWFrZUNhbGxiYWNrKGluZGV4KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzW2luZGV4XS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZm4ubmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4ubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGluZGV4IDwgdGFza3MubGVuZ3RoIC0gMSkgPyBtYWtlQ2FsbGJhY2soaW5kZXggKyAxKTogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gZm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1ha2VDYWxsYmFjaygwKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuYXBwbHkgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoY2FsbEFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseShcbiAgICAgICAgICAgICAgICBudWxsLCBhcmdzLmNvbmNhdChjYWxsQXJncylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gX2NvbmNhdChlYWNoZm4sIGFyciwgZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYikge1xuICAgICAgICAgICAgZm4oeCwgZnVuY3Rpb24gKGVyciwgeSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoeSB8fCBbXSk7XG4gICAgICAgICAgICAgICAgY2IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5jb25jYXQgPSBkb1BhcmFsbGVsKF9jb25jYXQpO1xuICAgIGFzeW5jLmNvbmNhdFNlcmllcyA9IGRvU2VyaWVzKF9jb25jYXQpO1xuXG4gICAgYXN5bmMud2hpbHN0ID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIGlmICh0ZXN0KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5kb1doaWxzdCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiArK2NhbGxzIDw9IDEgfHwgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy51bnRpbCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kb1VudGlsID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZG9XaGlsc3QoaXRlcmF0b3IsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZHVyaW5nID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG5cbiAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjaGVjayk7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNoZWNrID0gZnVuY3Rpb24oZXJyLCB0cnV0aCkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRydXRoKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRlc3QoY2hlY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kb0R1cmluZyA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgYXN5bmMuZHVyaW5nKGZ1bmN0aW9uKG5leHQpIHtcbiAgICAgICAgICAgIGlmIChjYWxscysrIDwgMSkge1xuICAgICAgICAgICAgICAgIG5leHQobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3F1ZXVlKHdvcmtlciwgY29uY3VycmVuY3ksIHBheWxvYWQpIHtcbiAgICAgICAgaWYgKGNvbmN1cnJlbmN5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5ID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGNvbmN1cnJlbmN5ID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmN1cnJlbmN5IG11c3Qgbm90IGJlIHplcm8nKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHBvcywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCAmJiBxLmlkbGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayB8fCBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9uZXh0KHEsIHRhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3b3JrZXJzIC09IDE7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgX2FycmF5RWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdvcmtlcnMgPSAwO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghcS5wYXVzZWQgJiYgd29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUod29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tzID0gcS5wYXlsb2FkID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnBheWxvYWQpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyKGRhdGEsIGNiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcTtcbiAgICB9XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHZhciBxID0gX3F1ZXVlKGZ1bmN0aW9uIChpdGVtcywgY2IpIHtcbiAgICAgICAgICAgIHdvcmtlcihpdGVtc1swXSwgY2IpO1xuICAgICAgICB9LCBjb25jdXJyZW5jeSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLnByaW9yaXR5UXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKChlbmQgLSBiZWcgKyAxKSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZShfYmluYXJ5U2VhcmNoKHEudGFza3MsIGl0ZW0sIF9jb21wYXJlVGFza3MpICsgMSwgMCwgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcblxuICAgICAgICAvLyBPdmVycmlkZSBwdXNoIHRvIGFjY2VwdCBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyBwcmlvcml0eVxuICAgICAgICBxLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHVuc2hpZnQgZnVuY3Rpb25cbiAgICAgICAgZGVsZXRlIHEudW5zaGlmdDtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY2FyZ28gPSBmdW5jdGlvbiAod29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICAgIHJldHVybiBfcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbnNvbGVfZm4obmFtZSkge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgaWRlbnRpdHk7XG4gICAgICAgIHZhciBtZW1vaXplZCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gbWVtb2l6ZWQoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoa2V5IGluIG1lbW8pIHtcbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5IGluIHF1ZXVlcykge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH07XG5cbiAgICBhc3luYy51bm1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZm4udW5tZW1vaXplZCB8fCBmbikuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3RpbWVzKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvdW50LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIG1hcHBlcihfcmFuZ2UoY291bnQpLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLnRpbWVzID0gX3RpbWVzKGFzeW5jLm1hcCk7XG4gICAgYXN5bmMudGltZXNTZXJpZXMgPSBfdGltZXMoYXN5bmMubWFwU2VyaWVzKTtcbiAgICBhc3luYy50aW1lc0xpbWl0ID0gZnVuY3Rpb24gKGNvdW50LCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5tYXBMaW1pdChfcmFuZ2UoY291bnQpLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VxID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBuZXh0YXJncykge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhhdCwgW2Vycl0uY29uY2F0KHJlc3VsdHMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLnNlcS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIF9hcHBseUVhY2goZWFjaGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uKGZucywgYXJncykge1xuICAgICAgICAgICAgdmFyIGdvID0gX3Jlc3RQYXJhbShmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVhY2hmbihmbnMsIGZ1bmN0aW9uIChmbiwgXywgY2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncy5jb25jYXQoW2NiXSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ28uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ287XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmFwcGx5RWFjaCA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mKTtcbiAgICBhc3luYy5hcHBseUVhY2hTZXJpZXMgPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZlNlcmllcyk7XG5cblxuICAgIGFzeW5jLmZvcmV2ZXIgPSBmdW5jdGlvbiAoZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkb25lID0gb25seV9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgdGFzayA9IGVuc3VyZUFzeW5jKGZuKTtcbiAgICAgICAgZnVuY3Rpb24gbmV4dChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFzayhuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGVuc3VyZUFzeW5jKGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJBcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG5cbiAgICBhc3luYy5jb25zdGFudCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBhcmdzID0gW251bGxdLmNvbmNhdCh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhc3luYy53cmFwU3luYyA9XG4gICAgYXN5bmMuYXN5bmNpZnkgPSBmdW5jdGlvbiBhc3luY2lmeShmdW5jKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiByZXN1bHQgaXMgUHJvbWlzZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChfaXNPYmplY3QocmVzdWx0KSAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIubWVzc2FnZSA/IGVyciA6IG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIE5vZGUuanNcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBhc3luYztcbiAgICB9XG4gICAgLy8gQU1EIC8gUmVxdWlyZUpTXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuICAgIGVsc2Uge1xuICAgICAgICByb290LmFzeW5jID0gYXN5bmM7XG4gICAgfVxuXG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmIChzdHIubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdHJldHVybiBzdHJcblx0LnJlcGxhY2UoL15bXy5cXC0gXSsvLCAnJylcblx0LnRvTG93ZXJDYXNlKClcblx0LnJlcGxhY2UoL1tfLlxcLSBdKyhcXHd8JCkvZywgZnVuY3Rpb24gKG0sIHAxKSB7XG5cdFx0cmV0dXJuIHAxLnRvVXBwZXJDYXNlKCk7XG5cdH0pO1xufTtcbiJdfQ==
