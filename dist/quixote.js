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

},{"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");

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

},{"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14,"./relative_position.js":15}],8:[function(require,module,exports){
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
			"error message and a standalone example test that reproduces the error.\n" +
			"Error stack trace:\n" +
			err2.stack
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

},{"../q_element.js":20,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],10:[function(require,module,exports){
// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var RenderState = require("../values/render_state.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var ElementRenderedEdge = require("./element_rendered_edge.js");
var GenericSize = require("./generic_size.js");
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

	this.width = GenericSize.create(this.left, this.right, "rendered width of " + element);
	this.height = GenericSize.create(this.top, this.bottom, "rendered height of " + element);

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

},{"../q_element.js":20,"../util/ensure.js":26,"../values/position.js":30,"../values/render_state.js":31,"./center.js":7,"./descriptor.js":8,"./element_rendered_edge.js":11,"./generic_size.js":12}],11:[function(require,module,exports){
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
},{"../q_element.js":20,"../q_page.js":23,"../quixote.js":25,"../util/ensure.js":26,"../values/position.js":30,"../values/size.js":32,"./position_descriptor.js":14}],12:[function(require,module,exports){
// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");

var Me = module.exports = function GenericSize(from, to, description) {
  ensure.signature(arguments, [ PositionDescriptor, PositionDescriptor, String ]);

  this.should = this.createShould();

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

},{"../util/ensure.js":26,"./position_descriptor.js":14,"./size_descriptor.js":17}],13:[function(require,module,exports){
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

},{"../browsing_context.js":5,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],14:[function(require,module,exports){
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
function GenericSize() {
	return require("./generic_size.js");
}

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function PositionDescriptor(dimension) {
	ensure.signature(arguments, [ String ]);
	ensure.unreachable("PositionDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.plus = function plus(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().right(this, amount);
	else return RelativePosition().down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().left(this, amount);
	else return RelativePosition().up(this, amount);
};

Me.prototype.to = function to(position) {
	ensure.signature(arguments, [[ Me, Number ]]);
	if (typeof position === "number") {
		if (this._pdbc.dimension === X_DIMENSION) position = AbsolutePosition().x(position);
		else position = AbsolutePosition().y(position);
	}
	if (this._pdbc.dimension !== position._pdbc.dimension) {
		throw new Error("Can't calculate distance between an X coordinate and a Y coordinate");
	}

	return GenericSize().create(this, position, "distance from " + this + " to " + position);
};

Me.prototype.convert = function convert(arg, type) {
	switch (type) {
		case "number": return this._pdbc.dimension === X_DIMENSION ? Position.x(arg) : Position.y(arg);
		case "string":
			if (arg === "none") return this._pdbc.dimension === X_DIMENSION ? Position.noX() : Position.noY();
			else return undefined;
			break;
		default: return undefined;
	}
};

function factoryFn(dimension) {
	return function factory(self) {
		// _pdbc: "PositionDescriptor base class." An attempt to prevent name conflicts.
		self._pdbc = { dimension: dimension };
	};
}

},{"../util/ensure.js":26,"../util/oop.js":27,"../values/position.js":30,"./absolute_position.js":6,"./descriptor.js":8,"./generic_size.js":12,"./relative_position.js":15}],15:[function(require,module,exports){
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

},{"../util/ensure.js":26,"../values/size.js":32,"../values/value.js":33,"./descriptor.js":8,"./position_descriptor.js":14}],16:[function(require,module,exports){
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
},{"../util/ensure.js":26,"../values/size.js":32,"../values/value.js":33,"./descriptor.js":8,"./size_descriptor.js":17,"./size_multiple.js":18}],17:[function(require,module,exports){
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

},{"../util/ensure.js":26,"../util/oop.js":27,"../values/size.js":32,"./descriptor.js":8,"./relative_size.js":16,"./size_multiple.js":18}],18:[function(require,module,exports){
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
},{"../util/ensure.js":26,"../values/size.js":32,"./descriptor.js":8,"./size_descriptor.js":17}],19:[function(require,module,exports){
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

},{"../browsing_context.js":5,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],20:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementRendered = require("./descriptors/element_rendered.js");
var ElementEdge = require("./descriptors/element_edge.js");
var Center = require("./descriptors/center.js");
var GenericSize = require("./descriptors/generic_size.js");
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

	this.width = GenericSize.create(this.left, this.right, "width of " + this);
	this.height = GenericSize.create(this.top, this.bottom, "height of " + this);

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

},{"../vendor/camelcase-1.0.1-modified.js":35,"./assertable.js":3,"./browsing_context.js":5,"./descriptors/center.js":7,"./descriptors/element_edge.js":9,"./descriptors/element_rendered.js":10,"./descriptors/generic_size.js":12,"./util/ensure.js":26,"./util/shim.js":28}],21:[function(require,module,exports){
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
var GenericSize = require("./descriptors/generic_size.js");

var Me = module.exports = function QPage(browsingContext) {
	var BrowsingContext = require("./browsing_context.js");   // break circular dependency
	ensure.signature(arguments, [ BrowsingContext ]);

	// properties
	this.top = PageEdge.top(browsingContext);
	this.right = PageEdge.right(browsingContext);
	this.bottom = PageEdge.bottom(browsingContext);
	this.left = PageEdge.left(browsingContext);

	this.width = GenericSize.create(this.left, this.right, "width of page");
	this.height = GenericSize.create(this.top, this.bottom, "height of page");

	this.center = Center.x(this.left, this.right, "center of page");
	this.middle = Center.y(this.top, this.bottom, "middle of page");
};
Assertable.extend(Me);

},{"./assertable.js":3,"./browsing_context.js":5,"./descriptors/center.js":7,"./descriptors/generic_size.js":12,"./descriptors/page_edge.js":13,"./util/ensure.js":26}],24:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var ViewportEdge = require("./descriptors/viewport_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var GenericSize = require("./descriptors/generic_size.js");

var Me = module.exports = function QViewport(browsingContext) {
	var BrowsingContext = require("./browsing_context");   // break circular dependency
	ensure.signature(arguments, [ BrowsingContext ]);

	// properties
	this.top = ViewportEdge.top(browsingContext);
	this.right = ViewportEdge.right(browsingContext);
	this.bottom = ViewportEdge.bottom(browsingContext);
	this.left = ViewportEdge.left(browsingContext);

	this.width = GenericSize.create(this.left, this.right, "width of viewport");
	this.height = GenericSize.create(this.top, this.bottom, "height of viewport");

	this.center = Center.x(this.left, this.right, "center of viewport");
	this.middle = Center.y(this.top, this.bottom, "middle of viewport");
};
Assertable.extend(Me);

},{"./assertable.js":3,"./browsing_context":5,"./descriptors/center.js":7,"./descriptors/generic_size.js":12,"./descriptors/viewport_edge.js":19,"./util/ensure.js":26}],25:[function(require,module,exports){
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

	var desc = actualValue.compare(expectedValue) > 0 ? " larger" : " smaller";
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvYXNzZXJ0YWJsZS5qcyIsInNyYy9icm93c2VyLmpzIiwic3JjL2Jyb3dzaW5nX2NvbnRleHQuanMiLCJzcmMvZGVzY3JpcHRvcnMvYWJzb2x1dGVfcG9zaXRpb24uanMiLCJzcmMvZGVzY3JpcHRvcnMvY2VudGVyLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2Rlc2NyaXB0b3IuanMiLCJzcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9lZGdlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2VsZW1lbnRfcmVuZGVyZWQuanMiLCJzcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9yZW5kZXJlZF9lZGdlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2dlbmVyaWNfc2l6ZS5qcyIsInNyYy9kZXNjcmlwdG9ycy9wYWdlX2VkZ2UuanMiLCJzcmMvZGVzY3JpcHRvcnMvcG9zaXRpb25fZGVzY3JpcHRvci5qcyIsInNyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9wb3NpdGlvbi5qcyIsInNyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9zaXplLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3NpemVfZGVzY3JpcHRvci5qcyIsInNyYy9kZXNjcmlwdG9ycy9zaXplX211bHRpcGxlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3ZpZXdwb3J0X2VkZ2UuanMiLCJzcmMvcV9lbGVtZW50LmpzIiwic3JjL3FfZWxlbWVudF9saXN0LmpzIiwic3JjL3FfZnJhbWUuanMiLCJzcmMvcV9wYWdlLmpzIiwic3JjL3Ffdmlld3BvcnQuanMiLCJzcmMvcXVpeG90ZS5qcyIsInNyYy91dGlsL2Vuc3VyZS5qcyIsInNyYy91dGlsL29vcC5qcyIsInNyYy91dGlsL3NoaW0uanMiLCJzcmMvdmFsdWVzL3BpeGVscy5qcyIsInNyYy92YWx1ZXMvcG9zaXRpb24uanMiLCJzcmMvdmFsdWVzL3JlbmRlcl9zdGF0ZS5qcyIsInNyYy92YWx1ZXMvc2l6ZS5qcyIsInNyYy92YWx1ZXMvdmFsdWUuanMiLCJ2ZW5kb3IvYXN5bmMtMS40LjIuanMiLCJ2ZW5kb3IvY2FtZWxjYXNlLTEuMC4xLW1vZGlmaWVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0c0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIG5leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy9icm93c2VyLmpzJykubmV4dFRpY2s7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaW1tZWRpYXRlSWRzID0ge307XG52YXIgbmV4dEltbWVkaWF0ZUlkID0gMDtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHsgdGltZW91dC5jbG9zZSgpOyB9O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIFRoYXQncyBub3QgaG93IG5vZGUuanMgaW1wbGVtZW50cyBpdCBidXQgdGhlIGV4cG9zZWQgYXBpIGlzIHRoZSBzYW1lLlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBmdW5jdGlvbihmbikge1xuICB2YXIgaWQgPSBuZXh0SW1tZWRpYXRlSWQrKztcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGZhbHNlIDogc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGltbWVkaWF0ZUlkc1tpZF0gPSB0cnVlO1xuXG4gIG5leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKSB7XG4gICAgaWYgKGltbWVkaWF0ZUlkc1tpZF0pIHtcbiAgICAgIC8vIGZuLmNhbGwoKSBpcyBmYXN0ZXIgc28gd2Ugb3B0aW1pemUgZm9yIHRoZSBjb21tb24gdXNlLWNhc2VcbiAgICAgIC8vIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vY2FsbC1hcHBseS1zZWd1XG4gICAgICBpZiAoYXJncykge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBQcmV2ZW50IGlkcyBmcm9tIGxlYWtpbmdcbiAgICAgIGV4cG9ydHMuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IHR5cGVvZiBjbGVhckltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xlYXJJbW1lZGlhdGUgOiBmdW5jdGlvbihpZCkge1xuICBkZWxldGUgaW1tZWRpYXRlSWRzW2lkXTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4vdXRpbC9vb3AuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3V0aWwvc2hpbS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBBc3NlcnRhYmxlKCkge1xuXHRlbnN1cmUudW5yZWFjaGFibGUoXCJBc3NlcnRhYmxlIGlzIGFic3RyYWN0IGFuZCBzaG91bGQgbm90IGJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5LlwiKTtcbn07XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW10pO1xuXG5NZS5wcm90b3R5cGUuYXNzZXJ0ID0gZnVuY3Rpb24gYXNzZXJ0KGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgW3VuZGVmaW5lZCwgU3RyaW5nXSBdKTtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRGlmZmVyZW5jZXMgZm91bmRcIjtcblxuXHR2YXIgZGlmZiA9IHRoaXMuZGlmZihleHBlY3RlZCk7XG5cdGlmIChkaWZmICE9PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSArIFwiOlxcblwiICsgZGlmZiArIFwiXFxuXCIpO1xufTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCBdKTtcblxuXHR2YXIgcmVzdWx0ID0gW107XG5cdHZhciBrZXlzID0gc2hpbS5PYmplY3Qua2V5cyhleHBlY3RlZCk7XG5cdHZhciBrZXksIG9uZURpZmYsIGRlc2NyaXB0b3I7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdGtleSA9IGtleXNbaV07XG5cdFx0ZGVzY3JpcHRvciA9IHRoaXNba2V5XTtcblx0XHRlbnN1cmUudGhhdChcblx0XHRcdFx0ZGVzY3JpcHRvciAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHR0aGlzICsgXCIgZG9lc24ndCBoYXZlIGEgcHJvcGVydHkgbmFtZWQgJ1wiICsga2V5ICsgXCInLiBEaWQgeW91IG1pc3NwZWxsIGl0P1wiXG5cdFx0KTtcblx0XHRvbmVEaWZmID0gZGVzY3JpcHRvci5kaWZmKGV4cGVjdGVkW2tleV0pO1xuXHRcdGlmIChvbmVEaWZmICE9PSBcIlwiKSByZXN1bHQucHVzaChvbmVEaWZmKTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQuam9pbihcIlxcblwiKTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgVGl0YW5pdW0gSS5ULiBMTEMuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFFGcmFtZSA9IHJlcXVpcmUoXCIuL3FfZnJhbWUuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlcy9zaXplLmpzXCIpO1xuXG52YXIgRlJBTUVfV0lEVEggPSAxNTAwO1xudmFyIEZSQU1FX0hFSUdIVCA9IDIwMDtcblxudmFyIGZlYXR1cmVzID0gbnVsbDtcblxuZXhwb3J0cy5lbmxhcmdlc0ZyYW1lVG9QYWdlU2l6ZSA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcImVubGFyZ2VzRnJhbWVcIik7XG5leHBvcnRzLmVubGFyZ2VzRm9udHMgPSBjcmVhdGVEZXRlY3Rpb25NZXRob2QoXCJlbmxhcmdlc0ZvbnRzXCIpO1xuZXhwb3J0cy5taXNyZXBvcnRzQ2xpcEF1dG9Qcm9wZXJ0eSA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcIm1pc3JlcG9ydHNDbGlwQXV0b1wiKTtcbmV4cG9ydHMubWlzcmVwb3J0c0F1dG9WYWx1ZXNJbkNsaXBQcm9wZXJ0eSA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcIm1pc3JlcG9ydHNDbGlwVmFsdWVzXCIpO1xuZXhwb3J0cy5yb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9ucyA9IGNyZWF0ZURldGVjdGlvbk1ldGhvZChcInJvdW5kc09mZlBpeGVsQ2FsY3VsYXRpb25zXCIpO1xuXG5leHBvcnRzLmRldGVjdEJyb3dzZXJGZWF0dXJlcyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdHZhciBmcmFtZSA9IFFGcmFtZS5jcmVhdGUoZG9jdW1lbnQuYm9keSwgeyB3aWR0aDogRlJBTUVfV0lEVEgsIGhlaWdodDogRlJBTUVfSEVJR0hUIH0sIGZ1bmN0aW9uKGVycikge1xuXHRcdGlmIChlcnIpIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJFcnJvciB3aGlsZSBjcmVhdGluZyBRdWl4b3RlIGJyb3dzZXIgZmVhdHVyZSBkZXRlY3Rpb24gZnJhbWU6IFwiICsgZXJyKSk7XG5cdFx0fVxuXHRcdHJldHVybiBkZXRlY3RGZWF0dXJlcyhmcmFtZSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRmcmFtZS5yZW1vdmUoKTtcblx0XHRcdHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdH0pO1xuXHR9KTtcbn07XG5cbmZ1bmN0aW9uIGRldGVjdEZlYXR1cmVzKGZyYW1lLCBjYWxsYmFjaykge1xuXHR0cnkge1xuXHRcdGZlYXR1cmVzID0ge307XG5cdFx0ZmVhdHVyZXMuZW5sYXJnZXNGcmFtZSA9IGRldGVjdEZyYW1lRW5sYXJnZW1lbnQoZnJhbWUsIEZSQU1FX1dJRFRIKTtcblx0XHRmZWF0dXJlcy5taXNyZXBvcnRzQ2xpcEF1dG8gPSBkZXRlY3RSZXBvcnRlZENsaXBBdXRvKGZyYW1lKTtcblx0XHRmZWF0dXJlcy5taXNyZXBvcnRzQ2xpcFZhbHVlcyA9IGRldGVjdFJlcG9ydGVkQ2xpcFByb3BlcnR5VmFsdWVzKGZyYW1lKTtcblx0XHRmZWF0dXJlcy5yb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9ucyA9IGRldGVjdFJvdW5kc09mZlBpeGVsQ2FsY3VsYXRpb25zKGZyYW1lKTtcblxuXHRcdGRldGVjdEZvbnRFbmxhcmdlbWVudChmcmFtZSwgRlJBTUVfV0lEVEgsIGZ1bmN0aW9uKHJlc3VsdCkge1xuXHRcdFx0ZmVhdHVyZXMuZW5sYXJnZXNGb250cyA9IHJlc3VsdDtcblx0XHRcdGZyYW1lLnJlbW92ZSgpO1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuXHRcdH0pO1xuXG5cdH1cblx0Y2F0Y2goZXJyKSB7XG5cdFx0ZmVhdHVyZXMgPSBudWxsO1xuXHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJFcnJvciBkdXJpbmcgUXVpeG90ZSBicm93c2VyIGZlYXR1cmUgZGV0ZWN0aW9uOiBcIiArIGVycikpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURldGVjdGlvbk1ldGhvZChwcm9wZXJ0eU5hbWUpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdFx0ZW5zdXJlLnRoYXQoXG5cdFx0XHRmZWF0dXJlcyAhPT0gbnVsbCxcblx0XHRcdFwiTXVzdCBjYWxsIHF1aXhvdGUuY3JlYXRlRnJhbWUoKSBiZWZvcmUgdXNpbmcgUXVpeG90ZSBicm93c2VyIGZlYXR1cmUgZGV0ZWN0aW9uLlwiXG5cdFx0KTtcblxuXHRcdHJldHVybiBmZWF0dXJlc1twcm9wZXJ0eU5hbWVdO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBkZXRlY3RGcmFtZUVubGFyZ2VtZW50KGZyYW1lLCBmcmFtZVdpZHRoKSB7XG5cdGZyYW1lLnJlc2V0KCk7XG5cblx0ZnJhbWUuYWRkKFwiPGRpdiBzdHlsZT0nd2lkdGg6IFwiICsgKGZyYW1lV2lkdGggKyAyMDApICsgXCJweCc+Zm9yY2Ugc2Nyb2xsaW5nPC9kaXY+XCIpO1xuXHRyZXR1cm4gIWZyYW1lLnZpZXdwb3J0KCkud2lkdGgudmFsdWUoKS5lcXVhbHMoU2l6ZS5jcmVhdGUoZnJhbWVXaWR0aCkpO1xufVxuXG5mdW5jdGlvbiBkZXRlY3RSZXBvcnRlZENsaXBBdXRvKGZyYW1lKSB7XG5cdGZyYW1lLnJlc2V0KCk7XG5cblx0dmFyIGVsZW1lbnQgPSBmcmFtZS5hZGQoXCI8ZGl2IHN0eWxlPSdjbGlwOiBhdXRvOyc+PC9kaXY+XCIpO1xuXHR2YXIgY2xpcCA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJjbGlwXCIpO1xuXG5cdHJldHVybiBjbGlwICE9PSBcImF1dG9cIjtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0UmVwb3J0ZWRDbGlwUHJvcGVydHlWYWx1ZXMoZnJhbWUpIHtcblx0ZnJhbWUucmVzZXQoKTtcblxuXHR2YXIgZWxlbWVudCA9IGZyYW1lLmFkZChcIjxkaXYgc3R5bGU9J2NsaXA6IHJlY3QoYXV0bywgYXV0bywgYXV0bywgYXV0byk7Jz48L2Rpdj5cIik7XG5cdHZhciBjbGlwID0gZWxlbWVudC5nZXRSYXdTdHlsZShcImNsaXBcIik7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBQcm92aWRlcyAnY2xpcFRvcCcgZXRjLiBpbnN0ZWFkIG9mICdjbGlwJyBwcm9wZXJ0eVxuXHRpZiAoY2xpcCA9PT0gXCJcIiAmJiBlbGVtZW50LmdldFJhd1N0eWxlKFwiY2xpcC10b3BcIikgPT09IFwiYXV0b1wiKSByZXR1cm4gZmFsc2U7XG5cblx0cmV0dXJuIGNsaXAgIT09IFwicmVjdChhdXRvLCBhdXRvLCBhdXRvLCBhdXRvKVwiICYmIGNsaXAgIT09IFwicmVjdChhdXRvIGF1dG8gYXV0byBhdXRvKVwiO1xufVxuXG5mdW5jdGlvbiBkZXRlY3RSb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9ucyhmcmFtZSkge1xuXHR2YXIgZWxlbWVudCA9IGZyYW1lLmFkZChcIjxkaXYgc3R5bGU9J2ZvbnQtc2l6ZTogMTVweDsnPjwvZGl2PlwiKTtcblx0dmFyIHNpemUgPSBlbGVtZW50LmNhbGN1bGF0ZVBpeGVsVmFsdWUoXCIwLjVlbVwiKTtcblxuXHRpZiAoc2l6ZSA9PT0gNy41KSByZXR1cm4gZmFsc2U7XG5cdGlmIChzaXplID09PSA4KSByZXR1cm4gdHJ1ZTtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiRmFpbHVyZSBpbiByb3VuZHNPZmZQaXhlbFZhbHVlcygpIGRldGVjdGlvbjogZXhwZWN0ZWQgNy41IG9yIDgsIGJ1dCBnb3QgXCIgKyBzaXplKTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0Rm9udEVubGFyZ2VtZW50KGZyYW1lLCBmcmFtZVdpZHRoLCBjYWxsYmFjaykge1xuXHRlbnN1cmUudGhhdChmcmFtZVdpZHRoID49IDE1MDAsIFwiRGV0ZWN0b3IgZnJhbWUgd2lkdGggbXVzdCBiZSBsYXJnZXIgdGhhbiBzY3JlZW4gdG8gZGV0ZWN0IGZvbnQgZW5sYXJnZW1lbnRcIik7XG5cdGZyYW1lLnJlc2V0KCk7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiB3ZSB1c2UgYSA8ZGl2PiBiZWNhdXNlIHRoZSA8c3R5bGU+IHRhZyBjYW4ndCBiZSBhZGRlZCBieSBmcmFtZS5hZGQoKS4gQXQgdGhlIHRpbWUgb2YgdGhpc1xuXHQvLyB3cml0aW5nLCBJJ20gbm90IHN1cmUgaWYgdGhlIGlzc3VlIGlzIHdpdGggZnJhbWUuYWRkKCkgb3IgaWYgSUUganVzdCBjYW4ndCBwcm9ncmFtbWF0aWNhbGx5IGFkZCA8c3R5bGU+IHRhZ3MuXG5cdGZyYW1lLmFkZChcIjxkaXY+PHN0eWxlPnAgeyBmb250LXNpemU6IDE1cHg7IH08L3N0eWxlPjwvZGl2PlwiKTtcblxuXHR2YXIgdGV4dCA9IGZyYW1lLmFkZChcIjxwPmFyYml0cmFyeSB0ZXh0PC9wPlwiKTtcblx0ZnJhbWUuYWRkKFwiPHA+bXVzdCBoYXZlIHR3byBwIHRhZ3MgdG8gd29yazwvcD5cIik7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBuZWVkIHRvIGZvcmNlIHJlZmxvdyBvciBnZXR0aW5nIGZvbnQtc2l6ZSBtYXkgZmFpbCBiZWxvd1xuXHQvLyBUaGlzIHNlZW1zIHRvIG9jY3VyIHdoZW4gSUUgaXMgcnVubmluZyBpbiBhIHNsb3cgVmlydHVhbEJveCBWTS4gVGhlcmUgaXMgbm8gdGVzdCBmb3IgdGhpcyBsaW5lLlxuXHRmcmFtZS5mb3JjZVJlZmxvdygpO1xuXG5cdC8vIFdPUktBUk9VTkQgU2FmYXJpIDguMC4wOiB0aW1lb3V0IHJlcXVpcmVkIGJlY2F1c2UgZm9udCBpcyBlbmxhcmdlZCBhc3luY2hyb25vdXNseVxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmb250U2l6ZSA9IHRleHQuZ2V0UmF3U3R5bGUoXCJmb250LXNpemVcIik7XG5cdFx0ZW5zdXJlLnRoYXQoZm9udFNpemUgIT09IFwiXCIsIFwiRXhwZWN0ZWQgZm9udC1zaXplIHRvIGJlIGEgdmFsdWVcIik7XG5cblx0XHQvLyBXT1JLQVJPVU5EIElFIDg6IGlnbm9yZXMgPHN0eWxlPiB0YWcgd2UgYWRkZWQgYWJvdmVcblx0XHRpZiAoZm9udFNpemUgPT09IFwiMTJwdFwiKSByZXR1cm4gY2FsbGJhY2soZmFsc2UpO1xuXG5cdFx0cmV0dXJuIGNhbGxiYWNrKGZvbnRTaXplICE9PSBcIjE1cHhcIik7XG5cdH0sIDApO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50LmpzXCIpO1xudmFyIFFFbGVtZW50TGlzdCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudF9saXN0LmpzXCIpO1xudmFyIFFWaWV3cG9ydCA9IHJlcXVpcmUoXCIuL3Ffdmlld3BvcnQuanNcIik7XG52YXIgUVBhZ2UgPSByZXF1aXJlKFwiLi9xX3BhZ2UuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQnJvd3NpbmdDb250ZXh0KGNvbnRlbnREb2N1bWVudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW09iamVjdF0pO1xuXG5cdHRoaXMuY29udGVudFdpbmRvdyA9IGNvbnRlbnREb2N1bWVudC5kZWZhdWx0VmlldyB8fCBjb250ZW50RG9jdW1lbnQucGFyZW50V2luZG93O1xuXHR0aGlzLmNvbnRlbnREb2N1bWVudCA9IGNvbnRlbnREb2N1bWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS5ib2R5ID0gZnVuY3Rpb24gYm9keSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gUUVsZW1lbnQuY3JlYXRlKHRoaXMuY29udGVudERvY3VtZW50LmJvZHksIFwiPGJvZHk+XCIpO1xufTtcblxuTWUucHJvdG90eXBlLnZpZXdwb3J0ID0gZnVuY3Rpb24gdmlld3BvcnQoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIG5ldyBRVmlld3BvcnQodGhpcyk7XG59O1xuXG5NZS5wcm90b3R5cGUucGFnZSA9IGZ1bmN0aW9uIHBhZ2UoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIG5ldyBRUGFnZSh0aGlzKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoaHRtbCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtTdHJpbmcsIFt1bmRlZmluZWQsIFN0cmluZ11dKTtcblx0cmV0dXJuIHRoaXMuYm9keSgpLmFkZChodG1sLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KHNlbGVjdG9yLCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1N0cmluZywgW3VuZGVmaW5lZCwgU3RyaW5nXV0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBzZWxlY3RvcjtcblxuXHR2YXIgbm9kZXMgPSB0aGlzLmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblx0ZW5zdXJlLnRoYXQobm9kZXMubGVuZ3RoID09PSAxLCBcIkV4cGVjdGVkIG9uZSBlbGVtZW50IHRvIG1hdGNoICdcIiArIHNlbGVjdG9yICsgXCInLCBidXQgZm91bmQgXCIgKyBub2Rlcy5sZW5ndGgpO1xuXHRyZXR1cm4gUUVsZW1lbnQuY3JlYXRlKG5vZGVzWzBdLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24gZ2V0QWxsKHNlbGVjdG9yLCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1N0cmluZywgW3VuZGVmaW5lZCwgU3RyaW5nXV0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBzZWxlY3RvcjtcblxuXHRyZXR1cm4gbmV3IFFFbGVtZW50TGlzdCh0aGlzLmNvbnRlbnREb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIHNjcm9sbCh4LCB5KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbTnVtYmVyLCBOdW1iZXJdKTtcblxuXHR0aGlzLmNvbnRlbnRXaW5kb3cuc2Nyb2xsKHgsIHkpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1Njcm9sbFBvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UmF3U2Nyb2xsUG9zaXRpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHtcblx0XHR4OiBzaGltLldpbmRvdy5wYWdlWE9mZnNldCh0aGlzLmNvbnRlbnRXaW5kb3csIHRoaXMuY29udGVudERvY3VtZW50KSxcblx0XHR5OiBzaGltLldpbmRvdy5wYWdlWU9mZnNldCh0aGlzLmNvbnRlbnRXaW5kb3csIHRoaXMuY29udGVudERvY3VtZW50KVxuXHR9O1xufTtcblxuLy8gVGhpcyBtZXRob2QgaXMgbm90IHRlc3RlZC0tZG9uJ3Qga25vdyBob3cuXG5NZS5wcm90b3R5cGUuZm9yY2VSZWZsb3cgPSBmdW5jdGlvbiBmb3JjZVJlZmxvdygpIHtcblx0dGhpcy5ib2R5KCkudG9Eb21FbGVtZW50KCkub2Zmc2V0VG9wO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbTWVdKTtcblx0cmV0dXJuIHRoaXMuY29udGVudFdpbmRvdyA9PT0gdGhhdC5jb250ZW50V2luZG93O1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbkRlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBBYnNvbHV0ZVBvc2l0aW9uKGRpbWVuc2lvbiwgdmFsdWUpIHtcbiAgZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBOdW1iZXIgXSk7XG5cbiAgdGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXG4gIHN3aXRjaChkaW1lbnNpb24pIHtcblx0XHRjYXNlIFhfRElNRU5TSU9OOlxuXHRcdFx0UG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdFx0XHR0aGlzLl92YWx1ZSA9IFBvc2l0aW9uLngodmFsdWUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBZX0RJTUVOU0lPTjpcblx0XHRcdFBvc2l0aW9uRGVzY3JpcHRvci55KHRoaXMpO1xuXHRcdFx0dGhpcy5fdmFsdWUgPSBQb3NpdGlvbi55KHZhbHVlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZShcIlVua25vd24gZGltZW5zaW9uOiBcIiArIGRpbWVuc2lvbik7XG4gIH1cbiAgdGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xufTtcblBvc2l0aW9uRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuICByZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl92YWx1ZSArIFwiIFwiICsgdGhpcy5fZGltZW5zaW9uICsgXCItY29vcmRpbmF0ZVwiO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbkRlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBSZWxhdGl2ZVBvc2l0aW9uID0gcmVxdWlyZShcIi4vcmVsYXRpdmVfcG9zaXRpb24uanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ2VudGVyKGRpbWVuc2lvbiwgcG9zaXRpb24xLCBwb3NpdGlvbjIsIGRlc2NyaXB0aW9uKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgUG9zaXRpb25EZXNjcmlwdG9yLCBQb3NpdGlvbkRlc2NyaXB0b3IsIFN0cmluZyBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cdFxuXHRpZiAoZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04pIFBvc2l0aW9uRGVzY3JpcHRvci55KHRoaXMpO1xuXHRlbHNlIGVuc3VyZS51bnJlYWNoYWJsZShcIlVua25vd24gZGltZW5zaW9uOiBcIiArIGRpbWVuc2lvbik7XG5cblx0dGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR0aGlzLl9wb3NpdGlvbjEgPSBwb3NpdGlvbjE7XG5cdHRoaXMuX3Bvc2l0aW9uMiA9IHBvc2l0aW9uMjtcblx0dGhpcy5fZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbn07XG5Qb3NpdGlvbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZhY3RvcnlGbihYX0RJTUVOU0lPTik7XG5NZS55ID0gZmFjdG9yeUZuKFlfRElNRU5TSU9OKTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9wb3NpdGlvbjEudmFsdWUoKS5taWRwb2ludCh0aGlzLl9wb3NpdGlvbjIudmFsdWUoKSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uO1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKGRpbWVuc2lvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24ocG9zaXRpb24xLCBwb3NpdGlvbjIsIGRlc2NyaXB0aW9uKSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIHBvc2l0aW9uMSwgcG9zaXRpb24yLCBkZXNjcmlwdGlvbik7XG5cdH07XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4uL3ZhbHVlcy92YWx1ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBEZXNjcmlwdG9yKCkge1xuXHRlbnN1cmUudW5yZWFjaGFibGUoXCJEZXNjcmlwdG9yIGlzIGFic3RyYWN0IGFuZCBzaG91bGQgbm90IGJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5LlwiKTtcbn07XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcInZhbHVlXCIsXG5cdFwidG9TdHJpbmdcIlxuXSk7XG5cbi8vIFdPUktBUk9VTkQgSUUgODogRG9lc24ndCBzdXBwb3J0IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgpLCB3aGljaCB3b3VsZCBhbGxvdyB1cyB0byBjcmVhdGUgTWUucHJvdG90eXBlLnNob3VsZFxuLy8gZGlyZWN0bHkgb24gdGhpcyBjbGFzcyBhcyBhbiBhY2Nlc3NvciBtZXRob2QuXG4vLyBXT1JLQVJPVU5EIElFIDExOiBEb2Vzbid0IHN1cHBvcnQgRVM2ICdjbGFzcycgc3ludGF4LCB3aGljaCB3b3VsZCBhbGxvdyB1cyB0byB1c2UgZ2V0dGVyIG1ldGhvZHMgYW5kIGluaGVyaXRhbmNlLlxuTWUucHJvdG90eXBlLmNyZWF0ZVNob3VsZCA9IGZ1bmN0aW9uIGNyZWF0ZUFzc2VydCgpIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXHRyZXR1cm4ge1xuXG5cdFx0ZXF1YWw6IGZ1bmN0aW9uKGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdFx0XHRzZWxmLmRvQXNzZXJ0aW9uKGV4cGVjdGVkLCBtZXNzYWdlLCBmdW5jdGlvbihhY3R1YWxWYWx1ZSwgZXhwZWN0ZWRWYWx1ZSwgZXhwZWN0ZWREZXNjLCBtZXNzYWdlKSB7XG5cdFx0XHRcdGlmICghYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UgKyBzZWxmICsgXCIgc2hvdWxkIGJlIFwiICsgZXhwZWN0ZWRWYWx1ZS5kaWZmKGFjdHVhbFZhbHVlKSArIFwiLlxcblwiICtcblx0XHRcdFx0XHRcdFwiICBFeHBlY3RlZDogXCIgKyBleHBlY3RlZERlc2MgKyBcIlxcblwiICtcblx0XHRcdFx0XHRcdFwiICBCdXQgd2FzOiAgXCIgKyBhY3R1YWxWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdG5vdEVxdWFsOiBmdW5jdGlvbihleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0c2VsZi5kb0Fzc2VydGlvbihleHBlY3RlZCwgbWVzc2FnZSwgZnVuY3Rpb24oYWN0dWFsVmFsdWUsIGV4cGVjdGVkVmFsdWUsIGV4cGVjdGVkRGVzYywgbWVzc2FnZSkge1xuXHRcdFx0XHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UgKyBzZWxmICsgXCIgc2hvdWxkbid0IGJlIFwiICsgZXhwZWN0ZWRWYWx1ZSArIFwiLlxcblwiICtcblx0XHRcdFx0XHRcdFwiICBFeHBlY3RlZDogYW55dGhpbmcgYnV0IFwiICsgZXhwZWN0ZWREZXNjICsgXCJcXG5cIiArXG5cdFx0XHRcdFx0XHRcIiAgQnV0IHdhczogIFwiICsgYWN0dWFsVmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0fTtcbn07XG5cbk1lLnByb3RvdHlwZS5kb0Fzc2VydGlvbiA9IGZ1bmN0aW9uIGRvQXNzZXJ0aW9uKGV4cGVjdGVkLCBtZXNzYWdlLCBhc3NlcnRGbikge1xuXHRtZXNzYWdlID0gbWVzc2FnZSA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IG1lc3NhZ2UgKyBcIjogXCI7XG5cdGV4cGVjdGVkID0gY29udmVydFByaW1pdGl2ZUV4cGVjdGF0aW9uVG9WYWx1ZU9iamVjdElmTmVlZGVkKHRoaXMsIGV4cGVjdGVkLCBtZXNzYWdlKTtcblxuXHR2YXIgYWN0dWFsVmFsdWU7XG5cdHZhciBleHBlY3RlZFZhbHVlO1xuXHR0cnkge1xuXHRcdGFjdHVhbFZhbHVlID0gdGhpcy52YWx1ZSgpO1xuXHRcdGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC52YWx1ZSgpO1xuXHR9XG5cdGNhdGNoIChlcnIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRtZXNzYWdlICsgXCJFcnJvciBpbiB0ZXN0LiBVbmFibGUgdG8gY29udmVydCBkZXNjcmlwdG9ycyB0byB2YWx1ZXMuXFxuXCIgK1xuXHRcdFx0XCJFcnJvciBtZXNzYWdlOiBcIiArIGVyci5tZXNzYWdlICsgXCJcXG5cIiArXG5cdFx0XHRcIiAgJ2FjdHVhbCcgZGVzY3JpcHRvcjogICBcIiArIHRoaXMgKyBcIiAoXCIgKyBvb3AuaW5zdGFuY2VOYW1lKHRoaXMpICsgXCIpXFxuXCIgK1xuXHRcdFx0XCIgICdleHBlY3RlZCcgZGVzY3JpcHRvcjogXCIgKyBleHBlY3RlZCArIFwiIChcIiArIG9vcC5pbnN0YW5jZU5hbWUoZXhwZWN0ZWQpICsgXCIpXFxuXCIgK1xuXHRcdFx0XCJJZiB0aGlzIGVycm9yIGlzIHVuY2xlYXIgb3IgeW91IHRoaW5rIFF1aXhvdGUgaXMgYXQgZmF1bHQsIHBsZWFzZSBvcGVuXFxuXCIgK1xuXHRcdFx0XCJhbiBpc3N1ZSBhdCBodHRwczovL2dpdGh1Yi5jb20vamFtZXNzaG9yZS9xdWl4b3RlL2lzc3Vlcy4gSW5jbHVkZSB0aGlzXFxuXCIgK1xuXHRcdFx0XCJlcnJvciBtZXNzYWdlIGFuZCBhIHN0YW5kYWxvbmUgZXhhbXBsZSB0ZXN0IHRoYXQgcmVwcm9kdWNlcyB0aGUgZXJyb3IuXFxuXCIgK1xuXHRcdFx0XCJFcnJvciBzdGFjayB0cmFjZTpcXG5cIiArXG5cdFx0XHRlcnIuc3RhY2tcblx0XHQpO1xuXHR9XG5cblx0aWYgKCFhY3R1YWxWYWx1ZS5pc0NvbXBhdGlibGVXaXRoKGV4cGVjdGVkVmFsdWUpKSB7XG5cdFx0dGhyb3dCYWRFeHBlY3RhdGlvbihcblx0XHRcdHRoaXMsIG9vcC5pbnN0YW5jZU5hbWUoZXhwZWN0ZWQpICsgXCIgKFwiICsgZXhwZWN0ZWQgKyBcIilcIiwgbWVzc2FnZSxcblx0XHRcdFwiQXR0ZW1wdGVkIHRvIGNvbXBhcmUgdHdvIGluY29tcGF0aWJsZSB0eXBlczpcIlxuXHRcdCk7XG5cdH1cblxuXHR2YXIgZXhwZWN0ZWREZXNjID0gZXhwZWN0ZWRWYWx1ZS50b1N0cmluZygpO1xuXHRpZiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSkgZXhwZWN0ZWREZXNjICs9IFwiIChcIiArIGV4cGVjdGVkICsgXCIpXCI7XG5cblx0dmFyIGZhaWx1cmU7XG5cdHRyeSB7XG5cdFx0ZmFpbHVyZSA9IGFzc2VydEZuKGFjdHVhbFZhbHVlLCBleHBlY3RlZFZhbHVlLCBleHBlY3RlZERlc2MsIG1lc3NhZ2UpO1xuXHR9XG5cdGNhdGNoIChlcnIyKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0bWVzc2FnZSArIFwiRXJyb3IgaW4gdGVzdC4gVW5hYmxlIHRvIHBlcmZvcm0gYXNzZXJ0aW9uLlxcblwiICtcblx0XHRcdFwiRXJyb3IgbWVzc2FnZTogXCIgKyBlcnIyLm1lc3NhZ2UgKyBcIlxcblwiICtcblx0XHRcdFwiICAnYWN0dWFsJyBkZXNjcmlwdG9yOiAgIFwiICsgdGhpcyArIFwiIChcIiArIG9vcC5pbnN0YW5jZU5hbWUodGhpcykgKyBcIilcXG5cIiArXG5cdFx0XHRcIiAgJ2V4cGVjdGVkJyBkZXNjcmlwdG9yOiBcIiArIGV4cGVjdGVkICsgXCIgKFwiICsgb29wLmluc3RhbmNlTmFtZShleHBlY3RlZCkgKyBcIilcXG5cIiArXG5cdFx0XHRcIiAgJ2FjdHVhbCcgdmFsdWU6ICAgXCIgKyBhY3R1YWxWYWx1ZSArIFwiIChcIiArIG9vcC5pbnN0YW5jZU5hbWUoYWN0dWFsVmFsdWUpICsgXCIpXFxuXCIgK1xuXHRcdFx0XCIgICdleHBlY3RlZCcgdmFsdWU6IFwiICsgZXhwZWN0ZWRWYWx1ZSArIFwiIChcIiArIG9vcC5pbnN0YW5jZU5hbWUoZXhwZWN0ZWRWYWx1ZSkgKyBcIilcXG5cIiArXG5cdFx0XHRcIklmIHRoaXMgZXJyb3IgaXMgdW5jbGVhciBvciB5b3UgdGhpbmsgUXVpeG90ZSBpcyBhdCBmYXVsdCwgcGxlYXNlIG9wZW5cXG5cIiArXG5cdFx0XHRcImFuIGlzc3VlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9qYW1lc3Nob3JlL3F1aXhvdGUvaXNzdWVzLiBJbmNsdWRlIHRoaXNcXG5cIiArXG5cdFx0XHRcImVycm9yIG1lc3NhZ2UgYW5kIGEgc3RhbmRhbG9uZSBleGFtcGxlIHRlc3QgdGhhdCByZXByb2R1Y2VzIHRoZSBlcnJvci5cXG5cIiArXG5cdFx0XHRcIkVycm9yIHN0YWNrIHRyYWNlOlxcblwiICtcblx0XHRcdGVycjIuc3RhY2tcblx0XHQpO1xuXHR9XG5cdGlmIChmYWlsdXJlICE9PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihmYWlsdXJlKTtcbn07XG5cblxuTWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdC8vIExlZ2FjeSBjb2RlLCBzdHJpY3RseSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGRlcHJlY2F0ZWQgQXNzZXJ0YWJsZS5lcXVhbHMoKSBhbmQgQXNzZXJ0YWJsZS5kaWZmKCkgbWV0aG9kcy5cblx0Ly8gSXQncyB3ZWlyZCBiZWNhdXNlIHdlIG1vdmVkIHRvIHNob3VsZC5lcXVhbHMoKSwgd2hpY2ggYWx3YXlzIHRocm93cyBhbiBleGNlcHRpb24sIGJ1dCBkaWZmIHJldHVybnMgYSBzdHJpbmcuXG5cdC8vIFRvIGF2b2lkIGR1cGxpY2F0aW5nIGNvbXBsZXggbG9naWMsIHdlIGNhbGwgc2hvdWxkLmVxdWFscygpIGFuZCB0aGVuIHVud3JhcCB0aGUgZXhjZXB0aW9uLCBidXQgb25seSBpZiBpdCdzXG5cdC8vIHRoZSByaWdodCBraW5kIG9mIGV4Y2VwdGlvbi5cblx0dHJ5IHtcblx0XHR0aGlzLnNob3VsZC5lcXVhbChleHBlY3RlZCk7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblx0Y2F0Y2ggKGVycikge1xuXHRcdHZhciBtZXNzYWdlID0gZXJyLm1lc3NhZ2U7XG5cdFx0aWYgKG1lc3NhZ2UuaW5kZXhPZihcIkJ1dCB3YXM6XCIpID09PSAtMSkgdGhyb3cgZXJyOyAgICAvLyBpdCdzIG5vdCBhbiBhc3NlcnRpb24gZXJyb3IsIGl0J3Mgc29tZSBvdGhlciBleGNlcHRpb25cblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fVxufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHQvLyBUaGlzIG1ldGhvZCBpcyBtZWFudCB0byBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMuIEl0IHNob3VsZCByZXR1cm4gJ3VuZGVmaW5lZCcgd2hlbiBhbiBhcmd1bWVudFxuXHQvLyBjYW4ndCBiZSBjb252ZXJ0ZWQuIEluIHRoaXMgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiwgbm8gYXJndW1lbnRzIGNhbiBiZSBjb252ZXJ0ZWQsIHNvIHdlIGFsd2F5c1xuXHQvLyByZXR1cm4gJ3VuZGVmaW5lZCcuXG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0Ly8gRGVzY3JpcHRvcnMgYXJlbid0IHZhbHVlIG9iamVjdHMuIFRoZXkncmUgbmV2ZXIgZXF1YWwgdG8gYW55dGhpbmcuIEJ1dCBzb21ldGltZXNcblx0Ly8gdGhleSdyZSB1c2VkIGluIHRoZSBzYW1lIHBsYWNlcyB2YWx1ZSBvYmplY3RzIGFyZSB1c2VkLCBhbmQgdGhlbiB0aGlzIG1ldGhvZCBnZXRzIGNhbGxlZC5cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuZnVuY3Rpb24gY29udmVydFByaW1pdGl2ZUV4cGVjdGF0aW9uVG9WYWx1ZU9iamVjdElmTmVlZGVkKHNlbGYsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdHZhciBleHBlY3RlZFR5cGUgPSB0eXBlb2YgZXhwZWN0ZWQ7XG5cdGlmIChleHBlY3RlZCA9PT0gbnVsbCkgZXhwZWN0ZWRUeXBlID0gXCJudWxsXCI7XG5cblx0aWYgKGV4cGVjdGVkVHlwZSA9PT0gXCJvYmplY3RcIiAmJiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSkpIHJldHVybiBleHBlY3RlZDtcblxuXHRpZiAoZXhwZWN0ZWQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93QmFkRXhwZWN0YXRpb24oXG5cdFx0XHRzZWxmLCBcInVuZGVmaW5lZFwiLCBtZXNzYWdlLFxuXHRcdFx0XCJUaGUgJ2V4cGVjdGVkJyBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkLiBEaWQgeW91IG1pc3NwZWxsIGEgcHJvcGVydHkgbmFtZT9cIlxuXHRcdCk7XG5cdH1cblx0ZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0dGhyb3dCYWRFeHBlY3RhdGlvbihcblx0XHRcdHNlbGYsIG9vcC5pbnN0YW5jZU5hbWUoZXhwZWN0ZWQpLCBtZXNzYWdlLFxuXHRcdFx0XCJUaGUgJ2V4cGVjdGVkJyBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgZGVzY3JpcHRvciwgYnV0IGl0IHdhc24ndCByZWNvZ25pemVkLlwiXG5cdFx0KTtcblx0fVxuXHRlbHNlIHtcblx0XHR2YXIgY29udmVydGVkID0gc2VsZi5jb252ZXJ0KGV4cGVjdGVkLCBleHBlY3RlZFR5cGUpO1xuXHRcdGlmIChjb252ZXJ0ZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGNvbnZlcnRlZDtcblxuXHRcdHRocm93QmFkRXhwZWN0YXRpb24oXG5cdFx0XHRzZWxmLCBleHBlY3RlZFR5cGUsIG1lc3NhZ2UsXG5cdFx0XHRcIlRoZSAnZXhwZWN0ZWQnIHByaW1pdGl2ZSBpc24ndCBlcXVpdmFsZW50IHRvIHRoZSAnYWN0dWFsJyBkZXNjcmlwdG9yLlwiXG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiB0aHJvd0JhZEV4cGVjdGF0aW9uKHNlbGYsIGV4cGVjdGVkVHlwZSwgbWVzc2FnZSwgaGVhZGxpbmUpIHtcblx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdG1lc3NhZ2UgKyBcIkVycm9yIGluIHRlc3QuIFVzZSBhIGRpZmZlcmVudCAnZXhwZWN0ZWQnIHBhcmFtZXRlci5cXG5cIiArXG5cdFx0aGVhZGxpbmUgKyBcIlxcblwiICtcblx0XHRcIiAgJ2FjdHVhbCcgdHlwZTogICBcIiArIG9vcC5pbnN0YW5jZU5hbWUoc2VsZikgKyBcIiAoXCIgKyBzZWxmICsgXCIpXFxuXCIgK1xuXHRcdFwiICAnZXhwZWN0ZWQnIHR5cGU6IFwiICsgZXhwZWN0ZWRUeXBlXG5cdCk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIFBvc2l0aW9uRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uX2Rlc2NyaXB0b3IuanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRFZGdlKGVsZW1lbnQsIHBvc2l0aW9uKSB7XG5cdHZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuLi9xX2VsZW1lbnQuanNcIik7ICAgICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1FFbGVtZW50LCBTdHJpbmddKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKHBvc2l0aW9uID09PSBMRUZUIHx8IHBvc2l0aW9uID09PSBSSUdIVCkgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvbik7XG5cblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG5cdHRoaXMuX3Bvc2l0aW9uID0gcG9zaXRpb247XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgcmF3UG9zaXRpb24gPSB0aGlzLl9lbGVtZW50LmdldFJhd1Bvc2l0aW9uKCk7XG5cdHZhciBlZGdlID0gcmF3UG9zaXRpb25bdGhpcy5fcG9zaXRpb25dO1xuXG5cdHZhciBzY3JvbGwgPSB0aGlzLl9lbGVtZW50LmNvbnRleHQoKS5nZXRSYXdTY3JvbGxQb3NpdGlvbigpO1xuXHR2YXIgcmVuZGVyZWQgPSBlbGVtZW50UmVuZGVyZWQodGhpcy5fZWxlbWVudCk7XG5cblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBSSUdIVCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gTEVGVCkge1xuXHRcdGlmICghcmVuZGVyZWQpIHJldHVybiBQb3NpdGlvbi5ub1goKTtcblx0XHRyZXR1cm4gUG9zaXRpb24ueChlZGdlICsgc2Nyb2xsLngpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGlmICghcmVuZGVyZWQpIHJldHVybiBQb3NpdGlvbi5ub1koKTtcblx0XHRyZXR1cm4gUG9zaXRpb24ueShlZGdlICsgc2Nyb2xsLnkpO1xuXHR9XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZWxlbWVudCkge1xuXHRcdHJldHVybiBuZXcgTWUoZWxlbWVudCwgcG9zaXRpb24pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBlbGVtZW50UmVuZGVyZWQoZWxlbWVudCkge1xuXHR2YXIgaW5Eb20gPSBlbGVtZW50LmNvbnRleHQoKS5ib2R5KCkuY29udGFpbnMoZWxlbWVudCk7XG5cdHZhciBkaXNwbGF5Tm9uZSA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJkaXNwbGF5XCIpID09PSBcIm5vbmVcIjtcblxuXHRyZXR1cm4gaW5Eb20gJiYgIWRpc3BsYXlOb25lO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE2LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUmVuZGVyU3RhdGUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3JlbmRlcl9zdGF0ZS5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgRWxlbWVudFJlbmRlcmVkRWRnZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfcmVuZGVyZWRfZWRnZS5qc1wiKTtcbnZhciBHZW5lcmljU2l6ZSA9IHJlcXVpcmUoXCIuL2dlbmVyaWNfc2l6ZS5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9jZW50ZXIuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudFJlbmRlcmVkKGVsZW1lbnQpIHtcblx0dmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKTsgICAgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFFFbGVtZW50IF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG5cblx0Ly8gcHJvcGVydGllc1xuXHR0aGlzLnRvcCA9IEVsZW1lbnRSZW5kZXJlZEVkZ2UudG9wKGVsZW1lbnQpO1xuXHR0aGlzLnJpZ2h0ID0gRWxlbWVudFJlbmRlcmVkRWRnZS5yaWdodChlbGVtZW50KTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50UmVuZGVyZWRFZGdlLmJvdHRvbShlbGVtZW50KTtcblx0dGhpcy5sZWZ0ID0gRWxlbWVudFJlbmRlcmVkRWRnZS5sZWZ0KGVsZW1lbnQpO1xuXG5cdHRoaXMud2lkdGggPSBHZW5lcmljU2l6ZS5jcmVhdGUodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcInJlbmRlcmVkIHdpZHRoIG9mIFwiICsgZWxlbWVudCk7XG5cdHRoaXMuaGVpZ2h0ID0gR2VuZXJpY1NpemUuY3JlYXRlKHRoaXMudG9wLCB0aGlzLmJvdHRvbSwgXCJyZW5kZXJlZCBoZWlnaHQgb2YgXCIgKyBlbGVtZW50KTtcblxuXHR0aGlzLmNlbnRlciA9IENlbnRlci54KHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJyZW5kZXJlZCBjZW50ZXIgb2YgXCIgKyBlbGVtZW50KTtcblx0dGhpcy5taWRkbGUgPSBDZW50ZXIueSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwicmVuZGVyZWQgbWlkZGxlIG9mIFwiICsgZWxlbWVudCk7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGlmICh0aGlzLnRvcC52YWx1ZSgpLmVxdWFscyhQb3NpdGlvbi5ub1koKSkpIHJldHVybiBSZW5kZXJTdGF0ZS5ub3RSZW5kZXJlZCgpO1xuXHRlbHNlIHJldHVybiBSZW5kZXJTdGF0ZS5yZW5kZXJlZCgpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdHJldHVybiB0aGlzLl9lbGVtZW50LnRvU3RyaW5nKCkgKyBcIiByZW5kZXJpbmdcIjtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0cmV0dXJuIGFyZyA/IFJlbmRlclN0YXRlLnJlbmRlcmVkKCkgOiBSZW5kZXJTdGF0ZS5ub3RSZW5kZXJlZCgpO1xuXHR9XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIHF1aXhvdGUgPSByZXF1aXJlKFwiLi4vcXVpeG90ZS5qc1wiKTtcbnZhciBQb3NpdGlvbkRlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBRUGFnZSA9IHJlcXVpcmUoXCIuLi9xX3BhZ2UuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcblxudmFyIFRPUCA9IFwidG9wXCI7XG52YXIgUklHSFQgPSBcInJpZ2h0XCI7XG52YXIgQk9UVE9NID0gXCJib3R0b21cIjtcbnZhciBMRUZUID0gXCJsZWZ0XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudFZpc2libGVFZGdlKGVsZW1lbnQsIHBvc2l0aW9uKSB7XG5cdHZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuLi9xX2VsZW1lbnQuanNcIik7ICAgICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBRRWxlbWVudCwgU3RyaW5nIF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblxuXHRpZiAocG9zaXRpb24gPT09IExFRlQgfHwgcG9zaXRpb24gPT09IFJJR0hUKSBQb3NpdGlvbkRlc2NyaXB0b3IueCh0aGlzKTtcblx0ZWxzZSBpZiAocG9zaXRpb24gPT09IFRPUCB8fCBwb3NpdGlvbiA9PT0gQk9UVE9NKSBQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0ZWxzZSB1bmtub3duUG9zaXRpb24ocG9zaXRpb24pO1xuXG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXHR0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xufTtcblBvc2l0aW9uRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS50b3AgPSBmYWN0b3J5Rm4oVE9QKTtcbk1lLnJpZ2h0ID0gZmFjdG9yeUZuKFJJR0hUKTtcbk1lLmJvdHRvbSA9IGZhY3RvcnlGbihCT1RUT00pO1xuTWUubGVmdCA9IGZhY3RvcnlGbihMRUZUKTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKHBvc2l0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBmYWN0b3J5KGVsZW1lbnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQsIHBvc2l0aW9uKTtcblx0fTtcbn1cblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9wb3NpdGlvbiArIFwiIHJlbmRlcmVkIGVkZ2Ugb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG5cdHZhciBwb3NpdGlvbiA9IHRoaXMuX3Bvc2l0aW9uO1xuXHR2YXIgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XG5cdHZhciBwYWdlID0gZWxlbWVudC5jb250ZXh0KCkucGFnZSgpO1xuXG5cdGlmIChlbGVtZW50LnRvcC52YWx1ZSgpLmVxdWFscyhQb3NpdGlvbi5ub1koKSkpIHJldHVybiBub3RSZW5kZXJlZChwb3NpdGlvbik7XG5cdGlmIChlbGVtZW50LndpZHRoLnZhbHVlKCkuZXF1YWxzKFNpemUuY3JlYXRlKDApKSkgcmV0dXJuIG5vdFJlbmRlcmVkKHBvc2l0aW9uKTtcblx0aWYgKGVsZW1lbnQuaGVpZ2h0LnZhbHVlKCkuZXF1YWxzKFNpemUuY3JlYXRlKDApKSkgcmV0dXJuIG5vdFJlbmRlcmVkKHBvc2l0aW9uKTtcblxuXHRlbnN1cmUudGhhdChcblx0XHQhaGFzQ2xpcFBhdGhQcm9wZXJ0eShlbGVtZW50KSxcblx0XHRcIkNhbid0IGRldGVybWluZSBlbGVtZW50IHJlbmRlcmluZyBiZWNhdXNlIHRoZSBlbGVtZW50IGlzIGFmZmVjdGVkIGJ5IHRoZSAnY2xpcC1wYXRoJyBwcm9wZXJ0eSwgXCIgK1xuXHRcdFwid2hpY2ggUXVpeG90ZSBkb2Vzbid0IHN1cHBvcnQuXCJcblx0KTtcblxuXHR2YXIgYm91bmRzID0ge1xuXHRcdHRvcDogcGFnZS50b3AudmFsdWUoKSxcblx0XHRyaWdodDogbnVsbCxcblx0XHRib3R0b206IG51bGwsXG5cdFx0bGVmdDogcGFnZS5sZWZ0LnZhbHVlKClcblx0fTtcblxuXHRib3VuZHMgPSBpbnRlcnNlY3Rpb25XaXRoT3ZlcmZsb3coZWxlbWVudCwgYm91bmRzKTtcblx0Ym91bmRzID0gaW50ZXJzZWN0aW9uV2l0aENsaXAoZWxlbWVudCwgYm91bmRzKTtcblxuXHR2YXIgZWRnZXMgPSBpbnRlcnNlY3Rpb24oXG5cdFx0Ym91bmRzLFxuXHRcdGVsZW1lbnQudG9wLnZhbHVlKCksXG5cdFx0ZWxlbWVudC5yaWdodC52YWx1ZSgpLFxuXHRcdGVsZW1lbnQuYm90dG9tLnZhbHVlKCksXG5cdFx0ZWxlbWVudC5sZWZ0LnZhbHVlKClcblx0KTtcblxuXHRpZiAoaXNDbGlwcGVkT3V0T2ZFeGlzdGVuY2UoYm91bmRzLCBlZGdlcykpIHJldHVybiBub3RSZW5kZXJlZChwb3NpdGlvbik7XG5cdGVsc2UgcmV0dXJuIGVkZ2UoZWRnZXMsIHBvc2l0aW9uKTtcbn07XG5cbmZ1bmN0aW9uIGhhc0NsaXBQYXRoUHJvcGVydHkoZWxlbWVudCkge1xuXHR2YXIgY2xpcFBhdGggPSBlbGVtZW50LmdldFJhd1N0eWxlKFwiY2xpcC1wYXRoXCIpO1xuXHRyZXR1cm4gY2xpcFBhdGggIT09IFwibm9uZVwiICYmIGNsaXBQYXRoICE9PSBcIlwiO1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3Rpb25XaXRoT3ZlcmZsb3coZWxlbWVudCwgYm91bmRzKSB7XG5cdGZvciAodmFyIGNvbnRhaW5lciA9IGVsZW1lbnQucGFyZW50KCk7IGNvbnRhaW5lciAhPT0gbnVsbDsgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudCgpKSB7XG5cdFx0aWYgKGlzQ2xpcHBlZEJ5QW5jZXN0b3JPdmVyZmxvdyhlbGVtZW50LCBjb250YWluZXIpKSB7XG5cdFx0XHRib3VuZHMgPSBpbnRlcnNlY3Rpb24oXG5cdFx0XHRcdGJvdW5kcyxcblx0XHRcdFx0Y29udGFpbmVyLnRvcC52YWx1ZSgpLFxuXHRcdFx0XHRjb250YWluZXIucmlnaHQudmFsdWUoKSxcblx0XHRcdFx0Y29udGFpbmVyLmJvdHRvbS52YWx1ZSgpLFxuXHRcdFx0XHRjb250YWluZXIubGVmdC52YWx1ZSgpXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBib3VuZHM7XG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdGlvbldpdGhDbGlwKGVsZW1lbnQsIGJvdW5kcykge1xuXHQvLyBXT1JLQVJPVU5EIElFIDg6IERvZXNuJ3QgaGF2ZSBhbnkgd2F5IHRvIGRldGVjdCAnY2xpcDogYXV0bycgdmFsdWUuXG5cdGVuc3VyZS50aGF0KCFxdWl4b3RlLmJyb3dzZXIubWlzcmVwb3J0c0NsaXBBdXRvUHJvcGVydHkoKSxcblx0XHRcIkNhbid0IGRldGVybWluZSBlbGVtZW50IHJlbmRlcmluZyBvbiB0aGlzIGJyb3dzZXIgYmVjYXVzZSBpdCBtaXNyZXBvcnRzIHRoZSB2YWx1ZSBvZiB0aGVcIiArXG5cdFx0XCIgYGNsaXA6IGF1dG9gIHByb3BlcnR5LiBZb3UgY2FuIHVzZSBgcXVpeG90ZS5icm93c2VyLm1pc3JlcG9ydHNDbGlwQXV0b1Byb3BlcnR5KClgIHRvIHNraXAgdGhpcyBicm93c2VyLlwiXG5cdCk7XG5cblx0Zm9yICggOyBlbGVtZW50ICE9PSBudWxsOyBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnQoKSkge1xuXHRcdHZhciBjbGlwID0gZWxlbWVudC5nZXRSYXdTdHlsZShcImNsaXBcIik7XG5cdFx0aWYgKGNsaXAgPT09IFwiYXV0b1wiIHx8ICFjYW5CZUNsaXBwZWRCeUNsaXBQcm9wZXJ0eShlbGVtZW50KSkgY29udGludWU7XG5cblx0XHR2YXIgY2xpcEVkZ2VzID0gbm9ybWFsaXplQ2xpcFByb3BlcnR5KGVsZW1lbnQsIGNsaXApO1xuXHRcdGJvdW5kcyA9IGludGVyc2VjdGlvbihcblx0XHRcdGJvdW5kcyxcblx0XHRcdGNsaXBFZGdlcy50b3AsXG5cdFx0XHRjbGlwRWRnZXMucmlnaHQsXG5cdFx0XHRjbGlwRWRnZXMuYm90dG9tLFxuXHRcdFx0Y2xpcEVkZ2VzLmxlZnRcblx0XHQpO1xuXHR9XG5cblx0cmV0dXJuIGJvdW5kcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQ2xpcFByb3BlcnR5KGVsZW1lbnQsIGNsaXApIHtcblx0dmFyIGNsaXBWYWx1ZXMgPSBwYXJzZUNsaXBQcm9wZXJ0eShlbGVtZW50LCBjbGlwKTtcblxuXHRyZXR1cm4ge1xuXHRcdHRvcDogY2xpcFZhbHVlc1swXSA9PT0gXCJhdXRvXCIgP1xuXHRcdFx0ZWxlbWVudC50b3AudmFsdWUoKSA6XG5cdFx0XHRlbGVtZW50LnRvcC52YWx1ZSgpLnBsdXMoUG9zaXRpb24ueShOdW1iZXIoY2xpcFZhbHVlc1swXSkpKSxcblx0XHRyaWdodDogY2xpcFZhbHVlc1sxXSA9PT0gXCJhdXRvXCIgP1xuXHRcdFx0ZWxlbWVudC5yaWdodC52YWx1ZSgpIDpcblx0XHRcdGVsZW1lbnQubGVmdC52YWx1ZSgpLnBsdXMoUG9zaXRpb24ueChOdW1iZXIoY2xpcFZhbHVlc1sxXSkpKSxcblx0XHRib3R0b206IGNsaXBWYWx1ZXNbMl0gPT09IFwiYXV0b1wiID9cblx0XHRcdGVsZW1lbnQuYm90dG9tLnZhbHVlKCkgOlxuXHRcdFx0ZWxlbWVudC50b3AudmFsdWUoKS5wbHVzKFBvc2l0aW9uLnkoTnVtYmVyKGNsaXBWYWx1ZXNbMl0pKSksXG5cdFx0bGVmdDogY2xpcFZhbHVlc1szXSA9PT0gXCJhdXRvXCIgP1xuXHRcdFx0ZWxlbWVudC5sZWZ0LnZhbHVlKCkgOlxuXHRcdFx0ZWxlbWVudC5sZWZ0LnZhbHVlKCkucGx1cyhQb3NpdGlvbi54KE51bWJlcihjbGlwVmFsdWVzWzNdKSkpXG5cdH07XG5cblx0ZnVuY3Rpb24gcGFyc2VDbGlwUHJvcGVydHkoZWxlbWVudCwgY2xpcCkge1xuXHRcdC8vIFdPUktBUk9VTkQgSUUgMTEsIENocm9tZSBNb2JpbGUgNDQ6IFJlcG9ydHMgMHB4IGluc3RlYWQgb2YgJ2F1dG8nIHdoZW4gY29tcHV0aW5nIHJlY3QoKSBpbiBjbGlwIHByb3BlcnR5LlxuXHRcdGVuc3VyZS50aGF0KCFxdWl4b3RlLmJyb3dzZXIubWlzcmVwb3J0c0F1dG9WYWx1ZXNJbkNsaXBQcm9wZXJ0eSgpLFxuXHRcdFx0XCJDYW4ndCBkZXRlcm1pbmUgZWxlbWVudCByZW5kZXJpbmcgb24gdGhpcyBicm93c2VyIGJlY2F1c2UgaXQgbWlzcmVwb3J0cyB0aGUgdmFsdWUgb2YgdGhlIGBjbGlwYFwiICtcblx0XHRcdFwiIHByb3BlcnR5LiBZb3UgY2FuIHVzZSBgcXVpeG90ZS5icm93c2VyLm1pc3JlcG9ydHNBdXRvVmFsdWVzSW5DbGlwUHJvcGVydHkoKWAgdG8gc2tpcCB0aGlzIGJyb3dzZXIuXCJcblx0XHQpO1xuXG5cdFx0dmFyIGNsaXBSZWdleCA9IC9yZWN0XFwoKC4qPyksPyAoLio/KSw/ICguKj8pLD8gKC4qPylcXCkvO1xuXHRcdHZhciBtYXRjaGVzID0gY2xpcFJlZ2V4LmV4ZWMoY2xpcCk7XG5cdFx0ZW5zdXJlLnRoYXQobWF0Y2hlcyAhPT0gbnVsbCwgXCJVbmFibGUgdG8gcGFyc2UgY2xpcCBwcm9wZXJ0eTogXCIgKyBjbGlwKTtcblxuXHRcdHJldHVybiBbXG5cdFx0XHRwYXJzZUxlbmd0aChtYXRjaGVzWzFdLCBjbGlwKSxcblx0XHRcdHBhcnNlTGVuZ3RoKG1hdGNoZXNbMl0sIGNsaXApLFxuXHRcdFx0cGFyc2VMZW5ndGgobWF0Y2hlc1szXSwgY2xpcCksXG5cdFx0XHRwYXJzZUxlbmd0aChtYXRjaGVzWzRdLCBjbGlwKVxuXHRcdF07XG5cdH1cblxuXHRmdW5jdGlvbiBwYXJzZUxlbmd0aChweFN0cmluZywgY2xpcCkge1xuXHRcdGlmIChweFN0cmluZyA9PT0gXCJhdXRvXCIpIHJldHVybiBweFN0cmluZztcblxuXHRcdHZhciBweFJlZ2V4ID0gL14oLio/KXB4JC87XG5cdFx0dmFyIG1hdGNoZXMgPSBweFJlZ2V4LmV4ZWMocHhTdHJpbmcpO1xuXHRcdGVuc3VyZS50aGF0KG1hdGNoZXMgIT09IG51bGwsIFwiVW5hYmxlIHRvIHBhcnNlICdcIiArIHB4U3RyaW5nICsgXCInIGluIGNsaXAgcHJvcGVydHk6IFwiICsgY2xpcCk7XG5cblx0XHRyZXR1cm4gbWF0Y2hlc1sxXTtcblx0fVxufVxuXG5mdW5jdGlvbiBpc0NsaXBwZWRCeUFuY2VzdG9yT3ZlcmZsb3coZWxlbWVudCwgYW5jZXN0b3IpIHtcblx0cmV0dXJuIGNhbkJlQ2xpcHBlZEJ5T3ZlcmZsb3dQcm9wZXJ0eShlbGVtZW50KSAmJiBoYXNDbGlwcGluZ092ZXJmbG93KGFuY2VzdG9yKTtcbn1cblxuZnVuY3Rpb24gY2FuQmVDbGlwcGVkQnlPdmVyZmxvd1Byb3BlcnR5KGVsZW1lbnQpIHtcblx0dmFyIHBvc2l0aW9uID0gZWxlbWVudC5nZXRSYXdTdHlsZShcInBvc2l0aW9uXCIpO1xuXHRzd2l0Y2ggKHBvc2l0aW9uKSB7XG5cdFx0Y2FzZSBcInN0YXRpY1wiOlxuXHRcdGNhc2UgXCJyZWxhdGl2ZVwiOlxuXHRcdGNhc2UgXCJhYnNvbHV0ZVwiOlxuXHRcdGNhc2UgXCJzdGlja3lcIjpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGNhc2UgXCJmaXhlZFwiOlxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIHBvc2l0aW9uIHByb3BlcnR5OiBcIiArIHBvc2l0aW9uKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYXNDbGlwcGluZ092ZXJmbG93KGVsZW1lbnQpIHtcblx0cmV0dXJuIGNsaXBzKFwib3ZlcmZsb3cteFwiKSB8fCBjbGlwcyhcIm92ZXJmbG93LXlcIik7XG5cblx0ZnVuY3Rpb24gY2xpcHMoc3R5bGUpIHtcblx0XHR2YXIgb3ZlcmZsb3cgPSBlbGVtZW50LmdldFJhd1N0eWxlKHN0eWxlKTtcblx0XHRzd2l0Y2ggKG92ZXJmbG93KSB7XG5cdFx0XHRjYXNlIFwiaGlkZGVuXCI6XG5cdFx0XHRjYXNlIFwic2Nyb2xsXCI6XG5cdFx0XHRjYXNlIFwiYXV0b1wiOlxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdGNhc2UgXCJ2aXNpYmxlXCI6XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGVuc3VyZS51bnJlYWNoYWJsZShcIlVua25vd24gXCIgKyBzdHlsZSArIFwiIHByb3BlcnR5OiBcIiArIG92ZXJmbG93KTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gY2FuQmVDbGlwcGVkQnlDbGlwUHJvcGVydHkoZWxlbWVudCkge1xuXHR2YXIgcG9zaXRpb24gPSBlbGVtZW50LmdldFJhd1N0eWxlKFwicG9zaXRpb25cIik7XG5cdHN3aXRjaCAocG9zaXRpb24pIHtcblx0XHRjYXNlIFwiYWJzb2x1dGVcIjpcblx0XHRjYXNlIFwiZml4ZWRcIjpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGNhc2UgXCJzdGF0aWNcIjpcblx0XHRjYXNlIFwicmVsYXRpdmVcIjpcblx0XHRjYXNlIFwic3RpY2t5XCI6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGVuc3VyZS51bnJlYWNoYWJsZShcIlVua25vd24gcG9zaXRpb24gcHJvcGVydHk6IFwiICsgcG9zaXRpb24pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdGlvbihib3VuZHMsIHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xuXHRib3VuZHMudG9wID0gYm91bmRzLnRvcC5tYXgodG9wKTtcblx0Ym91bmRzLnJpZ2h0ID0gKGJvdW5kcy5yaWdodCA9PT0gbnVsbCkgPyByaWdodCA6IGJvdW5kcy5yaWdodC5taW4ocmlnaHQpO1xuXHRib3VuZHMuYm90dG9tID0gKGJvdW5kcy5ib3R0b20gPT09IG51bGwpID8gYm90dG9tIDogYm91bmRzLmJvdHRvbS5taW4oYm90dG9tKTtcblx0Ym91bmRzLmxlZnQgPSBib3VuZHMubGVmdC5tYXgobGVmdCk7XG5cblx0cmV0dXJuIGJvdW5kcztcbn1cblxuZnVuY3Rpb24gaXNDbGlwcGVkT3V0T2ZFeGlzdGVuY2UoYm91bmRzLCBlZGdlcykge1xuXHRyZXR1cm4gKGJvdW5kcy50b3AuY29tcGFyZShlZGdlcy5ib3R0b20pID49IDApIHx8XG5cdFx0KGJvdW5kcy5yaWdodCAhPT0gbnVsbCAmJiBib3VuZHMucmlnaHQuY29tcGFyZShlZGdlcy5sZWZ0KSA8PSAwKSB8fFxuXHRcdChib3VuZHMuYm90dG9tICE9PSBudWxsICYmIGJvdW5kcy5ib3R0b20uY29tcGFyZShlZGdlcy50b3ApIDw9IDApIHx8XG5cdFx0KGJvdW5kcy5sZWZ0LmNvbXBhcmUoZWRnZXMucmlnaHQpID49IDApO1xufVxuXG5mdW5jdGlvbiBub3RSZW5kZXJlZChwb3NpdGlvbikge1xuXHRzd2l0Y2gocG9zaXRpb24pIHtcblx0XHRjYXNlIFRPUDpcblx0XHRjYXNlIEJPVFRPTTpcblx0XHRcdHJldHVybiBQb3NpdGlvbi5ub1koKTtcblx0XHRjYXNlIExFRlQ6XG5cdFx0Y2FzZSBSSUdIVDpcblx0XHRcdHJldHVybiBQb3NpdGlvbi5ub1goKTtcblx0XHRkZWZhdWx0OiB1bmtub3duUG9zaXRpb24ocG9zaXRpb24pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGVkZ2UoZWRnZXMsIHBvc2l0aW9uKSB7XG5cdHN3aXRjaChwb3NpdGlvbikge1xuXHRcdGNhc2UgVE9QOiByZXR1cm4gZWRnZXMudG9wO1xuXHRcdGNhc2UgUklHSFQ6IHJldHVybiBlZGdlcy5yaWdodDtcblx0XHRjYXNlIEJPVFRPTTogcmV0dXJuIGVkZ2VzLmJvdHRvbTtcblx0XHRjYXNlIExFRlQ6IHJldHVybiBlZGdlcy5sZWZ0O1xuXHRcdGRlZmF1bHQ6IHVua25vd25Qb3NpdGlvbihwb3NpdGlvbik7XG5cdH1cbn1cblxuZnVuY3Rpb24gdW5rbm93blBvc2l0aW9uKHBvc2l0aW9uKSB7XG5cdGVuc3VyZS51bnJlYWNoYWJsZShcIlVua25vd24gcG9zaXRpb246IFwiICsgcG9zaXRpb24pO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbkRlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9wb3NpdGlvbl9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemVEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vc2l6ZV9kZXNjcmlwdG9yLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEdlbmVyaWNTaXplKGZyb20sIHRvLCBkZXNjcmlwdGlvbikge1xuICBlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBQb3NpdGlvbkRlc2NyaXB0b3IsIFBvc2l0aW9uRGVzY3JpcHRvciwgU3RyaW5nIF0pO1xuXG4gIHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblxuICB0aGlzLl9mcm9tID0gZnJvbTtcbiAgdGhpcy5fdG8gPSB0bztcbiAgdGhpcy5fZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbn07XG5TaXplRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbihmcm9tLCB0bywgZGVzY3JpcHRpb24pIHtcbiAgcmV0dXJuIG5ldyBNZShmcm9tLCB0bywgZGVzY3JpcHRpb24pO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gIGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG4gIHJldHVybiB0aGlzLl9mcm9tLnZhbHVlKCkuZGlzdGFuY2VUbyh0aGlzLl90by52YWx1ZSgpKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fZGVzY3JpcHRpb247XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFBvc2l0aW9uRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uX2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xuXG52YXIgVE9QID0gXCJ0b3BcIjtcbnZhciBSSUdIVCA9IFwicmlnaHRcIjtcbnZhciBCT1RUT00gPSBcImJvdHRvbVwiO1xudmFyIExFRlQgPSBcImxlZnRcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBQYWdlRWRnZShlZGdlLCBicm93c2luZ0NvbnRleHQpIHtcblx0dmFyIEJyb3dzaW5nQ29udGV4dCA9IHJlcXVpcmUoXCIuLi9icm93c2luZ19jb250ZXh0LmpzXCIpOyAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBCcm93c2luZ0NvbnRleHQgXSk7XG5cblx0dGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXG5cdGlmIChlZGdlID09PSBMRUZUIHx8IGVkZ2UgPT09IFJJR0hUKSBQb3NpdGlvbkRlc2NyaXB0b3IueCh0aGlzKTtcblx0ZWxzZSBpZiAoZWRnZSA9PT0gVE9QIHx8IGVkZ2UgPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBlZGdlOiBcIiArIGVkZ2UpO1xuXG5cdHRoaXMuX2VkZ2UgPSBlZGdlO1xuXHR0aGlzLl9icm93c2luZ0NvbnRleHQgPSBicm93c2luZ0NvbnRleHQ7XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgc2l6ZSA9IHBhZ2VTaXplKHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5jb250ZW50RG9jdW1lbnQpO1xuXHRzd2l0Y2godGhpcy5fZWRnZSkge1xuXHRcdGNhc2UgVE9QOiByZXR1cm4gUG9zaXRpb24ueSgwKTtcblx0XHRjYXNlIFJJR0hUOiByZXR1cm4gUG9zaXRpb24ueChzaXplLndpZHRoKTtcblx0XHRjYXNlIEJPVFRPTTogcmV0dXJuIFBvc2l0aW9uLnkoc2l6ZS5oZWlnaHQpO1xuXHRcdGNhc2UgTEVGVDogcmV0dXJuIFBvc2l0aW9uLngoMCk7XG5cblx0XHRkZWZhdWx0OiBlbnN1cmUudW5yZWFjaGFibGUoKTtcblx0fVxufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0c3dpdGNoKHRoaXMuX2VkZ2UpIHtcblx0XHRjYXNlIFRPUDogcmV0dXJuIFwidG9wIG9mIHBhZ2VcIjtcblx0XHRjYXNlIFJJR0hUOiByZXR1cm4gXCJyaWdodCBzaWRlIG9mIHBhZ2VcIjtcblx0XHRjYXNlIEJPVFRPTTogcmV0dXJuIFwiYm90dG9tIG9mIHBhZ2VcIjtcblx0XHRjYXNlIExFRlQ6IHJldHVybiBcImxlZnQgc2lkZSBvZiBwYWdlXCI7XG5cblx0XHRkZWZhdWx0OiBlbnN1cmUudW5yZWFjaGFibGUoKTtcblx0fVxufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKGVkZ2UpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoYnJvd3NpbmdDb250ZXh0KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShlZGdlLCBicm93c2luZ0NvbnRleHQpO1xuXHR9O1xufVxuXG5cbi8vIFVTRUZVTCBSRUFESU5HOiBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL21vYmlsZS92aWV3cG9ydHMuaHRtbFxuLy8gYW5kIGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvbW9iaWxlL3ZpZXdwb3J0czIuaHRtbFxuXG4vLyBBUEkgU0VNQU5USUNTLlxuLy8gUmVmIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DU1NfT2JqZWN0X01vZGVsL0RldGVybWluaW5nX3RoZV9kaW1lbnNpb25zX29mX2VsZW1lbnRzXG4vLyAgICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDogc3VtIG9mIGJvdW5kaW5nIGJveGVzIG9mIGVsZW1lbnQgKHRoZSBkaXNwbGF5ZWQgd2lkdGggb2YgdGhlIGVsZW1lbnQsXG4vLyAgICAgIGluY2x1ZGluZyBwYWRkaW5nIGFuZCBib3JkZXIpLiBGcmFjdGlvbmFsLiBBcHBsaWVzIHRyYW5zZm9ybWF0aW9ucy5cbi8vICAgIGNsaWVudFdpZHRoOiB2aXNpYmxlIHdpZHRoIG9mIGVsZW1lbnQgaW5jbHVkaW5nIHBhZGRpbmcgKGJ1dCBub3QgYm9yZGVyKS4gRVhDRVBUIG9uIHJvb3QgZWxlbWVudCAoaHRtbCksIHdoZXJlXG4vLyAgICAgIGl0IGlzIHRoZSB3aWR0aCBvZiB0aGUgdmlld3BvcnQuIFJvdW5kcyB0byBhbiBpbnRlZ2VyLiBEb2Vzbid0IGFwcGx5IHRyYW5zZm9ybWF0aW9ucy5cbi8vICAgIG9mZnNldFdpZHRoOiB2aXNpYmxlIHdpZHRoIG9mIGVsZW1lbnQgaW5jbHVkaW5nIHBhZGRpbmcsIGJvcmRlciwgYW5kIHNjcm9sbGJhcnMgKGlmIGFueSkuIFJvdW5kcyB0byBhbiBpbnRlZ2VyLlxuLy8gICAgICBEb2Vzbid0IGFwcGx5IHRyYW5zZm9ybWF0aW9ucy5cbi8vICAgIHNjcm9sbFdpZHRoOiBlbnRpcmUgd2lkdGggb2YgZWxlbWVudCwgaW5jbHVkaW5nIGFueSBwYXJ0IHRoYXQncyBub3QgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsYmFycy4gUm91bmRzIHRvXG4vLyAgICAgIGFuIGludGVnZXIuIERvZXNuJ3QgYXBwbHkgdHJhbnNmb3JtYXRpb25zLiBOb3QgY2xlYXIgaWYgaXQgaW5jbHVkZXMgc2Nyb2xsYmFycywgYnV0IEkgdGhpbmsgbm90LiBBbHNvXG4vLyAgICAgIG5vdCBjbGVhciBpZiBpdCBpbmNsdWRlcyBib3JkZXJzIG9yIHBhZGRpbmcuIChCdXQgZnJvbSB0ZXN0cywgYXBwYXJlbnRseSBub3QgYm9yZGVycy4gRXhjZXB0IG9uIHJvb3Rcbi8vICAgICAgZWxlbWVudCBhbmQgYm9keSBlbGVtZW50LCB3aGljaCBoYXZlIHNwZWNpYWwgcmVzdWx0cyB0aGF0IHZhcnkgYnkgYnJvd3Nlci4pXG5cbi8vIFRFU1QgUkVTVUxUUzogV0lEVEhcbi8vICAg4pyUID0gY29ycmVjdCBhbnN3ZXJcbi8vICAg4pyYID0gaW5jb3JyZWN0IGFuc3dlciBhbmQgZGl2ZXJnZXMgZnJvbSBzcGVjXG4vLyAgIH4gPSBpbmNvcnJlY3QgYW5zd2VyLCBidXQgbWF0Y2hlcyBzcGVjXG4vLyBCUk9XU0VSUyBURVNURUQ6IFNhZmFyaSA2LjIuMCAoTWFjIE9TIFggMTAuOC41KTsgTW9iaWxlIFNhZmFyaSA3LjAuMCAoaU9TIDcuMSk7IEZpcmVmb3ggMzIuMC4wIChNYWMgT1MgWCAxMC44KTtcbi8vICAgIEZpcmVmb3ggMzMuMC4wIChXaW5kb3dzIDcpOyBDaHJvbWUgMzguMC4yMTI1IChNYWMgT1MgWCAxMC44LjUpOyBDaHJvbWUgMzguMC4yMTI1IChXaW5kb3dzIDcpOyBJRSA4LCA5LCAxMCwgMTFcblxuLy8gaHRtbCB3aWR0aCBzdHlsZSBzbWFsbGVyIHRoYW4gdmlld3BvcnQgd2lkdGg7IGJvZHkgd2lkdGggc3R5bGUgc21hbGxlciB0aGFuIGh0bWwgd2lkdGggc3R5bGVcbi8vICBOT1RFOiBUaGVzZSB0ZXN0cyB3ZXJlIGNvbmR1Y3RlZCB3aGVuIGNvcnJlY3QgcmVzdWx0IHdhcyB3aWR0aCBvZiBib3JkZXIuIFRoYXQgaGFzIGJlZW4gY2hhbmdlZFxuLy8gIHRvIFwid2lkdGggb2Ygdmlld3BvcnQuXCJcbi8vICAgIGh0bWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcbi8vICAgICAg4pyYIElFIDgsIDksIDEwOiB3aWR0aCBvZiB2aWV3cG9ydFxuLy8gICAgICDinJQgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDExOiB3aWR0aCBvZiBodG1sLCBpbmNsdWRpbmcgYm9yZGVyXG4vLyAgICBodG1sLmNsaWVudFdpZHRoXG4vLyAgICAgIH4gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogd2lkdGggb2Ygdmlld3BvcnRcbi8vICAgIGh0bWwub2Zmc2V0V2lkdGhcbi8vICAgICAg4pyYIElFIDgsIDksIDEwOiB3aWR0aCBvZiB2aWV3cG9ydFxuLy8gICAgICDinJQgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDExOiB3aWR0aCBvZiBodG1sLCBpbmNsdWRpbmcgYm9yZGVyXG4vLyAgICBodG1sLnNjcm9sbFdpZHRoXG4vLyAgICAgIOKcmCBJRSA4LCA5LCAxMCwgMTEsIEZpcmVmb3g6IHdpZHRoIG9mIHZpZXdwb3J0XG4vLyAgICAgIH4gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IHdpZHRoIG9mIGh0bWwsIGV4Y2x1ZGluZyBib3JkZXJcbi8vICAgIGJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcbi8vICAgICAgfiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB3aWR0aCBvZiBib2R5LCBpbmNsdWRpbmcgYm9yZGVyXG4vLyAgICBib2R5LmNsaWVudFdpZHRoXG4vLyAgICAgIH4gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogd2lkdGggb2YgYm9keSwgZXhjbHVkaW5nIGJvcmRlclxuLy8gICAgYm9keS5vZmZzZXRXaWR0aFxuLy8gICAgICB+IFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHdpZHRoIG9mIGJvZHksIGluY2x1ZGluZyBib3JkZXJcbi8vICAgIGJvZHkuc2Nyb2xsV2lkdGhcbi8vICAgICAg4pyYIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lOiB3aWR0aCBvZiB2aWV3cG9ydFxuLy8gICAgICB+IEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogd2lkdGggb2YgYm9keSwgZXhjbHVkaW5nIGJvcmRlclxuXG4vLyBlbGVtZW50IHdpZHRoIHN0eWxlIHdpZGVyIHRoYW4gdmlld3BvcnQ7IGJvZHkgYW5kIGh0bWwgd2lkdGggc3R5bGVzIGF0IGRlZmF1bHRcbi8vIEJST1dTRVIgQkVIQVZJT1I6IGh0bWwgYW5kIGJvZHkgYm9yZGVyIGV4dGVuZCB0byB3aWR0aCBvZiB2aWV3cG9ydCBhbmQgbm90IGJleW9uZCAoZXhjZXB0IG9uIE1vYmlsZSBTYWZhcmkpXG4vLyBDb3JyZWN0IHJlc3VsdCBpcyBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXItbGVmdCArIGh0bWwgYm9yZGVyLWxlZnQgKGV4Y2VwdCBvbiBNb2JpbGUgU2FmYXJpKVxuLy8gTW9iaWxlIFNhZmFyaSB1c2VzIGEgbGF5b3V0IHZpZXdwb3J0LCBzbyBpdCdzIGV4cGVjdGVkIHRvIGluY2x1ZGUgYm9keSBib3JkZXItcmlnaHQgYW5kIGh0bWwgYm9yZGVyLXJpZ2h0LlxuLy8gICAgaHRtbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyICsgaHRtbCBib3JkZXJcbi8vICAgICAgfiBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB2aWV3cG9ydCB3aWR0aFxuLy8gICAgaHRtbC5jbGllbnRXaWR0aFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyICsgaHRtbCBib3JkZXJcbi8vICAgICAgfiBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB2aWV3cG9ydCB3aWR0aFxuLy8gICAgaHRtbC5vZmZzZXRXaWR0aFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyICsgaHRtbCBib3JkZXJcbi8vICAgICAgfiBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB2aWV3cG9ydCB3aWR0aFxuLy8gICAgaHRtbC5zY3JvbGxXaWR0aFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyICsgaHRtbCBib3JkZXJcbi8vICAgICAg4pyYIFNhZmFyaSwgQ2hyb21lOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXItbGVmdCAoQlVUIE5PVCBodG1sIGJvcmRlci1sZWZ0KVxuLy8gICAgICDinJQgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXItbGVmdCArIGh0bWwgYm9yZGVyLWxlZnRcbi8vICAgIGJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcbi8vICAgICAgfiBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXJcbi8vICAgICAgfiBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB2aWV3cG9ydCB3aWR0aCAtIGh0bWwgYm9yZGVyXG4vLyAgICBib2R5LmNsaWVudFdpZHRoXG4vLyAgICAgIH4gTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aFxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoIC0gaHRtbCBib3JkZXIgLSBib2R5IGJvcmRlclxuLy8gICAgYm9keS5vZmZzZXRXaWR0aFxuLy8gICAgICB+IE1vYmlsZSBTYWZhcmk6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoIC0gaHRtbCBib3JkZXJcbi8vICAgIGJvZHkuc2Nyb2xsV2lkdGhcbi8vICAgICAg4pyUIE1vYmlsZSBTYWZhcmk6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlciArIGh0bWwgYm9yZGVyXG4vLyAgICAgIOKclCBTYWZhcmksIENocm9tZTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyLWxlZnQgKyBodG1sIGJvcmRlci1sZWZ0IChtYXRjaGVzIGFjdHVhbCBicm93c2VyKVxuLy8gICAgICB+IEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogZWxlbWVudCB3aWR0aFxuXG4vLyBURVNUIFJFU1VMVFM6IEhFSUdIVFxuLy8gICDinJQgPSBjb3JyZWN0IGFuc3dlclxuLy8gICDinJggPSBpbmNvcnJlY3QgYW5zd2VyIGFuZCBkaXZlcmdlcyBmcm9tIHNwZWNcbi8vICAgfiA9IGluY29ycmVjdCBhbnN3ZXIsIGJ1dCBtYXRjaGVzIHNwZWNcblxuLy8gaHRtbCBoZWlnaHQgc3R5bGUgc21hbGxlciB0aGFuIHZpZXdwb3J0IGhlaWdodDsgYm9keSBoZWlnaHQgc3R5bGUgc21hbGxlciB0aGFuIGh0bWwgaGVpZ2h0IHN0eWxlXG4vLyAgTk9URTogVGhlc2UgdGVzdHMgd2VyZSBjb25kdWN0ZWQgd2hlbiBjb3JyZWN0IHJlc3VsdCB3YXMgaGVpZ2h0IG9mIHZpZXdwb3J0LlxuLy8gICAgaHRtbC5jbGllbnRIZWlnaHRcbi8vICAgICAg4pyUIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGhlaWdodCBvZiB2aWV3cG9ydFxuXG4vLyBlbGVtZW50IGhlaWdodCBzdHlsZSB0YWxsZXIgdGhhbiB2aWV3cG9ydDsgYm9keSBhbmQgaHRtbCB3aWR0aCBzdHlsZXMgYXQgZGVmYXVsdFxuLy8gQlJPV1NFUiBCRUhBVklPUjogaHRtbCBhbmQgYm9keSBib3JkZXIgZW5jbG9zZSBlbnRpcmUgZWxlbWVudFxuLy8gQ29ycmVjdCByZXN1bHQgaXMgZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyLXRvcCArIGh0bWwgYm9yZGVyLXRvcCArIGJvZHkgYm9yZGVyLWJvdHRvbSArIGh0bWwgYm9yZGVyLWJvdHRvbVxuLy8gICAgaHRtbC5jbGllbnRIZWlnaHRcbi8vICAgICAg4pyUIE1vYmlsZSBTYWZhcmk6IGVsZW1lbnQgaGVpZ2h0ICsgYWxsIGJvcmRlcnNcbi8vICAgICAgfiBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBoZWlnaHQgb2Ygdmlld3BvcnRcbi8vICAgIGh0bWwuc2Nyb2xsSGVpZ2h0XG4vLyAgICAgIOKclCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGVsZW1lbnQgaGVpZ2h0ICsgYWxsIGJvcmRlcnNcbi8vICAgICAg4pyYIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lOiBlbGVtZW50IGhlaWdodCArIGh0bWwgYm9yZGVyLWJvdHRvbVxuLy8gICAgYm9keS5zY3JvbGxIZWlnaHRcbi8vICAgICAg4pyUIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lOiBlbGVtZW50IGhlaWdodCArIGFsbCBib3JkZXJzXG4vLyAgICAgIH4gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBlbGVtZW50IGhlaWdodCAoYm9keSBoZWlnaHQgLSBib2R5IGJvcmRlcilcbmZ1bmN0aW9uIHBhZ2VTaXplKGRvY3VtZW50KSB7XG5cdHZhciBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXHR2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cbi8vIEJFU1QgV0lEVEggQU5TV0VSIFNPIEZBUiAoQVNTVU1JTkcgVklFV1BPUlQgSVMgTUlOSU1VTSBBTlNXRVIpOlxuXHR2YXIgd2lkdGggPSBNYXRoLm1heChib2R5LnNjcm9sbFdpZHRoLCBodG1sLnNjcm9sbFdpZHRoKTtcblxuLy8gQkVTVCBIRUlHSFQgQU5TV0VSIFNPIEZBUiAoQVNTVU1JTkcgVklFV1BPUlQgSVMgTUlOSU1VTSBBTlNXRVIpOlxuXHR2YXIgaGVpZ2h0ID0gTWF0aC5tYXgoYm9keS5zY3JvbGxIZWlnaHQsIGh0bWwuc2Nyb2xsSGVpZ2h0KTtcblxuXHRyZXR1cm4ge1xuXHRcdHdpZHRoOiB3aWR0aCxcblx0XHRoZWlnaHQ6IGhlaWdodFxuXHR9O1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuLyplc2xpbnQgbmV3LWNhcDogXCJvZmZcIiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcblxuLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jaWVzXG5mdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKCkge1xuXHRyZXR1cm4gcmVxdWlyZShcIi4vcmVsYXRpdmVfcG9zaXRpb24uanNcIik7XG59XG5mdW5jdGlvbiBBYnNvbHV0ZVBvc2l0aW9uKCkge1xuXHRyZXR1cm4gcmVxdWlyZShcIi4vYWJzb2x1dGVfcG9zaXRpb24uanNcIik7XG59XG5mdW5jdGlvbiBHZW5lcmljU2l6ZSgpIHtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL2dlbmVyaWNfc2l6ZS5qc1wiKTtcbn1cblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBQb3NpdGlvbkRlc2NyaXB0b3IoZGltZW5zaW9uKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiUG9zaXRpb25EZXNjcmlwdG9yIGlzIGFic3RyYWN0IGFuZCBzaG91bGQgbm90IGJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5LlwiKTtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xuXG5NZS54ID0gZmFjdG9yeUZuKFhfRElNRU5TSU9OKTtcbk1lLnkgPSBmYWN0b3J5Rm4oWV9ESU1FTlNJT04pO1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uKCkucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbigpLmRvd24odGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRpZiAodGhpcy5fcGRiYy5kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbigpLmxlZnQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbigpLnVwKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG8gPSBmdW5jdGlvbiB0byhwb3NpdGlvbikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1sgTWUsIE51bWJlciBdXSk7XG5cdGlmICh0eXBlb2YgcG9zaXRpb24gPT09IFwibnVtYmVyXCIpIHtcblx0XHRpZiAodGhpcy5fcGRiYy5kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSBwb3NpdGlvbiA9IEFic29sdXRlUG9zaXRpb24oKS54KHBvc2l0aW9uKTtcblx0XHRlbHNlIHBvc2l0aW9uID0gQWJzb2x1dGVQb3NpdGlvbigpLnkocG9zaXRpb24pO1xuXHR9XG5cdGlmICh0aGlzLl9wZGJjLmRpbWVuc2lvbiAhPT0gcG9zaXRpb24uX3BkYmMuZGltZW5zaW9uKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY2FsY3VsYXRlIGRpc3RhbmNlIGJldHdlZW4gYW4gWCBjb29yZGluYXRlIGFuZCBhIFkgY29vcmRpbmF0ZVwiKTtcblx0fVxuXG5cdHJldHVybiBHZW5lcmljU2l6ZSgpLmNyZWF0ZSh0aGlzLCBwb3NpdGlvbiwgXCJkaXN0YW5jZSBmcm9tIFwiICsgdGhpcyArIFwiIHRvIFwiICsgcG9zaXRpb24pO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiB0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gPyBQb3NpdGlvbi54KGFyZykgOiBQb3NpdGlvbi55KGFyZyk7XG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0aWYgKGFyZyA9PT0gXCJub25lXCIpIHJldHVybiB0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gPyBQb3NpdGlvbi5ub1goKSA6IFBvc2l0aW9uLm5vWSgpO1xuXHRcdFx0ZWxzZSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDogcmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKGRpbWVuc2lvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShzZWxmKSB7XG5cdFx0Ly8gX3BkYmM6IFwiUG9zaXRpb25EZXNjcmlwdG9yIGJhc2UgY2xhc3MuXCIgQW4gYXR0ZW1wdCB0byBwcmV2ZW50IG5hbWUgY29uZmxpY3RzLlxuXHRcdHNlbGYuX3BkYmMgPSB7IGRpbWVuc2lvbjogZGltZW5zaW9uIH07XG5cdH07XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvdmFsdWUuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcbnZhciBQTFVTID0gMTtcbnZhciBNSU5VUyA9IC0xO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24oZGltZW5zaW9uLCBkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgTnVtYmVyLCBEZXNjcmlwdG9yLCBbTnVtYmVyLCBEZXNjcmlwdG9yLCBWYWx1ZV0gXSk7XG5cblx0dGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXG5cdGlmIChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSBQb3NpdGlvbkRlc2NyaXB0b3IueCh0aGlzKTtcblx0ZWxzZSBpZiAoZGltZW5zaW9uID09PSBZX0RJTUVOU0lPTikgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBkaW1lbnNpb246IFwiICsgZGltZW5zaW9uKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cblx0aWYgKHR5cGVvZiByZWxhdGl2ZUFtb3VudCA9PT0gXCJudW1iZXJcIikge1xuXHRcdGlmIChyZWxhdGl2ZUFtb3VudCA8IDApIHRoaXMuX2RpcmVjdGlvbiAqPSAtMTtcblx0XHR0aGlzLl9hbW91bnQgPSBTaXplLmNyZWF0ZShNYXRoLmFicyhyZWxhdGl2ZUFtb3VudCkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHRoaXMuX2Ftb3VudCA9IHJlbGF0aXZlQW1vdW50O1xuXHR9XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnJpZ2h0ID0gY3JlYXRlRm4oWF9ESU1FTlNJT04sIFBMVVMpO1xuTWUuZG93biA9IGNyZWF0ZUZuKFlfRElNRU5TSU9OLCBQTFVTKTtcbk1lLmxlZnQgPSBjcmVhdGVGbihYX0RJTUVOU0lPTiwgTUlOVVMpO1xuTWUudXAgPSBjcmVhdGVGbihZX0RJTUVOU0lPTiwgTUlOVVMpO1xuXG5mdW5jdGlvbiBjcmVhdGVGbihkaW1lbnNpb24sIGRpcmVjdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgcmVsYXRpdmVBbW91bnQpO1xuXHR9O1xufVxuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgYmFzZVZhbHVlID0gdGhpcy5fcmVsYXRpdmVUby52YWx1ZSgpO1xuXHR2YXIgcmVsYXRpdmVWYWx1ZSA9IHRoaXMuX2Ftb3VudC52YWx1ZSgpO1xuXG5cdGlmICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpIHJldHVybiBiYXNlVmFsdWUucGx1cyhyZWxhdGl2ZVZhbHVlKTtcblx0ZWxzZSByZXR1cm4gYmFzZVZhbHVlLm1pbnVzKHJlbGF0aXZlVmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9hbW91bnQuZXF1YWxzKFNpemUuY3JlYXRlKDApKSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIHJlbGF0aW9uID0gdGhpcy5fYW1vdW50LnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIHRvIHJpZ2h0IG9mIFwiIDogXCIgdG8gbGVmdCBvZiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIGJlbG93IFwiIDogXCIgYWJvdmUgXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBTaXplRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3NpemVfZGVzY3JpcHRvci5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvdmFsdWUuanNcIik7XG52YXIgU2l6ZU11bHRpcGxlID0gcmVxdWlyZShcIi4vc2l6ZV9tdWx0aXBsZS5qc1wiKTtcblxudmFyIFBMVVMgPSAxO1xudmFyIE1JTlVTID0gLTE7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVsYXRpdmVTaXplKGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciwgRGVzY3JpcHRvciwgW051bWJlciwgRGVzY3JpcHRvciwgVmFsdWVdIF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblxuXHR0aGlzLl9kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG5cdHRoaXMuX3JlbGF0aXZlVG8gPSByZWxhdGl2ZVRvO1xuXG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gU2l6ZS5jcmVhdGUoTWF0aC5hYnMoYW1vdW50KSk7XG5cdFx0aWYgKGFtb3VudCA8IDApIHRoaXMuX2RpcmVjdGlvbiAqPSAtMTtcblx0fVxuXHRlbHNlIHtcblx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG5cdH1cbn07XG5TaXplRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5sYXJnZXIgPSBmYWN0b3J5Rm4oUExVUyk7XG5NZS5zbWFsbGVyID0gZmFjdG9yeUZuKE1JTlVTKTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2VWYWx1ZSA9IHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKTtcblx0dmFyIHJlbGF0aXZlVmFsdWUgPSB0aGlzLl9hbW91bnQudmFsdWUoKTtcblxuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZXR1cm4gYmFzZVZhbHVlLnBsdXMocmVsYXRpdmVWYWx1ZSk7XG5cdGVsc2UgcmV0dXJuIGJhc2VWYWx1ZS5taW51cyhyZWxhdGl2ZVZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlID0gdGhpcy5fcmVsYXRpdmVUby50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fYW1vdW50LmVxdWFscyhTaXplLmNyZWF0ZSgwKSkpIHJldHVybiBiYXNlO1xuXG5cdHZhciByZWxhdGlvbiA9IHRoaXMuX2Ftb3VudC50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZWxhdGlvbiArPSBcIiBsYXJnZXIgdGhhbiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSBcIiBzbWFsbGVyIHRoYW4gXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihkaXJlY3Rpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkocmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIGFtb3VudCk7XG5cdH07XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuLyplc2xpbnQgbmV3LWNhcDogXCJvZmZcIiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbmZ1bmN0aW9uIFJlbGF0aXZlU2l6ZSgpIHtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL3JlbGF0aXZlX3NpemUuanNcIik7ICAgXHQvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG59XG5cbmZ1bmN0aW9uIFNpemVNdWx0aXBsZSgpIHtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL3NpemVfbXVsdGlwbGUuanNcIik7ICAgXHQvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG59XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZURlc2NyaXB0b3IoKSB7XG5cdGVuc3VyZS51bnJlYWNoYWJsZShcIlNpemVEZXNjcmlwdG9yIGlzIGFic3RyYWN0IGFuZCBzaG91bGQgbm90IGJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5LlwiKTtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdHJldHVybiBSZWxhdGl2ZVNpemUoKS5sYXJnZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRyZXR1cm4gUmVsYXRpdmVTaXplKCkuc21hbGxlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMoYW1vdW50KSB7XG5cdHJldHVybiBTaXplTXVsdGlwbGUoKS5jcmVhdGUodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0c3dpdGNoKHR5cGUpIHtcblx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiBTaXplLmNyZWF0ZShhcmcpO1xuXHRcdGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIGFyZyA9PT0gXCJub25lXCIgPyBTaXplLmNyZWF0ZU5vbmUoKSA6IHVuZGVmaW5lZDtcblx0XHRkZWZhdWx0OiByZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemVEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vc2l6ZV9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZU11bHRpcGxlKHJlbGF0aXZlVG8sIG11bHRpcGxlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIERlc2NyaXB0b3IsIE51bWJlciBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cdHRoaXMuX211bHRpcGxlID0gbXVsdGlwbGU7XG59O1xuU2l6ZURlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIG11bHRpcGxlKSB7XG5cdHJldHVybiBuZXcgTWUocmVsYXRpdmVUbywgbXVsdGlwbGUpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKS50aW1lcyh0aGlzLl9tdWx0aXBsZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgbXVsdGlwbGUgPSB0aGlzLl9tdWx0aXBsZTtcblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmIChtdWx0aXBsZSA9PT0gMSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIGRlc2M7XG5cdHN3aXRjaChtdWx0aXBsZSkge1xuXHRcdGNhc2UgMS8yOiBkZXNjID0gXCJoYWxmIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvMzogZGVzYyA9IFwib25lLXRoaXJkIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDIvMzogZGVzYyA9IFwidHdvLXRoaXJkcyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzQ6IGRlc2MgPSBcIm9uZS1xdWFydGVyIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDMvNDogZGVzYyA9IFwidGhyZWUtcXVhcnRlcnMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS81OiBkZXNjID0gXCJvbmUtZmlmdGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMi81OiBkZXNjID0gXCJ0d28tZmlmdGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDMvNTogZGVzYyA9IFwidGhyZWUtZmlmdGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDQvNTogZGVzYyA9IFwiZm91ci1maWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS82OiBkZXNjID0gXCJvbmUtc2l4dGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNS82OiBkZXNjID0gXCJmaXZlLXNpeHRocyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzg6IGRlc2MgPSBcIm9uZS1laWdodGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy84OiBkZXNjID0gXCJ0aHJlZS1laWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDUvODogZGVzYyA9IFwiZml2ZS1laWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDcvODogZGVzYyA9IFwic2V2ZW4tZWlnaHRocyBvZiBcIjsgYnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGlmIChtdWx0aXBsZSA+IDEpIGRlc2MgPSBtdWx0aXBsZSArIFwiIHRpbWVzIFwiO1xuXHRcdFx0ZWxzZSBkZXNjID0gKG11bHRpcGxlICogMTAwKSArIFwiJSBvZiBcIjtcblx0fVxuXG5cdHJldHVybiBkZXNjICsgYmFzZTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFBvc2l0aW9uRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uX2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xuXG52YXIgVE9QID0gXCJ0b3BcIjtcbnZhciBSSUdIVCA9IFwicmlnaHRcIjtcbnZhciBCT1RUT00gPSBcImJvdHRvbVwiO1xudmFyIExFRlQgPSBcImxlZnRcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBWaWV3cG9ydEVkZ2UocG9zaXRpb24sIGJyb3dzaW5nQ29udGV4dCkge1xuXHR2YXIgQnJvd3NpbmdDb250ZXh0ID0gcmVxdWlyZShcIi4uL2Jyb3dzaW5nX2NvbnRleHQuanNcIik7ICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIEJyb3dzaW5nQ29udGV4dCBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKHBvc2l0aW9uID09PSBMRUZUIHx8IHBvc2l0aW9uID09PSBSSUdIVCkgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvbik7XG5cblx0dGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcblx0dGhpcy5fYnJvd3NpbmdDb250ZXh0ID0gYnJvd3NpbmdDb250ZXh0O1xufTtcblBvc2l0aW9uRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS50b3AgPSBmYWN0b3J5Rm4oVE9QKTtcbk1lLnJpZ2h0ID0gZmFjdG9yeUZuKFJJR0hUKTtcbk1lLmJvdHRvbSA9IGZhY3RvcnlGbihCT1RUT00pO1xuTWUubGVmdCA9IGZhY3RvcnlGbihMRUZUKTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHNjcm9sbCA9IHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5nZXRSYXdTY3JvbGxQb3NpdGlvbigpO1xuXHR2YXIgeCA9IFBvc2l0aW9uLngoc2Nyb2xsLngpO1xuXHR2YXIgeSA9IFBvc2l0aW9uLnkoc2Nyb2xsLnkpO1xuXG5cdHZhciBzaXplID0gdmlld3BvcnRTaXplKHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5jb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcblxuXHRzd2l0Y2godGhpcy5fcG9zaXRpb24pIHtcblx0XHRjYXNlIFRPUDogcmV0dXJuIHk7XG5cdFx0Y2FzZSBSSUdIVDogcmV0dXJuIHgucGx1cyhQb3NpdGlvbi54KHNpemUud2lkdGgpKTtcblx0XHRjYXNlIEJPVFRPTTogcmV0dXJuIHkucGx1cyhQb3NpdGlvbi55KHNpemUuaGVpZ2h0KSk7XG5cdFx0Y2FzZSBMRUZUOiByZXR1cm4geDtcblxuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZSgpO1xuXHR9XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiB2aWV3cG9ydFwiO1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKHBvc2l0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBmYWN0b3J5KGNvbnRlbnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKHBvc2l0aW9uLCBjb250ZW50KTtcblx0fTtcbn1cblxuXG5cbi8vIFVTRUZVTCBSRUFESU5HOiBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL21vYmlsZS92aWV3cG9ydHMuaHRtbFxuLy8gYW5kIGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvbW9iaWxlL3ZpZXdwb3J0czIuaHRtbFxuXG4vLyBCUk9XU0VSUyBURVNURUQ6IFNhZmFyaSA2LjIuMCAoTWFjIE9TIFggMTAuOC41KTsgTW9iaWxlIFNhZmFyaSA3LjAuMCAoaU9TIDcuMSk7IEZpcmVmb3ggMzIuMC4wIChNYWMgT1MgWCAxMC44KTtcbi8vICAgIEZpcmVmb3ggMzMuMC4wIChXaW5kb3dzIDcpOyBDaHJvbWUgMzguMC4yMTI1IChNYWMgT1MgWCAxMC44LjUpOyBDaHJvbWUgMzguMC4yMTI1IChXaW5kb3dzIDcpOyBJRSA4LCA5LCAxMCwgMTFcblxuLy8gV2lkdGggdGVjaG5pcXVlcyBJJ3ZlIHRyaWVkOiAoTm90ZTogcmVzdWx0cyBhcmUgZGlmZmVyZW50IGluIHF1aXJrcyBtb2RlKVxuLy8gYm9keS5jbGllbnRXaWR0aFxuLy8gYm9keS5vZmZzZXRXaWR0aFxuLy8gYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgZmFpbHMgb24gYWxsIGJyb3dzZXJzOiBkb2Vzbid0IGluY2x1ZGUgbWFyZ2luXG4vLyBib2R5LnNjcm9sbFdpZHRoXG4vLyAgICB3b3JrcyBvbiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZVxuLy8gICAgZmFpbHMgb24gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBkb2Vzbid0IGluY2x1ZGUgbWFyZ2luXG4vLyBodG1sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG4vLyBodG1sLm9mZnNldFdpZHRoXG4vLyAgICB3b3JrcyBvbiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveFxuLy8gICAgZmFpbHMgb24gSUUgOCwgOSwgMTA6IGluY2x1ZGVzIHNjcm9sbGJhclxuLy8gaHRtbC5zY3JvbGxXaWR0aFxuLy8gaHRtbC5jbGllbnRXaWR0aFxuLy8gICAgV09SS1MhIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcblxuLy8gSGVpZ2h0IHRlY2huaXF1ZXMgSSd2ZSB0cmllZDogKE5vdGUgdGhhdCByZXN1bHRzIGFyZSBkaWZmZXJlbnQgaW4gcXVpcmtzIG1vZGUpXG4vLyBib2R5LmNsaWVudEhlaWdodFxuLy8gYm9keS5vZmZzZXRIZWlnaHRcbi8vIGJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0XG4vLyAgICBmYWlscyBvbiBhbGwgYnJvd3NlcnM6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcbi8vIGJvZHkgZ2V0Q29tcHV0ZWRTdHlsZShcImhlaWdodFwiKVxuLy8gICAgZmFpbHMgb24gYWxsIGJyb3dzZXJzOiBJRTggcmV0dXJucyBcImF1dG9cIjsgb3RoZXJzIG9ubHkgaW5jbHVkZSBoZWlnaHQgb2YgY29udGVudFxuLy8gYm9keS5zY3JvbGxIZWlnaHRcbi8vICAgIHdvcmtzIG9uIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lO1xuLy8gICAgZmFpbHMgb24gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBvbmx5IGluY2x1ZGVzIGhlaWdodCBvZiBjb250ZW50XG4vLyBodG1sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodFxuLy8gaHRtbC5vZmZzZXRIZWlnaHRcbi8vICAgIHdvcmtzIG9uIElFIDgsIDksIDEwXG4vLyAgICBmYWlscyBvbiBJRSAxMSwgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcbi8vIGh0bWwuc2Nyb2xsSGVpZ2h0XG4vLyAgICB3b3JrcyBvbiBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcbi8vICAgIGZhaWxzIG9uIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lOiBvbmx5IGluY2x1ZGVzIGhlaWdodCBvZiBjb250ZW50XG4vLyBodG1sLmNsaWVudEhlaWdodFxuLy8gICAgV09SS1MhIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcbmZ1bmN0aW9uIHZpZXdwb3J0U2l6ZShodG1sRWxlbWVudCkge1xuXHRyZXR1cm4ge1xuXHRcdHdpZHRoOiBodG1sRWxlbWVudC5jbGllbnRXaWR0aCxcblx0XHRoZWlnaHQ6IGh0bWxFbGVtZW50LmNsaWVudEhlaWdodFxuXHR9O1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIGNhbWVsY2FzZSA9IHJlcXVpcmUoXCIuLi92ZW5kb3IvY2FtZWxjYXNlLTEuMC4xLW1vZGlmaWVkLmpzXCIpO1xudmFyIEVsZW1lbnRSZW5kZXJlZCA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfcmVuZGVyZWQuanNcIik7XG52YXIgRWxlbWVudEVkZ2UgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanNcIik7XG52YXIgQ2VudGVyID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvY2VudGVyLmpzXCIpO1xudmFyIEdlbmVyaWNTaXplID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZ2VuZXJpY19zaXplLmpzXCIpO1xudmFyIEFzc2VydGFibGUgPSByZXF1aXJlKFwiLi9hc3NlcnRhYmxlLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFFFbGVtZW50KGRvbUVsZW1lbnQsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgU3RyaW5nIF0pO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xuXHR0aGlzLl9uaWNrbmFtZSA9IG5pY2tuYW1lO1xuXG5cdC8vIHByb3BlcnRpZXNcblx0dGhpcy50b3AgPSBFbGVtZW50RWRnZS50b3AodGhpcyk7XG5cdHRoaXMucmlnaHQgPSBFbGVtZW50RWRnZS5yaWdodCh0aGlzKTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50RWRnZS5ib3R0b20odGhpcyk7XG5cdHRoaXMubGVmdCA9IEVsZW1lbnRFZGdlLmxlZnQodGhpcyk7XG5cblx0dGhpcy5jZW50ZXIgPSBDZW50ZXIueCh0aGlzLmxlZnQsIHRoaXMucmlnaHQsIFwiY2VudGVyIG9mIFwiICsgdGhpcyk7XG5cdHRoaXMubWlkZGxlID0gQ2VudGVyLnkodGhpcy50b3AsIHRoaXMuYm90dG9tLCBcIm1pZGRsZSBvZiBcIiArIHRoaXMpO1xuXG5cdHRoaXMud2lkdGggPSBHZW5lcmljU2l6ZS5jcmVhdGUodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcIndpZHRoIG9mIFwiICsgdGhpcyk7XG5cdHRoaXMuaGVpZ2h0ID0gR2VuZXJpY1NpemUuY3JlYXRlKHRoaXMudG9wLCB0aGlzLmJvdHRvbSwgXCJoZWlnaHQgb2YgXCIgKyB0aGlzKTtcblxuXHR0aGlzLnJlbmRlcmVkID0gRWxlbWVudFJlbmRlcmVkLmNyZWF0ZSh0aGlzKTtcbn07XG5Bc3NlcnRhYmxlLmV4dGVuZChNZSk7XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uKGRvbUVsZW1lbnQsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgWyB1bmRlZmluZWQsIFN0cmluZyBdIF0pO1xuXG5cdGlmIChuaWNrbmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGRvbUVsZW1lbnQuaWQgIT09IFwiXCIpIG5pY2tuYW1lID0gXCIjXCIgKyBkb21FbGVtZW50LmlkO1xuXHRcdGVsc2UgaWYgKGRvbUVsZW1lbnQuY2xhc3NOYW1lICE9PSBcIlwiKSBuaWNrbmFtZSA9IFwiLlwiICsgZG9tRWxlbWVudC5jbGFzc05hbWUuc3BsaXQoL1xccysvKS5qb2luKFwiLlwiKTtcblx0XHRlbHNlIG5pY2tuYW1lID0gXCI8XCIgKyBkb21FbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSArIFwiPlwiO1xuXHR9XG5cdHJldHVybiBuZXcgTWUoZG9tRWxlbWVudCwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1N0eWxlID0gZnVuY3Rpb24oc3R5bGVOYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbU3RyaW5nXSk7XG5cblx0dmFyIHN0eWxlcztcblx0dmFyIHJlc3VsdDtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIGdldENvbXB1dGVkU3R5bGUoKVxuXHRpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcblx0XHQvLyBXT1JLQVJPVU5EIEZpcmVmb3ggNDAuMC4zOiBtdXN0IHVzZSBmcmFtZSdzIGNvbnRlbnRXaW5kb3cgKHJlZiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xMjA0MDYyKVxuXHRcdHN0eWxlcyA9IHRoaXMuY29udGV4dCgpLmNvbnRlbnRXaW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLl9kb21FbGVtZW50KTtcblx0XHRyZXN1bHQgPSBzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHN0eWxlcyA9IHRoaXMuX2RvbUVsZW1lbnQuY3VycmVudFN0eWxlO1xuXHRcdHJlc3VsdCA9IHN0eWxlc1tjYW1lbGNhc2Uoc3R5bGVOYW1lKV07XG5cdH1cblx0aWYgKHJlc3VsdCA9PT0gbnVsbCB8fCByZXN1bHQgPT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gXCJcIjtcblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gVGV4dFJlY3RhbmdsZS5oZWlnaHQgb3IgLndpZHRoXG5cdHZhciByZWN0ID0gdGhpcy5fZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0cmV0dXJuIHtcblx0XHRsZWZ0OiByZWN0LmxlZnQsXG5cdFx0cmlnaHQ6IHJlY3QucmlnaHQsXG5cdFx0d2lkdGg6IHJlY3Qud2lkdGggIT09IHVuZGVmaW5lZCA/IHJlY3Qud2lkdGggOiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LFxuXG5cdFx0dG9wOiByZWN0LnRvcCxcblx0XHRib3R0b206IHJlY3QuYm90dG9tLFxuXHRcdGhlaWdodDogcmVjdC5oZWlnaHQgIT09IHVuZGVmaW5lZCA/IHJlY3QuaGVpZ2h0IDogcmVjdC5ib3R0b20gLSByZWN0LnRvcFxuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLmNhbGN1bGF0ZVBpeGVsVmFsdWUgPSBmdW5jdGlvbihzaXplU3RyaW5nKSB7XG5cdHZhciBkb20gPSB0aGlzLl9kb21FbGVtZW50O1xuXHRpZiAoZG9tLnJ1bnRpbWVTdHlsZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gaWU4V29ya2Fyb3VuZCgpO1xuXG5cdHZhciByZXN1bHQ7XG5cdHZhciBzdHlsZSA9IGRvbS5zdHlsZTtcblx0dmFyIG9sZFBvc2l0aW9uID0gc3R5bGUucG9zaXRpb247XG5cdHZhciBvbGRMZWZ0ID0gc3R5bGUubGVmdDtcblxuXHRzdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblx0c3R5bGUubGVmdCA9IHNpemVTdHJpbmc7XG5cdHJlc3VsdCA9IHBhcnNlRmxvYXQodGhpcy5nZXRSYXdTdHlsZShcImxlZnRcIikpOyAgICAvLyBwYXJzZUludCBzdHJpcHMgb2ZmICdweCcgdmFsdWVcblxuXHRzdHlsZS5wb3NpdGlvbiA9IG9sZFBvc2l0aW9uO1xuXHRzdHlsZS5sZWZ0ID0gb2xkTGVmdDtcblx0cmV0dXJuIHJlc3VsdDtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IGdldFJhd1N0eWxlKCkgZG9lc24ndCBub3JtYWxpemUgdmFsdWVzIHRvIHB4XG5cdC8vIEJhc2VkIG9uIGNvZGUgYnkgRGVhbiBFZHdhcmRzOiBodHRwOi8vZGlzcS51cy9wL215bDk5eFxuXHRmdW5jdGlvbiBpZThXb3JrYXJvdW5kKCkge1xuXHRcdHZhciBydW50aW1lU3R5bGVMZWZ0ID0gZG9tLnJ1bnRpbWVTdHlsZS5sZWZ0O1xuXHRcdHZhciBzdHlsZUxlZnQgPSBkb20uc3R5bGUubGVmdDtcblxuXHRcdGRvbS5ydW50aW1lU3R5bGUubGVmdCA9IGRvbS5jdXJyZW50U3R5bGUubGVmdDtcblx0XHRkb20uc3R5bGUubGVmdCA9IHNpemVTdHJpbmc7XG5cdFx0cmVzdWx0ID0gZG9tLnN0eWxlLnBpeGVsTGVmdDtcblxuXHRcdGRvbS5ydW50aW1lU3R5bGUubGVmdCA9IHJ1bnRpbWVTdHlsZUxlZnQ7XG5cdFx0ZG9tLnN0eWxlLmxlZnQgPSBzdHlsZUxlZnQ7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufTtcblxuTWUucHJvdG90eXBlLnBhcmVudCA9IGZ1bmN0aW9uKG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbWyB1bmRlZmluZWQsIFN0cmluZyBdXSk7XG5cblx0dmFyIHBhcmVudEJvZHkgPSB0aGlzLmNvbnRleHQoKS5ib2R5KCk7XG5cdGlmICh0aGlzLmVxdWFscyhwYXJlbnRCb2R5KSkgcmV0dXJuIG51bGw7XG5cblx0dmFyIHBhcmVudCA9IHRoaXMuX2RvbUVsZW1lbnQucGFyZW50RWxlbWVudDtcblx0aWYgKHBhcmVudCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cblx0cmV0dXJuIE1lLmNyZWF0ZShwYXJlbnQsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihodG1sLCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFsgdW5kZWZpbmVkLCBTdHJpbmcgXSBdKTtcblxuXHR2YXIgdGVtcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHR0ZW1wRWxlbWVudC5pbm5lckhUTUwgPSBzaGltLlN0cmluZy50cmltKGh0bWwpO1xuXHRlbnN1cmUudGhhdChcblx0XHR0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMSxcblx0XHRcIkV4cGVjdGVkIG9uZSBlbGVtZW50LCBidXQgZ290IFwiICsgdGVtcEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggKyBcIiAoXCIgKyBodG1sICsgXCIpXCJcblx0KTtcblxuXHR2YXIgaW5zZXJ0ZWRFbGVtZW50ID0gdGVtcEVsZW1lbnQuY2hpbGROb2Rlc1swXTtcblx0dGhpcy5fZG9tRWxlbWVudC5hcHBlbmRDaGlsZChpbnNlcnRlZEVsZW1lbnQpO1xuXHRyZXR1cm4gTWUuY3JlYXRlKGluc2VydGVkRWxlbWVudCwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRzaGltLkVsZW1lbnQucmVtb3ZlKHRoaXMuX2RvbUVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSBdKTtcblx0cmV0dXJuIHRoaXMudG9Eb21FbGVtZW50KCkuY29udGFpbnMoZWxlbWVudC50b0RvbUVsZW1lbnQoKSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50O1xufTtcblxuTWUucHJvdG90eXBlLmNvbnRleHQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgQnJvd3NpbmdDb250ZXh0ID0gcmVxdWlyZShcIi4vYnJvd3NpbmdfY29udGV4dC5qc1wiKTsgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdHJldHVybiBuZXcgQnJvd3NpbmdDb250ZXh0KHRoaXMuX2RvbUVsZW1lbnQub3duZXJEb2N1bWVudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIFwiJ1wiICsgdGhpcy5fbmlja25hbWUgKyBcIidcIjtcbn07XG5cbk1lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbih0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudCA9PT0gdGhhdC5fZG9tRWxlbWVudDtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudC5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudExpc3Qobm9kZUxpc3QsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgU3RyaW5nIF0pO1xuXG5cdHRoaXMuX25vZGVMaXN0ID0gbm9kZUxpc3Q7XG5cdHRoaXMuX25pY2tuYW1lID0gbmlja25hbWU7XG59O1xuXG5NZS5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24gbGVuZ3RoKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzLl9ub2RlTGlzdC5sZW5ndGg7XG59O1xuXG5NZS5wcm90b3R5cGUuYXQgPSBmdW5jdGlvbiBhdChyZXF1ZXN0ZWRJbmRleCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyLCBbdW5kZWZpbmVkLCBTdHJpbmddIF0pO1xuXG5cdHZhciBpbmRleCA9IHJlcXVlc3RlZEluZGV4O1xuXHR2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGgoKTtcblx0aWYgKGluZGV4IDwgMCkgaW5kZXggPSBsZW5ndGggKyBpbmRleDtcblxuXHRlbnN1cmUudGhhdChcblx0XHRpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoLFxuXHRcdFwiJ1wiICsgdGhpcy5fbmlja25hbWUgKyBcIidbXCIgKyByZXF1ZXN0ZWRJbmRleCArIFwiXSBpcyBvdXQgb2YgYm91bmRzOyBsaXN0IGxlbmd0aCBpcyBcIiArIGxlbmd0aFxuXHQpO1xuXHR2YXIgZWxlbWVudCA9IHRoaXMuX25vZGVMaXN0W2luZGV4XTtcblxuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSB0aGlzLl9uaWNrbmFtZSArIFwiW1wiICsgaW5kZXggKyBcIl1cIjtcblx0cmV0dXJuIFFFbGVtZW50LmNyZWF0ZShlbGVtZW50LCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gXCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJyBsaXN0XCI7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNC0yMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3V0aWwvc2hpbS5qc1wiKTtcbnZhciBCcm93c2luZ0NvbnRleHQgPSByZXF1aXJlKFwiLi9icm93c2luZ19jb250ZXh0LmpzXCIpO1xudmFyIGFzeW5jID0gcmVxdWlyZShcIi4uL3ZlbmRvci9hc3luYy0xLjQuMi5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRnJhbWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dGhpcy5fZG9tRWxlbWVudCA9IG51bGw7XG5cdHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xuXHR0aGlzLl9yZW1vdmVkID0gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBsb2FkZWQoc2VsZiwgd2lkdGgsIGhlaWdodCwgc3JjLCBzdHlsZXNoZWV0cykge1xuXG5cdHNlbGYuX2xvYWRlZCA9IHRydWU7XG5cdHNlbGYuX2RvY3VtZW50ID0gc2VsZi5fZG9tRWxlbWVudC5jb250ZW50RG9jdW1lbnQ7XG5cdHNlbGYuX2Jyb3dzaW5nQ29udGV4dCA9IG5ldyBCcm93c2luZ0NvbnRleHQoc2VsZi5fZG9jdW1lbnQpO1xuXHRzZWxmLl9vcmlnaW5hbEJvZHkgPSBzZWxmLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTDtcblx0c2VsZi5fb3JpZ2luYWxXaWR0aCA9IHdpZHRoO1xuXHRzZWxmLl9vcmlnaW5hbEhlaWdodCA9IGhlaWdodDtcblx0c2VsZi5fb3JpZ2luYWxTcmMgPSBzcmM7XG5cdHNlbGYuX29yaWdpbmFsU3R5bGVzaGVldHMgPSBzdHlsZXNoZWV0cztcbn1cblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHBhcmVudEVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbT2JqZWN0LCBbT2JqZWN0LCBGdW5jdGlvbl0sIFt1bmRlZmluZWQsIEZ1bmN0aW9uXV0pO1xuXHRpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuXHRcdGNhbGxiYWNrID0gb3B0aW9ucztcblx0XHRvcHRpb25zID0ge307XG5cdH1cblx0dmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aCB8fCAyMDAwO1xuXHR2YXIgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgfHwgMjAwMDtcblx0dmFyIHNyYyA9IG9wdGlvbnMuc3JjO1xuXHR2YXIgc3R5bGVzaGVldHMgPSBvcHRpb25zLnN0eWxlc2hlZXQgfHwgW107XG5cdHZhciBjc3MgPSBvcHRpb25zLmNzcztcblx0aWYgKCFzaGltLkFycmF5LmlzQXJyYXkoc3R5bGVzaGVldHMpKSBzdHlsZXNoZWV0cyA9IFsgc3R5bGVzaGVldHMgXTtcblxuXHR2YXIgZnJhbWUgPSBuZXcgTWUoKTtcblx0Y2hlY2tVcmxzKHNyYywgc3R5bGVzaGVldHMsIGZ1bmN0aW9uKGVycikge1xuXHRcdGlmIChlcnIpIHJldHVybiBjYWxsYmFjayhlcnIpO1xuXG5cdFx0dmFyIGlmcmFtZSA9IGluc2VydElmcmFtZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0KTtcblx0XHRzaGltLkV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoaWZyYW1lLCBcImxvYWRcIiwgb25GcmFtZUxvYWQpO1xuXHRcdHNldElmcmFtZUNvbnRlbnQoaWZyYW1lLCBzcmMpO1xuXG5cdFx0ZnJhbWUuX2RvbUVsZW1lbnQgPSBpZnJhbWU7XG5cdFx0c2V0RnJhbWVMb2FkQ2FsbGJhY2soZnJhbWUsIGNhbGxiYWNrKTtcblx0fSk7XG5cdHJldHVybiBmcmFtZTtcblxuXHRmdW5jdGlvbiBvbkZyYW1lTG9hZCgpIHtcblx0XHQvLyBXT1JLQVJPVU5EIE1vYmlsZSBTYWZhcmkgNy4wLjAsIFNhZmFyaSA2LjIuMCwgQ2hyb21lIDM4LjAuMjEyNTogZnJhbWUgaXMgbG9hZGVkIHN5bmNocm9ub3VzbHlcblx0XHQvLyBXZSBmb3JjZSBpdCB0byBiZSBhc3luY2hyb25vdXMgaGVyZVxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2FkZWQoZnJhbWUsIHdpZHRoLCBoZWlnaHQsIHNyYywgc3R5bGVzaGVldHMpO1xuXHRcdFx0YWRkU3R5bGVzaGVldExpbmtUYWdzKGZyYW1lLCBzdHlsZXNoZWV0cywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmIChjc3MpIGFkZFN0eWxlVGFnKGZyYW1lLCBvcHRpb25zLmNzcyk7XG5cdFx0XHRcdGZyYW1lLl9mcmFtZUxvYWRDYWxsYmFjayhudWxsLCBmcmFtZSk7XG5cdFx0XHR9KTtcblx0XHR9LCAwKTtcblx0fVxufTtcblxuZnVuY3Rpb24gc2V0RnJhbWVMb2FkQ2FsbGJhY2soZnJhbWUsIGNhbGxiYWNrKSB7XG5cdGZyYW1lLl9mcmFtZUxvYWRDYWxsYmFjayA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBjaGVja1VybHMoc3JjLCBzdHlsZXNoZWV0cywgY2FsbGJhY2spIHtcblx0dXJsRXhpc3RzKHNyYywgZnVuY3Rpb24oZXJyLCBzcmNFeGlzdHMpIHtcblx0XHRpZiAoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRpZiAoIXNyY0V4aXN0cykgcmV0dXJuIGNhbGxiYWNrKGVycm9yKFwic3JjXCIsIHNyYykpO1xuXG5cdFx0YXN5bmMuZWFjaChzdHlsZXNoZWV0cywgY2hlY2tTdHlsZXNoZWV0LCBjYWxsYmFjayk7XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIGNoZWNrU3R5bGVzaGVldCh1cmwsIGNhbGxiYWNrMikge1xuXHRcdHVybEV4aXN0cyh1cmwsIGZ1bmN0aW9uKGVyciwgc3R5bGVzaGVldEV4aXN0cykge1xuXHRcdFx0aWYgKGVycikgcmV0dXJuIGNhbGxiYWNrMihlcnIpO1xuXG5cdFx0XHRpZiAoIXN0eWxlc2hlZXRFeGlzdHMpIHJldHVybiBjYWxsYmFjazIoZXJyb3IoXCJzdHlsZXNoZWV0XCIsIHVybCkpO1xuXHRcdFx0ZWxzZSByZXR1cm4gY2FsbGJhY2syKG51bGwpO1xuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gZXJyb3IobmFtZSwgdXJsKSB7XG5cdFx0cmV0dXJuIG5ldyBFcnJvcihcIjQwNCBlcnJvciB3aGlsZSBsb2FkaW5nIFwiICsgbmFtZSArIFwiIChcIiArIHVybCArIFwiKVwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1cmxFeGlzdHModXJsLCBjYWxsYmFjaykge1xuXHR2YXIgU1RBVFVTX0FWQUlMQUJMRSA9IDI7ICAgLy8gV09SS0FST1VORCBJRSA4OiBub24tc3RhbmRhcmQgWE1MSHR0cFJlcXVlc3QgY29uc3RhbnQgbmFtZXNcblxuXHRpZiAodXJsID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgdHJ1ZSk7XG5cdH1cblxuXHR2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRodHRwLm9wZW4oXCJIRUFEXCIsIHVybCk7XG5cdGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7ICAvLyBXT1JLQVJPVU5EIElFIDg6IGRvZXNuJ3Qgc3VwcG9ydCAuYWRkRXZlbnRMaXN0ZW5lcigpIG9yIC5vbmxvYWRcblx0XHRpZiAoaHR0cC5yZWFkeVN0YXRlID09PSBTVEFUVVNfQVZBSUxBQkxFKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgaHR0cC5zdGF0dXMgIT09IDQwNCk7XG5cdFx0fVxuXHR9O1xuXHRodHRwLm9uZXJyb3IgPSBmdW5jdGlvbigpIHsgICAgIC8vIG9uZXJyb3IgaGFuZGxlciBpcyBub3QgdGVzdGVkXG5cdFx0cmV0dXJuIGNhbGxiYWNrKFwiWE1MSHR0cFJlcXVlc3QgZXJyb3Igd2hpbGUgdXNpbmcgSFRUUCBIRUFEIG9uIFVSTCAnXCIgKyB1cmwgKyBcIic6IFwiICsgaHR0cC5zdGF0dXNUZXh0KTtcblx0fTtcblx0aHR0cC5zZW5kKCk7XG59XG5cbmZ1bmN0aW9uIGluc2VydElmcmFtZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0KSB7XG5cdHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgd2lkdGgpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJmcmFtZWJvcmRlclwiLCBcIjBcIik7ICAgIC8vIFdPUktBUk9VTkQgSUUgODogZG9uJ3QgaW5jbHVkZSBmcmFtZSBib3JkZXIgaW4gcG9zaXRpb24gY2FsY3Ncblx0cGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuXHRyZXR1cm4gaWZyYW1lO1xufVxuXG5mdW5jdGlvbiBzZXRJZnJhbWVDb250ZW50KGlmcmFtZSwgc3JjKSB7XG5cdGlmIChzcmMgPT09IHVuZGVmaW5lZCkge1xuXHRcdHdyaXRlU3RhbmRhcmRzTW9kZUh0bWwoaWZyYW1lKTtcblx0fVx0ZWxzZSB7XG5cdFx0c2V0SWZyYW1lU3JjKGlmcmFtZSwgc3JjKTtcblx0fVxufVxuXG5mdW5jdGlvbiBzZXRJZnJhbWVTcmMoaWZyYW1lLCBzcmMpIHtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzcmMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZVN0YW5kYXJkc01vZGVIdG1sKGlmcmFtZSkge1xuXHR2YXIgc3RhbmRhcmRzTW9kZSA9IFwiPCFET0NUWVBFIGh0bWw+XFxuPGh0bWw+PGhlYWQ+PC9oZWFkPjxib2R5PjwvYm9keT48L2h0bWw+XCI7XG5cdGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50Lm9wZW4oKTtcblx0aWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQud3JpdGUoc3RhbmRhcmRzTW9kZSk7XG5cdGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmNsb3NlKCk7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlc2hlZXRMaW5rVGFncyhzZWxmLCB1cmxzLCBjYWxsYmFjaykge1xuXHRhc3luYy5lYWNoKHVybHMsIGFkZExpbmtUYWcsIGNhbGxiYWNrKTtcblxuXHRmdW5jdGlvbiBhZGRMaW5rVGFnKHVybCwgb25MaW5rTG9hZCkge1xuXHRcdHZhciBsaW5rID0gc2VsZi5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG5cdFx0c2hpbS5FdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKGxpbmssIFwibG9hZFwiLCBmdW5jdGlvbihldmVudCkgeyBvbkxpbmtMb2FkKG51bGwpOyB9KTtcblx0XHRsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XG5cdFx0bGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG5cdFx0bGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHVybCk7XG5cdFx0c2hpbS5Eb2N1bWVudC5oZWFkKHNlbGYuX2RvY3VtZW50KS5hcHBlbmRDaGlsZChsaW5rKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRTdHlsZVRhZyhzZWxmLCBjc3MpIHtcblx0dmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXHRzdHlsZS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG5cdGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG5cdFx0Ly8gV09SS0FST1VORCBJRSA4OiBUaHJvd3MgJ3Vua25vd24gcnVudGltZSBlcnJvcicgaWYgeW91IHNldCBpbm5lckhUTUwgb24gYSA8c3R5bGU+IHRhZ1xuXHRcdHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcblx0fVxuXHRlbHNlIHtcblx0XHRzdHlsZS5pbm5lckhUTUwgPSBjc3M7XG5cdH1cblx0c2hpbS5Eb2N1bWVudC5oZWFkKHNlbGYuX2RvY3VtZW50KS5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbk1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dGhpcy5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB0aGlzLl9vcmlnaW5hbEJvZHk7XG5cdHRoaXMuc2Nyb2xsKDAsIDApO1xuXHR0aGlzLnJlc2l6ZSh0aGlzLl9vcmlnaW5hbFdpZHRoLCB0aGlzLl9vcmlnaW5hbEhlaWdodCk7XG59O1xuXG5NZS5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtGdW5jdGlvbl0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIGZyYW1lID0gdGhpcztcblx0dmFyIGlmcmFtZSA9IHRoaXMuX2RvbUVsZW1lbnQ7XG5cdHZhciBzcmMgPSB0aGlzLl9vcmlnaW5hbFNyYztcblxuXHR0aGlzLnJlc2l6ZSh0aGlzLl9vcmlnaW5hbFdpZHRoLCB0aGlzLl9vcmlnaW5hbEhlaWdodCk7XG5cdHNldEZyYW1lTG9hZENhbGxiYWNrKGZyYW1lLCBjYWxsYmFjayk7XG5cdHNldElmcmFtZUNvbnRlbnQoaWZyYW1lLCBzcmMpO1xufTtcblxuTWUucHJvdG90eXBlLnRvRG9tRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Ccm93c2luZ0NvbnRleHQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQ7XG59O1xuXG5NZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZUxvYWRlZCh0aGlzKTtcblx0aWYgKHRoaXMuX3JlbW92ZWQpIHJldHVybjtcblxuXHR0aGlzLl9kb21FbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fZG9tRWxlbWVudCk7XG5cdHRoaXMuX3JlbW92ZWQgPSB0cnVlO1xufTtcblxuTWUucHJvdG90eXBlLnZpZXdwb3J0ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LnZpZXdwb3J0KCk7XG59O1xuXG5NZS5wcm90b3R5cGUucGFnZSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5wYWdlKCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYm9keSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5ib2R5KCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaHRtbCwgbmlja25hbWUpIHtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQuYWRkKGh0bWwsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihzZWxlY3Rvciwgbmlja25hbWUpIHtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQuZ2V0KHNlbGVjdG9yLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24oc2VsZWN0b3IsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LmdldEFsbChzZWxlY3Rvciwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIHNjcm9sbCh4LCB5KSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LnNjcm9sbCh4LCB5KTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdTY3JvbGxQb3NpdGlvbiA9IGZ1bmN0aW9uIGdldFJhd1Njcm9sbFBvc2l0aW9uKCkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5nZXRSYXdTY3JvbGxQb3NpdGlvbigpO1xufTtcblxuTWUucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uIHJlc2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbTnVtYmVyLCBOdW1iZXJdKTtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCJcIiArIHdpZHRoKTtcblx0dGhpcy5fZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgXCJcIiArIGhlaWdodCk7XG5cdHRoaXMuZm9yY2VSZWZsb3coKTtcbn07XG5cbk1lLnByb3RvdHlwZS5mb3JjZVJlZmxvdyA9IGZ1bmN0aW9uIGZvcmNlUmVmbG93KCkge1xuXHR0aGlzLl9icm93c2luZ0NvbnRleHQuZm9yY2VSZWZsb3coKTtcbn07XG5cbmZ1bmN0aW9uIGVuc3VyZVVzYWJsZShzZWxmKSB7XG5cdGVuc3VyZUxvYWRlZChzZWxmKTtcblx0ZW5zdXJlTm90UmVtb3ZlZChzZWxmKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTG9hZGVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoc2VsZi5fbG9hZGVkLCBcIlFGcmFtZSBub3QgbG9hZGVkOiBXYWl0IGZvciBmcmFtZSBjcmVhdGlvbiBjYWxsYmFjayB0byBleGVjdXRlIGJlZm9yZSB1c2luZyBmcmFtZVwiKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTm90UmVtb3ZlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KCFzZWxmLl9yZW1vdmVkLCBcIkF0dGVtcHRlZCB0byB1c2UgZnJhbWUgYWZ0ZXIgaXQgd2FzIHJlbW92ZWRcIik7XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQYWdlRWRnZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL3BhZ2VfZWRnZS5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9jZW50ZXIuanNcIik7XG52YXIgQXNzZXJ0YWJsZSA9IHJlcXVpcmUoXCIuL2Fzc2VydGFibGUuanNcIik7XG52YXIgR2VuZXJpY1NpemUgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9nZW5lcmljX3NpemUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUVBhZ2UoYnJvd3NpbmdDb250ZXh0KSB7XG5cdHZhciBCcm93c2luZ0NvbnRleHQgPSByZXF1aXJlKFwiLi9icm93c2luZ19jb250ZXh0LmpzXCIpOyAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgQnJvd3NpbmdDb250ZXh0IF0pO1xuXG5cdC8vIHByb3BlcnRpZXNcblx0dGhpcy50b3AgPSBQYWdlRWRnZS50b3AoYnJvd3NpbmdDb250ZXh0KTtcblx0dGhpcy5yaWdodCA9IFBhZ2VFZGdlLnJpZ2h0KGJyb3dzaW5nQ29udGV4dCk7XG5cdHRoaXMuYm90dG9tID0gUGFnZUVkZ2UuYm90dG9tKGJyb3dzaW5nQ29udGV4dCk7XG5cdHRoaXMubGVmdCA9IFBhZ2VFZGdlLmxlZnQoYnJvd3NpbmdDb250ZXh0KTtcblxuXHR0aGlzLndpZHRoID0gR2VuZXJpY1NpemUuY3JlYXRlKHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJ3aWR0aCBvZiBwYWdlXCIpO1xuXHR0aGlzLmhlaWdodCA9IEdlbmVyaWNTaXplLmNyZWF0ZSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwiaGVpZ2h0IG9mIHBhZ2VcIik7XG5cblx0dGhpcy5jZW50ZXIgPSBDZW50ZXIueCh0aGlzLmxlZnQsIHRoaXMucmlnaHQsIFwiY2VudGVyIG9mIHBhZ2VcIik7XG5cdHRoaXMubWlkZGxlID0gQ2VudGVyLnkodGhpcy50b3AsIHRoaXMuYm90dG9tLCBcIm1pZGRsZSBvZiBwYWdlXCIpO1xufTtcbkFzc2VydGFibGUuZXh0ZW5kKE1lKTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZpZXdwb3J0RWRnZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL3ZpZXdwb3J0X2VkZ2UuanNcIik7XG52YXIgQ2VudGVyID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvY2VudGVyLmpzXCIpO1xudmFyIEFzc2VydGFibGUgPSByZXF1aXJlKFwiLi9hc3NlcnRhYmxlLmpzXCIpO1xudmFyIEdlbmVyaWNTaXplID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZ2VuZXJpY19zaXplLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFFWaWV3cG9ydChicm93c2luZ0NvbnRleHQpIHtcblx0dmFyIEJyb3dzaW5nQ29udGV4dCA9IHJlcXVpcmUoXCIuL2Jyb3dzaW5nX2NvbnRleHRcIik7ICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBCcm93c2luZ0NvbnRleHQgXSk7XG5cblx0Ly8gcHJvcGVydGllc1xuXHR0aGlzLnRvcCA9IFZpZXdwb3J0RWRnZS50b3AoYnJvd3NpbmdDb250ZXh0KTtcblx0dGhpcy5yaWdodCA9IFZpZXdwb3J0RWRnZS5yaWdodChicm93c2luZ0NvbnRleHQpO1xuXHR0aGlzLmJvdHRvbSA9IFZpZXdwb3J0RWRnZS5ib3R0b20oYnJvd3NpbmdDb250ZXh0KTtcblx0dGhpcy5sZWZ0ID0gVmlld3BvcnRFZGdlLmxlZnQoYnJvd3NpbmdDb250ZXh0KTtcblxuXHR0aGlzLndpZHRoID0gR2VuZXJpY1NpemUuY3JlYXRlKHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJ3aWR0aCBvZiB2aWV3cG9ydFwiKTtcblx0dGhpcy5oZWlnaHQgPSBHZW5lcmljU2l6ZS5jcmVhdGUodGhpcy50b3AsIHRoaXMuYm90dG9tLCBcImhlaWdodCBvZiB2aWV3cG9ydFwiKTtcblxuXHR0aGlzLmNlbnRlciA9IENlbnRlci54KHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJjZW50ZXIgb2Ygdmlld3BvcnRcIik7XG5cdHRoaXMubWlkZGxlID0gQ2VudGVyLnkodGhpcy50b3AsIHRoaXMuYm90dG9tLCBcIm1pZGRsZSBvZiB2aWV3cG9ydFwiKTtcbn07XG5Bc3NlcnRhYmxlLmV4dGVuZChNZSk7XG4iLCIvLyBDb3B5cmlnaHQgVGl0YW5pdW0gSS5ULiBMTEMuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFFFbGVtZW50ID0gcmVxdWlyZSgnLi9xX2VsZW1lbnQuanMnKTtcbnZhciBRRnJhbWUgPSByZXF1aXJlKFwiLi9xX2ZyYW1lLmpzXCIpO1xudmFyIGJyb3dzZXIgPSByZXF1aXJlKFwiLi9icm93c2VyLmpzXCIpO1xuXG5leHBvcnRzLmJyb3dzZXIgPSBicm93c2VyO1xuXG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spIHtcblx0cmV0dXJuIFFGcmFtZS5jcmVhdGUoZG9jdW1lbnQuYm9keSwgb3B0aW9ucywgZnVuY3Rpb24oZXJyLCBjYWxsYmFja0ZyYW1lKSB7XG5cdFx0aWYgKGVycikgcmV0dXJuIGNhbGxiYWNrKGVycik7XG5cdFx0YnJvd3Nlci5kZXRlY3RCcm93c2VyRmVhdHVyZXMoZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRjYWxsYmFjayhlcnIsIGNhbGxiYWNrRnJhbWUpO1xuXHRcdH0pO1xuXHR9KTtcbn07XG5cbmV4cG9ydHMuZWxlbWVudEZyb21Eb20gPSBmdW5jdGlvbihkb21FbGVtZW50LCBuaWNrbmFtZSkge1xuXHRyZXR1cm4gUUVsZW1lbnQuY3JlYXRlKGRvbUVsZW1lbnQsIG5pY2tuYW1lKTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMtMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gU2VlIExJQ0VOU0UuVFhUIGZvciBkZXRhaWxzLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIFJ1bnRpbWUgYXNzZXJ0aW9ucyBmb3IgcHJvZHVjdGlvbiBjb2RlLiAoQ29udHJhc3QgdG8gYXNzZXJ0LmpzLCB3aGljaCBpcyBmb3IgdGVzdCBjb2RlLilcblxudmFyIHNoaW0gPSByZXF1aXJlKFwiLi9zaGltLmpzXCIpO1xudmFyIG9vcCA9IHJlcXVpcmUoXCIuL29vcC5qc1wiKTtcblxuZXhwb3J0cy50aGF0ID0gZnVuY3Rpb24odmFyaWFibGUsIG1lc3NhZ2UpIHtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWVcIjtcblxuXHRpZiAodmFyaWFibGUgPT09IGZhbHNlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgbWVzc2FnZSk7XG5cdGlmICh2YXJpYWJsZSAhPT0gdHJ1ZSkgdGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnRoYXQsIFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWUgb3IgZmFsc2VcIik7XG59O1xuXG5leHBvcnRzLnVucmVhY2hhYmxlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRpZiAoIW1lc3NhZ2UpIG1lc3NhZ2UgPSBcIlVucmVhY2hhYmxlIGNvZGUgZXhlY3V0ZWRcIjtcblxuXHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudW5yZWFjaGFibGUsIG1lc3NhZ2UpO1xufTtcblxuZXhwb3J0cy5zaWduYXR1cmUgPSBmdW5jdGlvbihhcmdzLCBzaWduYXR1cmUpIHtcblx0c2lnbmF0dXJlID0gc2lnbmF0dXJlIHx8IFtdO1xuXHR2YXIgZXhwZWN0ZWRBcmdDb3VudCA9IHNpZ25hdHVyZS5sZW5ndGg7XG5cdHZhciBhY3R1YWxBcmdDb3VudCA9IGFyZ3MubGVuZ3RoO1xuXG5cdGlmIChhY3R1YWxBcmdDb3VudCA+IGV4cGVjdGVkQXJnQ291bnQpIHtcblx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKFxuXHRcdFx0ZXhwb3J0cy5zaWduYXR1cmUsXG5cdFx0XHRcIkZ1bmN0aW9uIGNhbGxlZCB3aXRoIHRvbyBtYW55IGFyZ3VtZW50czogZXhwZWN0ZWQgXCIgKyBleHBlY3RlZEFyZ0NvdW50ICsgXCIgYnV0IGdvdCBcIiArIGFjdHVhbEFyZ0NvdW50XG5cdFx0KTtcblx0fVxuXG5cdHZhciBhcmcsIHR5cGVzLCBuYW1lO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xuXHRcdGFyZyA9IGFyZ3NbaV07XG5cdFx0dHlwZXMgPSBzaWduYXR1cmVbaV07XG5cdFx0bmFtZSA9IFwiQXJndW1lbnQgI1wiICsgKGkgKyAxKTtcblxuXHRcdGlmICghc2hpbS5BcnJheS5pc0FycmF5KHR5cGVzKSkgdHlwZXMgPSBbIHR5cGVzIF07XG5cdFx0aWYgKCFhcmdNYXRjaGVzQW55UG9zc2libGVUeXBlKGFyZywgdHlwZXMpKSB7XG5cdFx0XHR2YXIgbWVzc2FnZSA9IG5hbWUgKyBcIiBleHBlY3RlZCBcIiArIGV4cGxhaW5Qb3NzaWJsZVR5cGVzKHR5cGVzKSArIFwiLCBidXQgd2FzIFwiICsgZXhwbGFpbkFyZyhhcmcpO1xuXHRcdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnNpZ25hdHVyZSwgbWVzc2FnZSk7XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBhcmdNYXRjaGVzQW55UG9zc2libGVUeXBlKGFyZywgdHlwZSkge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoYXJnTWF0Y2hlc1R5cGUoYXJnLCB0eXBlW2ldKSkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xuXG5cdGZ1bmN0aW9uIGFyZ01hdGNoZXNUeXBlKGFyZywgdHlwZSkge1xuXHRcdHN3aXRjaCAoZ2V0QXJnVHlwZShhcmcpKSB7XG5cdFx0XHRjYXNlIFwiYm9vbGVhblwiOiByZXR1cm4gdHlwZSA9PT0gQm9vbGVhbjtcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIHR5cGUgPT09IFN0cmluZztcblx0XHRcdGNhc2UgXCJudW1iZXJcIjogcmV0dXJuIHR5cGUgPT09IE51bWJlcjtcblx0XHRcdGNhc2UgXCJhcnJheVwiOiByZXR1cm4gdHlwZSA9PT0gQXJyYXk7XG5cdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjogcmV0dXJuIHR5cGUgPT09IEZ1bmN0aW9uO1xuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOiByZXR1cm4gdHlwZSA9PT0gT2JqZWN0IHx8IGFyZyBpbnN0YW5jZW9mIHR5cGU7XG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6IHJldHVybiB0eXBlID09PSB1bmRlZmluZWQ7XG5cdFx0XHRjYXNlIFwibnVsbFwiOiByZXR1cm4gdHlwZSA9PT0gbnVsbDtcblx0XHRcdGNhc2UgXCJOYU5cIjogcmV0dXJuIHR5cGVvZih0eXBlKSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih0eXBlKTtcblxuXHRcdFx0ZGVmYXVsdDogZXhwb3J0cy51bnJlYWNoYWJsZSgpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBleHBsYWluUG9zc2libGVUeXBlcyh0eXBlKSB7XG5cdHZhciBqb2luZXIgPSBcIlwiO1xuXHR2YXIgcmVzdWx0ID0gXCJcIjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0cmVzdWx0ICs9IGpvaW5lciArIGV4cGxhaW5PbmVUeXBlKHR5cGVbaV0pO1xuXHRcdGpvaW5lciA9IChpID09PSB0eXBlLmxlbmd0aCAtIDIpID8gXCIsIG9yIFwiIDogXCIsIFwiO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG5cblx0ZnVuY3Rpb24gZXhwbGFpbk9uZVR5cGUodHlwZSkge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBCb29sZWFuOiByZXR1cm4gXCJib29sZWFuXCI7XG5cdFx0XHRjYXNlIFN0cmluZzogcmV0dXJuIFwic3RyaW5nXCI7XG5cdFx0XHRjYXNlIE51bWJlcjogcmV0dXJuIFwibnVtYmVyXCI7XG5cdFx0XHRjYXNlIEFycmF5OiByZXR1cm4gXCJhcnJheVwiO1xuXHRcdFx0Y2FzZSBGdW5jdGlvbjogcmV0dXJuIFwiZnVuY3Rpb25cIjtcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIFwibnVsbFwiO1xuXHRcdFx0Y2FzZSB1bmRlZmluZWQ6IHJldHVybiBcInVuZGVmaW5lZFwiO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHR5cGUpKSByZXR1cm4gXCJOYU5cIjtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9vcC5jbGFzc05hbWUodHlwZSkgKyBcIiBpbnN0YW5jZVwiO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5BcmcoYXJnKSB7XG5cdHZhciB0eXBlID0gZ2V0QXJnVHlwZShhcmcpO1xuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHR5cGU7XG5cblx0cmV0dXJuIG9vcC5pbnN0YW5jZU5hbWUoYXJnKSArIFwiIGluc3RhbmNlXCI7XG59XG5cbmZ1bmN0aW9uIGdldEFyZ1R5cGUodmFyaWFibGUpIHtcblx0dmFyIHR5cGUgPSB0eXBlb2YgdmFyaWFibGU7XG5cdGlmICh2YXJpYWJsZSA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRpZiAoc2hpbS5BcnJheS5pc0FycmF5KHZhcmlhYmxlKSkgdHlwZSA9IFwiYXJyYXlcIjtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4odmFyaWFibGUpKSB0eXBlID0gXCJOYU5cIjtcblx0cmV0dXJuIHR5cGU7XG59XG5cblxuLyoqKioqL1xuXG52YXIgRW5zdXJlRXhjZXB0aW9uID0gZXhwb3J0cy5FbnN1cmVFeGNlcHRpb24gPSBmdW5jdGlvbiBFbnN1cmVFeGNlcHRpb24oZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlLCBtZXNzYWdlKSB7XG5cdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlKTtcblx0ZWxzZSB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjaztcblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn07XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5zdXJlRXhjZXB0aW9uO1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZS5uYW1lID0gXCJFbnN1cmVFeGNlcHRpb25cIjtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gY2FuJ3QgdXNlIGVuc3VyZS5qcyBkdWUgdG8gY2lyY3VsYXIgZGVwZW5kZW5jeVxudmFyIHNoaW0gPSByZXF1aXJlKFwiLi9zaGltLmpzXCIpO1xuXG5leHBvcnRzLmNsYXNzTmFtZSA9IGZ1bmN0aW9uKGNvbnN0cnVjdG9yKSB7XG5cdGlmICh0eXBlb2YgY29uc3RydWN0b3IgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiTm90IGEgY29uc3RydWN0b3JcIik7XG5cdHJldHVybiBzaGltLkZ1bmN0aW9uLm5hbWUoY29uc3RydWN0b3IpO1xufTtcblxuZXhwb3J0cy5pbnN0YW5jZU5hbWUgPSBmdW5jdGlvbihvYmopIHtcblx0dmFyIHByb3RvdHlwZSA9IHNoaW0uT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG5cdGlmIChwcm90b3R5cGUgPT09IG51bGwpIHJldHVybiBcIjxubyBwcm90b3R5cGU+XCI7XG5cblx0dmFyIGNvbnN0cnVjdG9yID0gcHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuXHRpZiAoY29uc3RydWN0b3IgPT09IHVuZGVmaW5lZCB8fCBjb25zdHJ1Y3RvciA9PT0gbnVsbCkgcmV0dXJuIFwiPGFub24+XCI7XG5cblx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZShjb25zdHJ1Y3Rvcik7XG59O1xuXG5leHBvcnRzLmV4dGVuZEZuID0gZnVuY3Rpb24gZXh0ZW5kRm4ocGFyZW50Q29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKGNoaWxkQ29uc3RydWN0b3IpIHtcblx0XHRjaGlsZENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IHNoaW0uT2JqZWN0LmNyZWF0ZShwYXJlbnRDb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuXHRcdGNoaWxkQ29uc3RydWN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY2hpbGRDb25zdHJ1Y3Rvcjtcblx0fTtcbn07XG5cbmV4cG9ydHMubWFrZUFic3RyYWN0ID0gZnVuY3Rpb24gbWFrZUFic3RyYWN0KGNvbnN0cnVjdG9yLCBtZXRob2RzKSB7XG5cdHZhciBuYW1lID0gc2hpbS5GdW5jdGlvbi5uYW1lKGNvbnN0cnVjdG9yKTtcblx0c2hpbS5BcnJheS5mb3JFYWNoKG1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCkge1xuXHRcdGNvbnN0cnVjdG9yLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IobmFtZSArIFwiIHN1YmNsYXNzZXMgbXVzdCBpbXBsZW1lbnQgXCIgKyBtZXRob2QgKyBcIigpIG1ldGhvZFwiKTtcblx0XHR9O1xuXHR9KTtcblxuXHRjb25zdHJ1Y3Rvci5wcm90b3R5cGUuY2hlY2tBYnN0cmFjdE1ldGhvZHMgPSBmdW5jdGlvbiBjaGVja0Fic3RyYWN0TWV0aG9kcygpIHtcblx0XHR2YXIgdW5pbXBsZW1lbnRlZCA9IFtdO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRzaGltLkFycmF5LmZvckVhY2gobWV0aG9kcywgZnVuY3Rpb24obmFtZSkge1xuXHRcdFx0aWYgKHNlbGZbbmFtZV0gPT09IGNvbnN0cnVjdG9yLnByb3RvdHlwZVtuYW1lXSkgdW5pbXBsZW1lbnRlZC5wdXNoKG5hbWUgKyBcIigpXCIpO1xuXHRcdH0pO1xuXHRcdHJldHVybiB1bmltcGxlbWVudGVkO1xuXHR9O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG4vKmVzbGludCBlcWVxZXE6IFwib2ZmXCIsIG5vLWVxLW51bGw6IFwib2ZmXCIsIG5vLWJpdHdpc2U6IFwib2ZmXCIgKi9cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLkFycmF5ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gQXJyYXkuaXNBcnJheVxuXHRpc0FycmF5OiBmdW5jdGlvbiBpc0FycmF5KHRoaW5nKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkpIHJldHVybiBBcnJheS5pc0FycmF5KHRoaW5nKTtcblxuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpbmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gQXJyYXkuZXZlcnlcblx0ZXZlcnk6IGZ1bmN0aW9uIGV2ZXJ5KG9iaiwgY2FsbGJhY2tmbiwgdGhpc0FyZykge1xuXHRcdC8qanNoaW50IGJpdHdpc2U6ZmFsc2UsIGVxZXFlcTpmYWxzZSwgLVcwNDE6ZmFsc2UgKi9cblx0XHRpZiAoQXJyYXkucHJvdG90eXBlLmV2ZXJ5KSByZXR1cm4gb2JqLmV2ZXJ5KGNhbGxiYWNrZm4sIHRoaXNBcmcpO1xuXG5cdFx0Ly8gVGhpcyB3b3JrYXJvdW5kIGJhc2VkIG9uIHBvbHlmaWxsIGNvZGUgZnJvbSBNRE46XG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZXZlcnlcblx0XHR2YXIgVCwgaztcblxuXHRcdGlmICh0aGlzID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ3RoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuXHRcdH1cblxuXHRcdC8vIDEuIExldCBPIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyBUb09iamVjdCBwYXNzaW5nIHRoZSB0aGlzXG5cdFx0Ly8gICAgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxuXHRcdHZhciBPID0gT2JqZWN0KHRoaXMpO1xuXG5cdFx0Ly8gMi4gTGV0IGxlblZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsIG1ldGhvZFxuXHRcdC8vICAgIG9mIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cblx0XHQvLyAzLiBMZXQgbGVuIGJlIFRvVWludDMyKGxlblZhbHVlKS5cblx0XHR2YXIgbGVuID0gTy5sZW5ndGggPj4+IDA7XG5cblx0XHQvLyA0LiBJZiBJc0NhbGxhYmxlKGNhbGxiYWNrZm4pIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG5cdFx0aWYgKHR5cGVvZiBjYWxsYmFja2ZuICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG5cdFx0fVxuXG5cdFx0Ly8gNS4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFQgYmUgdW5kZWZpbmVkLlxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0VCA9IHRoaXNBcmc7XG5cdFx0fVxuXG5cdFx0Ly8gNi4gTGV0IGsgYmUgMC5cblx0XHRrID0gMDtcblxuXHRcdC8vIDcuIFJlcGVhdCwgd2hpbGUgayA8IGxlblxuXHRcdHdoaWxlIChrIDwgbGVuKSB7XG5cblx0XHRcdHZhciBrVmFsdWU7XG5cblx0XHRcdC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cblx0XHRcdC8vICAgVGhpcyBpcyBpbXBsaWNpdCBmb3IgTEhTIG9wZXJhbmRzIG9mIHRoZSBpbiBvcGVyYXRvclxuXHRcdFx0Ly8gYi4gTGV0IGtQcmVzZW50IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgSGFzUHJvcGVydHkgaW50ZXJuYWxcblx0XHRcdC8vICAgIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG5cdFx0XHQvLyAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXG5cdFx0XHQvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXG5cdFx0XHRpZiAoayBpbiBPKSB7XG5cblx0XHRcdFx0Ly8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Rcblx0XHRcdFx0Ly8gICAgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuXHRcdFx0XHRrVmFsdWUgPSBPW2tdO1xuXG5cdFx0XHRcdC8vIGlpLiBMZXQgdGVzdFJlc3VsdCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIENhbGwgaW50ZXJuYWwgbWV0aG9kXG5cdFx0XHRcdC8vICAgICBvZiBjYWxsYmFja2ZuIHdpdGggVCBhcyB0aGUgdGhpcyB2YWx1ZSBhbmQgYXJndW1lbnQgbGlzdFxuXHRcdFx0XHQvLyAgICAgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxuXHRcdFx0XHR2YXIgdGVzdFJlc3VsdCA9IGNhbGxiYWNrZm4uY2FsbChULCBrVmFsdWUsIGssIE8pO1xuXG5cdFx0XHRcdC8vIGlpaS4gSWYgVG9Cb29sZWFuKHRlc3RSZXN1bHQpIGlzIGZhbHNlLCByZXR1cm4gZmFsc2UuXG5cdFx0XHRcdGlmICghdGVzdFJlc3VsdCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aysrO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmZvckVhY2hcblx0Zm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChvYmosIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG5cdFx0Lypqc2hpbnQgYml0d2lzZTpmYWxzZSwgZXFlcWVxOmZhbHNlLCAtVzA0MTpmYWxzZSAqL1xuXG5cdFx0aWYgKEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSByZXR1cm4gb2JqLmZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpO1xuXG5cdFx0Ly8gVGhpcyB3b3JrYXJvdW5kIGJhc2VkIG9uIHBvbHlmaWxsIGNvZGUgZnJvbSBNRE46XG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZm9yRWFjaFxuXG5cdFx0Ly8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA1LCAxNS40LjQuMThcblx0XHQvLyBSZWZlcmVuY2U6IGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuNC40LjE4XG5cblx0XHR2YXIgVCwgaztcblxuXHRcdGlmIChvYmogPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuXHRcdH1cblxuXHRcdC8vIDEuIExldCBPIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyBUb09iamVjdCBwYXNzaW5nIHRoZSB8dGhpc3wgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxuXHRcdHZhciBPID0gT2JqZWN0KG9iaik7XG5cblx0XHQvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cblx0XHQvLyAzLiBMZXQgbGVuIGJlIFRvVWludDMyKGxlblZhbHVlKS5cblx0XHR2YXIgbGVuID0gTy5sZW5ndGggPj4+IDA7XG5cblx0XHQvLyA0LiBJZiBJc0NhbGxhYmxlKGNhbGxiYWNrKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuXHRcdC8vIFNlZTogaHR0cDovL2VzNS5naXRodWIuY29tLyN4OS4xMVxuXHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihjYWxsYmFjayArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcblx0XHR9XG5cblx0XHQvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRUID0gdGhpc0FyZztcblx0XHR9XG5cblx0XHQvLyA2LiBMZXQgayBiZSAwXG5cdFx0ayA9IDA7XG5cblx0XHQvLyA3LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW5cblx0XHR3aGlsZSAoayA8IGxlbikge1xuXG5cdFx0XHR2YXIga1ZhbHVlO1xuXG5cdFx0XHQvLyBhLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG5cdFx0XHQvLyAgIFRoaXMgaXMgaW1wbGljaXQgZm9yIExIUyBvcGVyYW5kcyBvZiB0aGUgaW4gb3BlcmF0b3Jcblx0XHRcdC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEhhc1Byb3BlcnR5IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG5cdFx0XHQvLyAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXG5cdFx0XHQvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXG5cdFx0XHRpZiAoayBpbiBPKSB7XG5cblx0XHRcdFx0Ly8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuXHRcdFx0XHRrVmFsdWUgPSBPW2tdO1xuXG5cdFx0XHRcdC8vIGlpLiBDYWxsIHRoZSBDYWxsIGludGVybmFsIG1ldGhvZCBvZiBjYWxsYmFjayB3aXRoIFQgYXMgdGhlIHRoaXMgdmFsdWUgYW5kXG5cdFx0XHRcdC8vIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxuXHRcdFx0XHRjYWxsYmFjay5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG5cdFx0XHR9XG5cdFx0XHQvLyBkLiBJbmNyZWFzZSBrIGJ5IDEuXG5cdFx0XHRrKys7XG5cdFx0fVxuXHRcdC8vIDguIHJldHVybiB1bmRlZmluZWRcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuRG9jdW1lbnQgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBkb2N1bWVudC5oZWFkXG5cdGhlYWQ6IGZ1bmN0aW9uIGhlYWQoZG9jKSB7XG5cdFx0aWYgKGRvYy5oZWFkKSByZXR1cm4gZG9jLmhlYWQ7XG5cblx0XHRyZXR1cm4gZG9jLnF1ZXJ5U2VsZWN0b3IoXCJoZWFkXCIpO1xuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5FbGVtZW50ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgOCwgSUUgOSwgSUUgMTAsIElFIDExOiBubyBFbGVtZW50LnJlbW92ZSgpXG5cdHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKGVsZW1lbnQpIHtcblx0XHRlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkV2ZW50VGFyZ2V0ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gRXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigpXG5cdGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikgcmV0dXJuIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2FsbGJhY2spO1xuXG5cdFx0ZWxlbWVudC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudCwgY2FsbGJhY2spO1xuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5GdW5jdGlvbiA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDgsIElFIDksIElFIDEwLCBJRSAxMTogbm8gZnVuY3Rpb24ubmFtZVxuXHRuYW1lOiBmdW5jdGlvbiBuYW1lKGZuKSB7XG5cdFx0aWYgKGZuLm5hbWUpIHJldHVybiBmbi5uYW1lO1xuXG5cdFx0Ly8gQmFzZWQgb24gY29kZSBieSBKYXNvbiBCdW50aW5nIGV0IGFsLCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMzI0Mjlcblx0XHR2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccysoLnsxLH0pXFxzKlxcKC87XG5cdFx0dmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuXHRcdHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXSA6IFwiPGFub24+XCI7XG5cdH0sXG5cbn07XG5cblxuZXhwb3J0cy5PYmplY3QgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBPYmplY3QuY3JlYXRlKClcblx0Y3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUocHJvdG90eXBlKSB7XG5cdFx0aWYgKE9iamVjdC5jcmVhdGUpIHJldHVybiBPYmplY3QuY3JlYXRlKHByb3RvdHlwZSk7XG5cblx0XHR2YXIgVGVtcCA9IGZ1bmN0aW9uIFRlbXAoKSB7fTtcblx0XHRUZW1wLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcblx0XHRyZXR1cm4gbmV3IFRlbXAoKTtcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5nZXRQcm90b3R5cGVPZlxuXHQvLyBDYXV0aW9uOiBEb2Vzbid0IHdvcmsgb24gSUUgOCBpZiBjb25zdHJ1Y3RvciBoYXMgYmVlbiBjaGFuZ2VkLCBhcyBpcyB0aGUgY2FzZSB3aXRoIGEgc3ViY2xhc3MuXG5cdGdldFByb3RvdHlwZU9mOiBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihvYmopIHtcblx0XHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG5cblx0XHR2YXIgcmVzdWx0ID0gb2JqLmNvbnN0cnVjdG9yID8gb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA6IG51bGw7XG5cdFx0cmV0dXJuIHJlc3VsdCB8fCBudWxsO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gT2JqZWN0LmtleXNcblx0a2V5czogZnVuY3Rpb24ga2V5cyhvYmopIHtcblx0XHRpZiAoT2JqZWN0LmtleXMpIHJldHVybiBPYmplY3Qua2V5cyhvYmopO1xuXG5cdFx0Ly8gRnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qva2V5c1xuXHRcdHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG5cdFx0XHRoYXNEb250RW51bUJ1ZyA9ICEoeyB0b1N0cmluZzogbnVsbCB9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKSxcblx0XHRcdGRvbnRFbnVtcyA9IFtcblx0XHRcdFx0J3RvU3RyaW5nJyxcblx0XHRcdFx0J3RvTG9jYWxlU3RyaW5nJyxcblx0XHRcdFx0J3ZhbHVlT2YnLFxuXHRcdFx0XHQnaGFzT3duUHJvcGVydHknLFxuXHRcdFx0XHQnaXNQcm90b3R5cGVPZicsXG5cdFx0XHRcdCdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG5cdFx0XHRcdCdjb25zdHJ1Y3Rvcidcblx0XHRcdF0sXG5cdFx0XHRkb250RW51bXNMZW5ndGggPSBkb250RW51bXMubGVuZ3RoO1xuXG5cdFx0aWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICh0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5rZXlzIGNhbGxlZCBvbiBub24tb2JqZWN0Jyk7XG5cdFx0fVxuXG5cdFx0dmFyIHJlc3VsdCA9IFtdLCBwcm9wLCBpO1xuXG5cdFx0Zm9yIChwcm9wIGluIG9iaikge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuXHRcdFx0XHRyZXN1bHQucHVzaChwcm9wKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoaGFzRG9udEVudW1CdWcpIHtcblx0XHRcdGZvciAoaSA9IDA7IGkgPCBkb250RW51bXNMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLlN0cmluZyA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFN0cmluZy50cmltKClcblx0dHJpbTogZnVuY3Rpb24oc3RyKSB7XG5cdFx0aWYgKHN0ci50cmltICE9PSB1bmRlZmluZWQpIHJldHVybiBzdHIudHJpbSgpO1xuXG5cdFx0Ly8gQmFzZWQgb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL1RyaW1cblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nLCAnJyk7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLldpbmRvdyA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFdpbmRvdy5wYWdlWE9mZnNldFxuXHRwYWdlWE9mZnNldDogZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCkge1xuXHRcdGlmICh3aW5kb3cucGFnZVhPZmZzZXQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHdpbmRvdy5wYWdlWE9mZnNldDtcblxuXHRcdC8vIEJhc2VkIG9uIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cuc2Nyb2xsWVxuXHRcdHZhciBpc0NTUzFDb21wYXQgPSAoKGRvY3VtZW50LmNvbXBhdE1vZGUgfHwgXCJcIikgPT09IFwiQ1NTMUNvbXBhdFwiKTtcblx0XHRyZXR1cm4gaXNDU1MxQ29tcGF0ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgOiBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG5cdH0sXG5cblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFdpbmRvdy5wYWdlWU9mZnNldFxuXHRwYWdlWU9mZnNldDogZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCkge1xuXHRcdGlmICh3aW5kb3cucGFnZVlPZmZzZXQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHdpbmRvdy5wYWdlWU9mZnNldDtcblxuXHRcdC8vIEJhc2VkIG9uIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cuc2Nyb2xsWVxuXHRcdHZhciBpc0NTUzFDb21wYXQgPSAoKGRvY3VtZW50LmNvbXBhdE1vZGUgfHwgXCJcIikgPT09IFwiQ1NTMUNvbXBhdFwiKTtcblx0XHRyZXR1cm4gaXNDU1MxQ29tcGF0ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXHR9XG5cbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTYgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi92YWx1ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBQaXhlbHMoYW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFsgTnVtYmVyLCBudWxsIF0gXSk7XG5cdHRoaXMuX25vbmUgPSAoYW1vdW50ID09PSBudWxsKTtcblx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShhbW91bnQpIHtcblx0cmV0dXJuIG5ldyBNZShhbW91bnQpO1xufTtcblxuTWUuY3JlYXRlTm9uZSA9IGZ1bmN0aW9uIGNyZWF0ZU5vbmUoKSB7XG5cdHJldHVybiBuZXcgTWUobnVsbCk7XG59O1xuXG5NZS5aRVJPID0gTWUuY3JlYXRlKDApO1xuTWUuTk9ORSA9IE1lLmNyZWF0ZU5vbmUoKTtcblxuTWUucHJvdG90eXBlLmNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbiBjb21wYXRpYmlsaXR5KCkge1xuXHRyZXR1cm4gWyBNZSBdO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIHBsdXMob3BlcmFuZCkge1xuXHRpZiAodGhpcy5fbm9uZSB8fCBvcGVyYW5kLl9ub25lKSByZXR1cm4gTWUuY3JlYXRlTm9uZSgpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2Ftb3VudCArIG9wZXJhbmQuX2Ftb3VudCk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdGlmICh0aGlzLl9ub25lIHx8IG9wZXJhbmQuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50IC0gb3BlcmFuZC5fYW1vdW50KTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZmVyZW5jZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZmVyZW5jZShvcGVyYW5kKSB7XG5cdGlmICh0aGlzLl9ub25lIHx8IG9wZXJhbmQuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUoTWF0aC5hYnModGhpcy5fYW1vdW50IC0gb3BlcmFuZC5fYW1vdW50KSk7XG59KTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMob3BlcmFuZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIgXSk7XG5cblx0aWYgKHRoaXMuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50ICogb3BlcmFuZCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYXZlcmFnZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gYXZlcmFnZShvcGVyYW5kKSB7XG5cdGlmICh0aGlzLl9ub25lIHx8IG9wZXJhbmQuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUoKHRoaXMuX2Ftb3VudCArIG9wZXJhbmQuX2Ftb3VudCkgLyAyKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuY29tcGFyZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gY29tcGFyZShvcGVyYW5kKSB7XG5cdHZhciBib3RoSGF2ZVBpeGVscyA9ICF0aGlzLl9ub25lICYmICFvcGVyYW5kLl9ub25lO1xuXHR2YXIgbmVpdGhlckhhdmVQaXhlbHMgPSB0aGlzLl9ub25lICYmIG9wZXJhbmQuX25vbmU7XG5cdHZhciBvbmx5TGVmdEhhc1BpeGVscyA9ICF0aGlzLl9ub25lICYmIG9wZXJhbmQuX25vbmU7XG5cblx0aWYgKGJvdGhIYXZlUGl4ZWxzKSB7XG5cdFx0dmFyIGRpZmZlcmVuY2UgPSB0aGlzLl9hbW91bnQgLSBvcGVyYW5kLl9hbW91bnQ7XG5cdFx0aWYgKE1hdGguYWJzKGRpZmZlcmVuY2UpIDw9IDAuNSkgcmV0dXJuIDA7XG5cdFx0ZWxzZSByZXR1cm4gZGlmZmVyZW5jZTtcblx0fVxuXHRlbHNlIGlmIChuZWl0aGVySGF2ZVBpeGVscykge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0fVxuXHRlbHNlIGlmIChvbmx5TGVmdEhhc1BpeGVscykge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJldHVybiAtMTtcblx0fVxufSk7XG5cbk1lLm1pbiA9IGZ1bmN0aW9uKGwsIHIpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUsIE1lIF0pO1xuXG5cdGlmIChsLl9ub25lIHx8IHIuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBsLmNvbXBhcmUocikgPD0gMCA/IGwgOiByO1xufTtcblxuTWUubWF4ID0gZnVuY3Rpb24obCwgcikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgTWUgXSk7XG5cblx0aWYgKGwuX25vbmUgfHwgci5fbm9uZSkgcmV0dXJuIE1lLmNyZWF0ZU5vbmUoKTtcblx0cmV0dXJuIGwuY29tcGFyZShyKSA+PSAwID8gbCA6IHI7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRpZiAodGhpcy5jb21wYXJlKGV4cGVjdGVkKSA9PT0gMCkgcmV0dXJuIFwiXCI7XG5cdGlmICh0aGlzLl9ub25lIHx8IGV4cGVjdGVkLl9ub25lKSByZXR1cm4gXCJub24tbWVhc3VyYWJsZVwiO1xuXG5cdHZhciBkaWZmZXJlbmNlID0gTWF0aC5hYnModGhpcy5fYW1vdW50IC0gZXhwZWN0ZWQuX2Ftb3VudCk7XG5cblx0dmFyIGRlc2MgPSBkaWZmZXJlbmNlO1xuXHRpZiAoZGlmZmVyZW5jZSAqIDEwMCAhPT0gTWF0aC5mbG9vcihkaWZmZXJlbmNlICogMTAwKSkgZGVzYyA9IFwiYWJvdXQgXCIgKyBkaWZmZXJlbmNlLnRvRml4ZWQoMik7XG5cdHJldHVybiBkZXNjICsgXCJweFwiO1xufSk7XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fbm9uZSA/IFwibm8gcGl4ZWxzXCIgOiB0aGlzLl9hbW91bnQgKyBcInB4XCI7XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTYgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi92YWx1ZS5qc1wiKTtcbnZhciBQaXhlbHMgPSByZXF1aXJlKFwiLi9waXhlbHMuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuL3NpemUuanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUG9zaXRpb24oZGltZW5zaW9uLCB2YWx1ZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFsgTnVtYmVyLCBQaXhlbHMgXSBdKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX3ZhbHVlID0gKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikgPyBQaXhlbHMuY3JlYXRlKHZhbHVlKSA6IHZhbHVlO1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLnggPSBmdW5jdGlvbiB4KHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFsgTnVtYmVyLCBQaXhlbHMgXSBdKTtcblxuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24geSh2YWx1ZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbIE51bWJlciwgUGl4ZWxzIF0gXSk7XG5cblx0cmV0dXJuIG5ldyBNZShZX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUubm9YID0gZnVuY3Rpb24gbm9YKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiBuZXcgTWUoWF9ESU1FTlNJT04sIFBpeGVscy5OT05FKTtcbn07XG5cbk1lLm5vWSA9IGZ1bmN0aW9uIG5vWSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCBQaXhlbHMuTk9ORSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lLCBTaXplIF07XG59O1xuXG5NZS5wcm90b3R5cGUuZGlzdGFuY2VUbyA9IGZ1bmN0aW9uKG9wZXJhbmQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIFNpemUuY3JlYXRlKHRoaXMuX3ZhbHVlLmRpZmZlcmVuY2Uob3BlcmFuZC50b1BpeGVscygpKSk7XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3ZhbHVlLnBsdXMob3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3ZhbHVlLm1pbnVzKG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taWRwb2ludCA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWlkcG9pbnQob3BlcmFuZCkge1xuXHRjaGVja0F4aXModGhpcywgb3BlcmFuZCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fZGltZW5zaW9uLCB0aGlzLl92YWx1ZS5hdmVyYWdlKG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5jb21wYXJlID0gVmFsdWUuc2FmZShmdW5jdGlvbiBjb21wYXJlKG9wZXJhbmQpIHtcblx0Y2hlY2tBeGlzKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gdGhpcy5fdmFsdWUuY29tcGFyZShvcGVyYW5kLnRvUGl4ZWxzKCkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taW4gPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbihvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIFBpeGVscy5taW4odGhpcy5fdmFsdWUsIG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5tYXggPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1heChvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIFBpeGVscy5tYXgodGhpcy5fdmFsdWUsIG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRjaGVja0F4aXModGhpcywgZXhwZWN0ZWQpO1xuXG5cdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMuX3ZhbHVlO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLl92YWx1ZTtcblxuXHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblx0ZWxzZSBpZiAoaXNOb25lKGV4cGVjdGVkKSAmJiAhaXNOb25lKHRoaXMpKSByZXR1cm4gXCJyZW5kZXJlZFwiO1xuXHRlbHNlIGlmICghaXNOb25lKGV4cGVjdGVkKSAmJiBpc05vbmUodGhpcykpIHJldHVybiBcIm5vdCByZW5kZXJlZFwiO1xuXG5cdHZhciBkaXJlY3Rpb247XG5cdHZhciBjb21wYXJpc29uID0gYWN0dWFsVmFsdWUuY29tcGFyZShleHBlY3RlZFZhbHVlKTtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIGRpcmVjdGlvbiA9IGNvbXBhcmlzb24gPCAwID8gXCJ0byBsZWZ0XCIgOiBcInRvIHJpZ2h0XCI7XG5cdGVsc2UgZGlyZWN0aW9uID0gY29tcGFyaXNvbiA8IDAgPyBcImhpZ2hlclwiIDogXCJsb3dlclwiO1xuXG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgXCIgXCIgKyBkaXJlY3Rpb247XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0aWYgKGlzTm9uZSh0aGlzKSkgcmV0dXJuIFwibm90IHJlbmRlcmVkXCI7XG5cdGVsc2UgcmV0dXJuIHRoaXMuX3ZhbHVlLnRvU3RyaW5nKCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9QaXhlbHMgPSBmdW5jdGlvbiB0b1BpeGVscygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3ZhbHVlO1xufTtcblxuZnVuY3Rpb24gY2hlY2tBeGlzKHNlbGYsIG90aGVyKSB7XG5cdGlmIChvdGhlciBpbnN0YW5jZW9mIE1lKSB7XG5cdFx0ZW5zdXJlLnRoYXQoc2VsZi5fZGltZW5zaW9uID09PSBvdGhlci5fZGltZW5zaW9uLCBcIkNhbid0IGNvbXBhcmUgWCBjb29yZGluYXRlIHRvIFkgY29vcmRpbmF0ZVwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiBpc05vbmUocG9zaXRpb24pIHtcblx0cmV0dXJuIHBvc2l0aW9uLl92YWx1ZS5lcXVhbHMoUGl4ZWxzLk5PTkUpO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNi0yMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG5cbnZhciBSRU5ERVJFRCA9IFwicmVuZGVyZWRcIjtcbnZhciBOT1RfUkVOREVSRUQgPSBcIm5vdCByZW5kZXJlZFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbmRlclN0YXRlKHN0YXRlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblxuXHR0aGlzLl9zdGF0ZSA9IHN0YXRlO1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLnJlbmRlcmVkID0gZnVuY3Rpb24gcmVuZGVyZWQoKSB7XG5cdHJldHVybiBuZXcgTWUoUkVOREVSRUQpO1xufTtcblxuTWUubm90UmVuZGVyZWQgPSBmdW5jdGlvbiBub3RSZW5kZXJlZCgpIHtcblx0cmV0dXJuIG5ldyBNZShOT1RfUkVOREVSRUQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbiBjb21wYXRpYmlsaXR5KCkge1xuXHRyZXR1cm4gWyBNZSBdO1xufTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0dmFyIHRoaXNTdGF0ZSA9IHRoaXMuX3N0YXRlO1xuXHR2YXIgZXhwZWN0ZWRTdGF0ZSA9IGV4cGVjdGVkLl9zdGF0ZTtcblxuXHRpZiAodGhpc1N0YXRlID09PSBleHBlY3RlZFN0YXRlKSByZXR1cm4gXCJcIjtcblx0ZWxzZSByZXR1cm4gdGhpcy50b1N0cmluZygpO1xufSk7XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRyZXR1cm4gdGhpcy5fc3RhdGU7XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG52YXIgUGl4ZWxzID0gcmVxdWlyZShcIi4vcGl4ZWxzLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNpemUodmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgUGl4ZWxzXSBdKTtcblxuXHR0aGlzLl92YWx1ZSA9ICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpID8gUGl4ZWxzLmNyZWF0ZSh2YWx1ZSkgOiB2YWx1ZTtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBNZSh2YWx1ZSk7XG59O1xuXG5NZS5jcmVhdGVOb25lID0gZnVuY3Rpb24gY3JlYXRlTm9uZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gbmV3IE1lKFBpeGVscy5OT05FKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb21wYXRpYmlsaXR5ID0gZnVuY3Rpb24gY29tcGF0aWJpbGl0eSgpIHtcblx0cmV0dXJuIFsgTWUgXTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBwbHVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS5wbHVzKG9wZXJhbmQuX3ZhbHVlKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fdmFsdWUubWludXMob3BlcmFuZC5fdmFsdWUpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUudGltZXMgPSBmdW5jdGlvbiB0aW1lcyhvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fdmFsdWUudGltZXMob3BlcmFuZCkpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbXBhcmUgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGNvbXBhcmUodGhhdCkge1xuXHRyZXR1cm4gdGhpcy5fdmFsdWUuY29tcGFyZSh0aGF0Ll92YWx1ZSk7XG59KTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0dmFyIGFjdHVhbFZhbHVlID0gdGhpcy5fdmFsdWU7XG5cdHZhciBleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQuX3ZhbHVlO1xuXG5cdGlmIChhY3R1YWxWYWx1ZS5lcXVhbHMoZXhwZWN0ZWRWYWx1ZSkpIHJldHVybiBcIlwiO1xuXHRpZiAoaXNOb25lKGV4cGVjdGVkKSAmJiAhaXNOb25lKHRoaXMpKSByZXR1cm4gXCJyZW5kZXJlZFwiO1xuXHRpZiAoIWlzTm9uZShleHBlY3RlZCkgJiYgaXNOb25lKHRoaXMpKSByZXR1cm4gXCJub3QgcmVuZGVyZWRcIjtcblxuXHR2YXIgZGVzYyA9IGFjdHVhbFZhbHVlLmNvbXBhcmUoZXhwZWN0ZWRWYWx1ZSkgPiAwID8gXCIgbGFyZ2VyXCIgOiBcIiBzbWFsbGVyXCI7XG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgZGVzYztcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRpZiAoaXNOb25lKHRoaXMpKSByZXR1cm4gXCJub3QgcmVuZGVyZWRcIjtcblx0ZWxzZSByZXR1cm4gdGhpcy5fdmFsdWUudG9TdHJpbmcoKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1BpeGVscyA9IGZ1bmN0aW9uIHRvUGl4ZWxzKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fdmFsdWU7XG59O1xuXG5mdW5jdGlvbiBpc05vbmUoc2l6ZSkge1xuXHRyZXR1cm4gc2l6ZS5fdmFsdWUuZXF1YWxzKFBpeGVscy5OT05FKTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi4vdXRpbC9zaGltLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFZhbHVlKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcImNvbXBhdGliaWxpdHlcIixcblx0XCJkaWZmXCIsXG5cdFwidG9TdHJpbmdcIlxuXSk7XG5cbk1lLnNhZmUgPSBmdW5jdGlvbiBzYWZlKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRlbnN1cmVDb21wYXRpYmlsaXR5KHRoaXMsIHRoaXMuY29tcGF0aWJpbGl0eSgpLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdHJldHVybiB0aGlzLmRpZmYodGhhdCkgPT09IFwiXCI7XG59O1xuXG5NZS5wcm90b3R5cGUuaXNDb21wYXRpYmxlV2l0aCA9IGZ1bmN0aW9uIGlzQ29tcGF0aWJsZVdpdGgodGhhdCkge1xuXHRpZiAodGhhdCA9PT0gbnVsbCB8fCB0eXBlb2YgdGhhdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xuXG5cdHZhciBjb21wYXRpYmxlVHlwZXMgPSB0aGlzLmNvbXBhdGliaWxpdHkoKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb21wYXRpYmxlVHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAodGhhdCBpbnN0YW5jZW9mIGNvbXBhdGlibGVUeXBlc1tpXSkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuZnVuY3Rpb24gZW5zdXJlQ29tcGF0aWJpbGl0eShzZWxmLCBjb21wYXRpYmxlLCBhcmdzKSB7XG5cdHZhciBhcmc7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykgeyAgIC8vIGFyZ3MgaXMgbm90IGFuIEFycmF5LCBjYW4ndCB1c2UgZm9yRWFjaFxuXHRcdGFyZyA9IGFyZ3NbaV07XG5cdFx0aWYgKCFzZWxmLmlzQ29tcGF0aWJsZVdpdGgoYXJnKSkge1xuXHRcdFx0dmFyIHR5cGUgPSB0eXBlb2YgYXJnO1xuXHRcdFx0aWYgKGFyZyA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRcdFx0aWYgKHR5cGUgPT09IFwib2JqZWN0XCIpIHR5cGUgPSBvb3AuaW5zdGFuY2VOYW1lKGFyZyk7XG5cblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XCJBIGRlc2NyaXB0b3IgZG9lc24ndCBtYWtlIHNlbnNlLiAoXCIgKyBvb3AuaW5zdGFuY2VOYW1lKHNlbGYpICsgXCIgY2FuJ3QgY29tYmluZSB3aXRoIFwiICsgdHlwZSArIFwiKVwiXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxufVxuXG4iLCIvKiFcbiAqIGFzeW5jXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2FvbGFuL2FzeW5jXG4gKlxuICogQ29weXJpZ2h0IDIwMTAtMjAxNCBDYW9sYW4gTWNNYWhvblxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgYXN5bmMgPSB7fTtcbiAgICBmdW5jdGlvbiBub29wKCkge31cbiAgICBmdW5jdGlvbiBpZGVudGl0eSh2KSB7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b0Jvb2wodikge1xuICAgICAgICByZXR1cm4gISF2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBub3RJZCh2KSB7XG4gICAgICAgIHJldHVybiAhdjtcbiAgICB9XG5cbiAgICAvLyBnbG9iYWwgb24gdGhlIHNlcnZlciwgd2luZG93IGluIHRoZSBicm93c2VyXG4gICAgdmFyIHByZXZpb3VzX2FzeW5jO1xuXG4gICAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gICAgLy8gb24gdGhlIHNlcnZlciwgb3IgYHRoaXNgIGluIHNvbWUgdmlydHVhbCBtYWNoaW5lcy4gV2UgdXNlIGBzZWxmYFxuICAgIC8vIGluc3RlYWQgb2YgYHdpbmRvd2AgZm9yIGBXZWJXb3JrZXJgIHN1cHBvcnQuXG4gICAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcgJiYgc2VsZi5zZWxmID09PSBzZWxmICYmIHNlbGYgfHxcbiAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnICYmIGdsb2JhbC5nbG9iYWwgPT09IGdsb2JhbCAmJiBnbG9iYWwgfHxcbiAgICAgICAgICAgIHRoaXM7XG5cbiAgICBpZiAocm9vdCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZpb3VzX2FzeW5jID0gcm9vdC5hc3luYztcbiAgICB9XG5cbiAgICBhc3luYy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByb290LmFzeW5jID0gcHJldmlvdXNfYXN5bmM7XG4gICAgICAgIHJldHVybiBhc3luYztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25seV9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gY3Jvc3MtYnJvd3NlciBjb21wYXRpYmxpdHkgZnVuY3Rpb25zIC8vLy9cblxuICAgIHZhciBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gICAgdmFyIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBfdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICAvLyBQb3J0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzIGlzT2JqZWN0XG4gICAgdmFyIF9pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaXNBcnJheUxpa2UoYXJyKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheShhcnIpIHx8IChcbiAgICAgICAgICAgIC8vIGhhcyBhIHBvc2l0aXZlIGludGVnZXIgbGVuZ3RoIHByb3BlcnR5XG4gICAgICAgICAgICB0eXBlb2YgYXJyLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCA+PSAwICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoICUgMSA9PT0gMFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9lYWNoKGNvbGwsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheUxpa2UoY29sbCkgP1xuICAgICAgICAgICAgX2FycmF5RWFjaChjb2xsLCBpdGVyYXRvcikgOlxuICAgICAgICAgICAgX2ZvckVhY2hPZihjb2xsLCBpdGVyYXRvcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGk7IH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWR1Y2UoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBfYXJyYXlFYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mb3JFYWNoT2Yob2JqZWN0LCBpdGVyYXRvcikge1xuICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnIsIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICB2YXIgX2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfa2V5SXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICB2YXIga2V5cztcbiAgICAgICAgaWYgKF9pc0FycmF5TGlrZShjb2xsKSkge1xuICAgICAgICAgICAgbGVuID0gY29sbC5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gX2tleXMoY29sbCk7XG4gICAgICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgdG8gRVM2J3MgcmVzdCBwYXJhbSAoaHR0cDovL2FyaXlhLm9maWxhYnMuY29tLzIwMTMvMDMvZXM2LWFuZC1yZXN0LXBhcmFtZXRlci5odG1sKVxuICAgIC8vIFRoaXMgYWNjdW11bGF0ZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgaW50byBhbiBhcnJheSwgYWZ0ZXIgYSBnaXZlbiBpbmRleC5cbiAgICAvLyBGcm9tIHVuZGVyc2NvcmUuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzIxNDApLlxuICAgIGZ1bmN0aW9uIF9yZXN0UGFyYW0oZnVuYywgc3RhcnRJbmRleCkge1xuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbihmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBfZGVsYXk7XG4gICAgfVxuICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IF9zZXRJbW1lZGlhdGUgPyBfZGVsYXkgOiBhc3luYy5uZXh0VGljaztcblxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG4gICAgICAgIHZhciBzaXplID0gX2lzQXJyYXlMaWtlKG9iamVjdCkgPyBvYmplY3QubGVuZ3RoIDogX2tleXMob2JqZWN0KS5sZW5ndGg7XG4gICAgICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBfZWFjaChvYmplY3QsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMgPVxuICAgIGFzeW5jLmVhY2hPZlNlcmllcyA9IGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGUoKSB7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGl0ZXJhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVyYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaXRlcmF0ZSgpO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMuZm9yRWFjaE9mTGltaXQgPVxuICAgIGFzeW5jLmVhY2hPZkxpbWl0ID0gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZWFjaE9mTGltaXQobGltaXQpKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2VhY2hPZkxpbWl0KGxpbWl0KSB7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0gX2tleUl0ZXJhdG9yKG9iaik7XG4gICAgICAgICAgICBpZiAobGltaXQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgcnVubmluZyA9IDA7XG4gICAgICAgICAgICB2YXIgZXJyb3JlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24gcmVwbGVuaXNoICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSAmJiBydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdoaWxlIChydW5uaW5nIDwgbGltaXQgJiYgIWVycm9yZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcnVubmluZyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsZW5pc2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2YsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbExpbWl0KGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oX2VhY2hPZkxpbWl0KGxpbWl0KSwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1Nlcmllcyhmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mU2VyaWVzLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FzeW5jTWFwKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMubWFwID0gZG9QYXJhbGxlbChfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcFNlcmllcyA9IGRvU2VyaWVzKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2FzeW5jTWFwKTtcblxuICAgIC8vIHJlZHVjZSBvbmx5IGhhcyBhIHNlcmllcyB2ZXJzaW9uLCBhcyBkb2luZyByZWR1Y2UgaW4gcGFyYWxsZWwgd29uJ3RcbiAgICAvLyB3b3JrIGluIG1hbnkgc2l0dWF0aW9ucy5cbiAgICBhc3luYy5pbmplY3QgPVxuICAgIGFzeW5jLmZvbGRsID1cbiAgICBhc3luYy5yZWR1Y2UgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgZnVuY3Rpb24gKHgsIGksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihtZW1vLCB4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgbWVtbyA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIgfHwgbnVsbCwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5mb2xkciA9XG4gICAgYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGlkZW50aXR5KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtpbmRleDogaW5kZXgsIHZhbHVlOiB4fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soX21hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgICAgICB9KSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuc2VsZWN0ID1cbiAgICBhc3luYy5maWx0ZXIgPSBkb1BhcmFsbGVsKF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0TGltaXQgPVxuICAgIGFzeW5jLmZpbHRlckxpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0U2VyaWVzID1cbiAgICBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcblxuICAgIGZ1bmN0aW9uIF9yZWplY3QoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZmlsdGVyKGVhY2hmbiwgYXJyLCBmdW5jdGlvbih2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgY2IoIXYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgYXN5bmMucmVqZWN0ID0gZG9QYXJhbGxlbChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RTZXJpZXMgPSBkb1NlcmllcyhfcmVqZWN0KTtcblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVUZXN0ZXIoZWFjaGZuLCBjaGVjaywgZ2V0UmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNiKSBjYihnZXRSZXN1bHQoZmFsc2UsIHZvaWQgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2IgJiYgY2hlY2sodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGxpbWl0LCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3I7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBsaW1pdDtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMuYW55ID1cbiAgICBhc3luYy5zb21lID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuc29tZUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5hbGwgPVxuICAgIGFzeW5jLmV2ZXJ5ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIG5vdElkLCBub3RJZCk7XG5cbiAgICBhc3luYy5ldmVyeUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgbm90SWQsIG5vdElkKTtcblxuICAgIGZ1bmN0aW9uIF9maW5kR2V0UmVzdWx0KHYsIHgpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIGFzeW5jLmRldGVjdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mU2VyaWVzLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdExpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIGFzeW5jLnNvcnRCeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5tYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge3ZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoY29tcGFyYXRvciksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBjb21wYXJhdG9yKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWEsIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIga2V5cyA9IF9rZXlzKHRhc2tzKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZ1Rhc2tzID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG5cbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnVuc2hpZnQoZm4pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gX2luZGV4T2YobGlzdGVuZXJzLCBmbik7XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIGxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0YXNrQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgX2FycmF5RWFjaChsaXN0ZW5lcnMuc2xpY2UoMCksIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2FycmF5RWFjaChrZXlzLCBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBfaXNBcnJheSh0YXNrc1trXSkgPyB0YXNrc1trXTogW3Rhc2tzW2tdXTtcbiAgICAgICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfZm9yRWFjaE9mKHJlc3VsdHMsIGZ1bmN0aW9uKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSh0YXNrQ29tcGxldGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVzID0gdGFzay5zbGljZSgwLCB0YXNrLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgLy8gcHJldmVudCBkZWFkLWxvY2tzXG4gICAgICAgICAgICB2YXIgbGVuID0gcmVxdWlyZXMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRlcDtcbiAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICAgIGlmICghKGRlcCA9IHRhc2tzW3JlcXVpcmVzW2xlbl1dKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBpbmV4aXN0YW50IGRlcGVuZGVuY3knKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9pc0FycmF5KGRlcCkgJiYgX2luZGV4T2YoZGVwLCBrKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGN5Y2xpYyBkZXBlbmRlbmNpZXMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiByZWFkeSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlZHVjZShyZXF1aXJlcywgZnVuY3Rpb24gKGEsIHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhICYmIHJlc3VsdHMuaGFzT3duUHJvcGVydHkoeCkpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpICYmICFyZXN1bHRzLmhhc093blByb3BlcnR5KGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLnJldHJ5ID0gZnVuY3Rpb24odGltZXMsIHRhc2ssIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBERUZBVUxUX1RJTUVTID0gNTtcbiAgICAgICAgdmFyIERFRkFVTFRfSU5URVJWQUwgPSAwO1xuXG4gICAgICAgIHZhciBhdHRlbXB0cyA9IFtdO1xuXG4gICAgICAgIHZhciBvcHRzID0ge1xuICAgICAgICAgICAgdGltZXM6IERFRkFVTFRfVElNRVMsXG4gICAgICAgICAgICBpbnRlcnZhbDogREVGQVVMVF9JTlRFUlZBTFxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhcnNlVGltZXMoYWNjLCB0KXtcbiAgICAgICAgICAgIGlmKHR5cGVvZiB0ID09PSAnbnVtYmVyJyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodCwgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHQgPT09ICdvYmplY3QnKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LnRpbWVzLCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgICAgICBhY2MuaW50ZXJ2YWwgPSBwYXJzZUludCh0LmludGVydmFsLCAxMCkgfHwgREVGQVVMVF9JTlRFUlZBTDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBhcmd1bWVudCB0eXBlIGZvciBcXCd0aW1lc1xcJzogJyArIHR5cGVvZiB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuZ3RoIDwgMSB8fCBsZW5ndGggPiAzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnRzIC0gbXVzdCBiZSBlaXRoZXIgKHRhc2spLCAodGFzaywgY2FsbGJhY2spLCAodGltZXMsIHRhc2spIG9yICh0aW1lcywgdGFzaywgY2FsbGJhY2spJyk7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoIDw9IDIgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHRhc2s7XG4gICAgICAgICAgICB0YXNrID0gdGltZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcGFyc2VUaW1lcyhvcHRzLCB0aW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgb3B0cy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBvcHRzLnRhc2sgPSB0YXNrO1xuXG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZWRUYXNrKHdyYXBwZWRDYWxsYmFjaywgd3JhcHBlZFJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5QXR0ZW1wdCh0YXNrLCBmaW5hbEF0dGVtcHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzayhmdW5jdGlvbihlcnIsIHJlc3VsdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayghZXJyIHx8IGZpbmFsQXR0ZW1wdCwge2VycjogZXJyLCByZXN1bHQ6IHJlc3VsdH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCB3cmFwcGVkUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlJbnRlcnZhbChpbnRlcnZhbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aGlsZSAob3B0cy50aW1lcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpbmFsQXR0ZW1wdCA9ICEob3B0cy50aW1lcy09MSk7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUF0dGVtcHQob3B0cy50YXNrLCBmaW5hbEF0dGVtcHQpKTtcbiAgICAgICAgICAgICAgICBpZighZmluYWxBdHRlbXB0ICYmIG9wdHMuaW50ZXJ2YWwgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUludGVydmFsKG9wdHMuaW50ZXJ2YWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnNlcmllcyhhdHRlbXB0cywgZnVuY3Rpb24oZG9uZSwgZGF0YSl7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGFbZGF0YS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAod3JhcHBlZENhbGxiYWNrIHx8IG9wdHMuY2FsbGJhY2spKGRhdGEuZXJyLCBkYXRhLnJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGEgY2FsbGJhY2sgaXMgcGFzc2VkLCBydW4gdGhpcyBhcyBhIGNvbnRyb2xsIGZsb3dcbiAgICAgICAgcmV0dXJuIG9wdHMuY2FsbGJhY2sgPyB3cmFwcGVkVGFzaygpIDogd3JhcHBlZFRhc2s7XG4gICAgfTtcblxuICAgIGFzeW5jLndhdGVyZmFsbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgaWYgKCFfaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IHRvIHdhdGVyZmFsbCBtdXN0IGJlIGFuIGFycmF5IG9mIGZ1bmN0aW9ucycpO1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHdyYXBJdGVyYXRvcihpdGVyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW2Vycl0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKHdyYXBJdGVyYXRvcihuZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuc3VyZUFzeW5jKGl0ZXJhdG9yKS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB3cmFwSXRlcmF0b3IoYXN5bmMuaXRlcmF0b3IodGFza3MpKSgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcGFyYWxsZWwoZWFjaGZuLCB0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IF9pc0FycmF5TGlrZSh0YXNrcykgPyBbXSA6IHt9O1xuXG4gICAgICAgIGVhY2hmbih0YXNrcywgZnVuY3Rpb24gKHRhc2ssIGtleSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhc2soX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMucGFyYWxsZWwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2YsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnBhcmFsbGVsTGltaXQgPSBmdW5jdGlvbih0YXNrcywgbGltaXQsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChfZWFjaE9mTGltaXQobGltaXQpLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXJpZXMgPSBmdW5jdGlvbih0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZlNlcmllcywgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuaXRlcmF0b3IgPSBmdW5jdGlvbiAodGFza3MpIHtcbiAgICAgICAgZnVuY3Rpb24gbWFrZUNhbGxiYWNrKGluZGV4KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzW2luZGV4XS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZm4ubmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4ubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGluZGV4IDwgdGFza3MubGVuZ3RoIC0gMSkgPyBtYWtlQ2FsbGJhY2soaW5kZXggKyAxKTogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gZm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1ha2VDYWxsYmFjaygwKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuYXBwbHkgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoY2FsbEFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseShcbiAgICAgICAgICAgICAgICBudWxsLCBhcmdzLmNvbmNhdChjYWxsQXJncylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gX2NvbmNhdChlYWNoZm4sIGFyciwgZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYikge1xuICAgICAgICAgICAgZm4oeCwgZnVuY3Rpb24gKGVyciwgeSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoeSB8fCBbXSk7XG4gICAgICAgICAgICAgICAgY2IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5jb25jYXQgPSBkb1BhcmFsbGVsKF9jb25jYXQpO1xuICAgIGFzeW5jLmNvbmNhdFNlcmllcyA9IGRvU2VyaWVzKF9jb25jYXQpO1xuXG4gICAgYXN5bmMud2hpbHN0ID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIGlmICh0ZXN0KCkpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5kb1doaWxzdCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiArK2NhbGxzIDw9IDEgfHwgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy51bnRpbCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kb1VudGlsID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZG9XaGlsc3QoaXRlcmF0b3IsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZHVyaW5nID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG5cbiAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjaGVjayk7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNoZWNrID0gZnVuY3Rpb24oZXJyLCB0cnV0aCkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRydXRoKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRlc3QoY2hlY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kb0R1cmluZyA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgYXN5bmMuZHVyaW5nKGZ1bmN0aW9uKG5leHQpIHtcbiAgICAgICAgICAgIGlmIChjYWxscysrIDwgMSkge1xuICAgICAgICAgICAgICAgIG5leHQobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3F1ZXVlKHdvcmtlciwgY29uY3VycmVuY3ksIHBheWxvYWQpIHtcbiAgICAgICAgaWYgKGNvbmN1cnJlbmN5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5ID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGNvbmN1cnJlbmN5ID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmN1cnJlbmN5IG11c3Qgbm90IGJlIHplcm8nKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHBvcywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCAmJiBxLmlkbGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayB8fCBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9uZXh0KHEsIHRhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3b3JrZXJzIC09IDE7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgX2FycmF5RWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdvcmtlcnMgPSAwO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghcS5wYXVzZWQgJiYgd29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUod29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tzID0gcS5wYXlsb2FkID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnBheWxvYWQpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyKGRhdGEsIGNiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcTtcbiAgICB9XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHZhciBxID0gX3F1ZXVlKGZ1bmN0aW9uIChpdGVtcywgY2IpIHtcbiAgICAgICAgICAgIHdvcmtlcihpdGVtc1swXSwgY2IpO1xuICAgICAgICB9LCBjb25jdXJyZW5jeSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLnByaW9yaXR5UXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKChlbmQgLSBiZWcgKyAxKSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZShfYmluYXJ5U2VhcmNoKHEudGFza3MsIGl0ZW0sIF9jb21wYXJlVGFza3MpICsgMSwgMCwgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcblxuICAgICAgICAvLyBPdmVycmlkZSBwdXNoIHRvIGFjY2VwdCBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyBwcmlvcml0eVxuICAgICAgICBxLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHVuc2hpZnQgZnVuY3Rpb25cbiAgICAgICAgZGVsZXRlIHEudW5zaGlmdDtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY2FyZ28gPSBmdW5jdGlvbiAod29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICAgIHJldHVybiBfcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbnNvbGVfZm4obmFtZSkge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgaWRlbnRpdHk7XG4gICAgICAgIHZhciBtZW1vaXplZCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gbWVtb2l6ZWQoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoa2V5IGluIG1lbW8pIHtcbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5IGluIHF1ZXVlcykge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH07XG5cbiAgICBhc3luYy51bm1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZm4udW5tZW1vaXplZCB8fCBmbikuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3RpbWVzKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvdW50LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIG1hcHBlcihfcmFuZ2UoY291bnQpLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLnRpbWVzID0gX3RpbWVzKGFzeW5jLm1hcCk7XG4gICAgYXN5bmMudGltZXNTZXJpZXMgPSBfdGltZXMoYXN5bmMubWFwU2VyaWVzKTtcbiAgICBhc3luYy50aW1lc0xpbWl0ID0gZnVuY3Rpb24gKGNvdW50LCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5tYXBMaW1pdChfcmFuZ2UoY291bnQpLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VxID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBuZXh0YXJncykge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhhdCwgW2Vycl0uY29uY2F0KHJlc3VsdHMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLnNlcS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIF9hcHBseUVhY2goZWFjaGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uKGZucywgYXJncykge1xuICAgICAgICAgICAgdmFyIGdvID0gX3Jlc3RQYXJhbShmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVhY2hmbihmbnMsIGZ1bmN0aW9uIChmbiwgXywgY2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncy5jb25jYXQoW2NiXSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ28uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ287XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmFwcGx5RWFjaCA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mKTtcbiAgICBhc3luYy5hcHBseUVhY2hTZXJpZXMgPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZlNlcmllcyk7XG5cblxuICAgIGFzeW5jLmZvcmV2ZXIgPSBmdW5jdGlvbiAoZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkb25lID0gb25seV9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgdGFzayA9IGVuc3VyZUFzeW5jKGZuKTtcbiAgICAgICAgZnVuY3Rpb24gbmV4dChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFzayhuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGVuc3VyZUFzeW5jKGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJBcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG5cbiAgICBhc3luYy5jb25zdGFudCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICAgIHZhciBhcmdzID0gW251bGxdLmNvbmNhdCh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhc3luYy53cmFwU3luYyA9XG4gICAgYXN5bmMuYXN5bmNpZnkgPSBmdW5jdGlvbiBhc3luY2lmeShmdW5jKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiByZXN1bHQgaXMgUHJvbWlzZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChfaXNPYmplY3QocmVzdWx0KSAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIubWVzc2FnZSA/IGVyciA6IG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIE5vZGUuanNcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBhc3luYztcbiAgICB9XG4gICAgLy8gQU1EIC8gUmVxdWlyZUpTXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuICAgIGVsc2Uge1xuICAgICAgICByb290LmFzeW5jID0gYXN5bmM7XG4gICAgfVxuXG59KCkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmIChzdHIubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdHJldHVybiBzdHJcblx0LnJlcGxhY2UoL15bXy5cXC0gXSsvLCAnJylcblx0LnRvTG93ZXJDYXNlKClcblx0LnJlcGxhY2UoL1tfLlxcLSBdKyhcXHd8JCkvZywgZnVuY3Rpb24gKG0sIHAxKSB7XG5cdFx0cmV0dXJuIHAxLnRvVXBwZXJDYXNlKCk7XG5cdH0pO1xufTtcbiJdfQ==
