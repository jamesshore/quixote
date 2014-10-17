// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// WORKAROUND IE 8: no Object.create()
exports.objectDotCreate = function objectDotCreate(prototype) {
	if (Object.create) return Object.create(prototype);

	var Temp = function Temp() {};
	Temp.prototype = prototype;
	return new Temp();
};

// WORKAROUND IE 8, IE 9, IE 10, IE 11: no function.name
exports.functionDotName = function functionDotName(fn) {
	if (fn.name) return fn.name;

	// This workaround is based on code by Jason Bunting et al, http://stackoverflow.com/a/332429
	var funcNameRegex = /function\s+(.{1,})\s*\(/;
	var results = (funcNameRegex).exec((fn).toString());
	return (results && results.length > 1) ? results[1] : "<anon>";
};

// WORKAROUND IE 8: no Array.isArray
exports.arrayDotIsArray = function arrayDotIsArray(thing) {
	if (Array.isArray) return Array.isArray(thing);

	return Object.prototype.toString.call(thing) === '[object Array]';
};

// WORKAROUND IE 8: no Object.getPrototypeOf
exports.objectDotGetPrototypeOf = function objectDotGetPrototypeOf(obj) {
	if (Object.getPrototypeOf) return Object.getPrototypeOf(obj);

	var result = obj.constructor ? obj.constructor.prototype : null;
	return result || null;
};

// WORKAROUND IE8: No Object.keys
exports.objectDotKeys = function objectDotKeys(obj) {
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
};