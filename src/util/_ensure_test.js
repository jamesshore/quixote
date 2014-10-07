// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

var assert = require("./assert.js");
var ensure = require("./ensure.js");
var EnsureException = ensure.EnsureException;

describe("Ensure", function() {

	it("uses custom exception", function() {
		try {
			throw new EnsureException(function() {}, "foo");
		}
		catch(e) {
			assert.equal(e.name, "EnsureException");
			assert.equal(e.constructor, EnsureException);
			assert.equal("" + e, "EnsureException: foo");
		}
	});

	describe("condition checking", function() {

		it("checks if condition is true", function() {
			var that = wrap(ensure.that);

			assert.noException(that(true));
			assert.exception(that(false), /Expected condition to be true/);
			assert.exception(that(false, "a message"), /a message/);
			assert.exception(that("foo"), /Expected condition to be true or false/);
			assert.exception(that("foo", "ignored"), /Expected condition to be true or false/);
		});

		it("fails when unreachable code is executed", function() {
			var unreachable = wrap(ensure.unreachable);

			assert.exception(unreachable(), /Unreachable code executed/);
			assert.exception(unreachable("foo"), /foo/);
		});

	});

	describe("signature checking", function() {

		var signature = wrap(ensure.signature);

		it.only("checks no arguments", function() {
			assert.noException(signature([]), "valid");
			assert.exception(signature([ "foo" ]), /Function called with too many arguments: expected 0 but got 1/, "invalid");
		});

		it("checks one argument", function() {
			assert.noException(signature([ "foo" ], [ String ]), "valid");
			assert.exception(
				signature([ "foo", "bar" ], [ String ]),
				/Function called with too many arguments: expected 1 but got 2/,
				"# of arguments"
			);
			assert.exception(signature([ 42 ], [ String ]), /Argument 0 expected string, but was number/, "invalid");
		});

		it("checks multiple arguments", function() {
			assert.noException(signature([ "foo", "bar", "baz" ], [ String, String, String ]), "valid");
			assert.exception(
				signature([ "foo", "bar", "baz" ], [ String, String]),
				/Function called with too many arguments: expected 2 but got 3/,
				"# of arguments"
			);
			assert.exception(
				signature( [ "foo", 42, 36 ], [ String, String, String ]),
				/Argument 1 expected string, but was number/,
				"fails on first wrong parameter"
			);
		});

		it("supports built-in types", function() {
			assert.noException(signature([ false ], [ Boolean ]));
			assert.exception(signature([ false ], [ String ]));

			assert.noException(signature([ "1" ], [ String ]));
			assert.exception(signature([ "1" ], [ Number ]));

			assert.noException(signature([ 1 ], [ Number ]));
			assert.exception(signature([ 1 ], [ Function ]));

			assert.noException(signature([ function() {} ], [ Function ]));
			assert.exception(signature([ function() {} ], [ Object ]));

			assert.noException(signature([ {} ], [ Object ]));
			assert.exception(signature([ {} ], [ Array ]));

			assert.noException(signature([ [] ], [ Array ]));
			assert.exception(signature([ [] ], [ RegExp ]));

			assert.noException(signature([ /foo/ ], [ RegExp ]));
			assert.exception(signature([ /foo/ ], [ Boolean ]));
		});

		it("supports weird types (primarily for allowing nullable objects, etc.)", function() {
			assert.noException(signature([ undefined ], [ undefined ]));
			assert.exception(signature([ undefined ], [ null ]), /Argument 0 expected null, but was undefined/);

			assert.noException(signature([ null ], [ null ]));
			assert.exception(signature([ null ], [ NaN ]), /Argument 0 expected NaN, but was null/);

			assert.noException(signature([ NaN ], [ NaN ]));
			assert.noException(signature([ NaN ], [ undefined ]), /Argument 0 expected undefined, but was NaN/);
		});

		it("supports custom types", function() {
			function MyClass() {}
			var NoName = function() {};

			assert.noException(signature([ new MyClass() ], [ MyClass ]), "valid MyClass");
			assert.noException(signature([ new NoName() ], [ NoName ]), "valid anon class");
			assert.exception(
				signature([ {} ], [ MyClass ]),
				/Argument 0 expected MyClass instance, but was Object instance/,
				"invalid MyClass"
			);
			assert.exception(
				signature([ {} ], [ NoName ]),
				/Argument 0 expected <anon> instance, but was Object instance/,
				"invalid anon class"
			);
			assert.exception(
				signature([ new NoName() ], [ MyClass ]),
				/Argument 0 expected MyClass instance, but was <anon> instance/,
				"invalid anon instance"
			);
		});

		it("supports multiple types", function() {
			assert.noException(signature([ 1 ], [[ String, Number ]]), "valid");
			assert.exception(
				signature([ 1 ], [ [ String, Boolean, function MyClass() {} ] ]),
				/Argument 0 expected string, boolean, or MyClass instance, but was number/,
				"invalid"
			);
		});

		it("allows optional arguments", function() {
			assert.noException(signature([ 1 ], [ Number, [ undefined, String ] ]), "optional parameter");
			assert.exception(
				signature([], [ Number ]),
				/Argument 0 expected number, but was undefined/,
				"required parameter"
			);
		});

	});

	describe("type checking", function() {

		it("checks if variable is defined", function() {
			var defined = wrap(ensure.defined);

			assert.noException(defined("foo"));
			assert.noException(defined(null));
			assert.exception(defined(undefined), /variable was not defined/);
			assert.exception(defined(undefined, "myVariable"), /myVariable was not defined/);
		});

		it("checks if variable is number, string, or array", function() {
			var number = wrap(ensure.number);
			var string = wrap(ensure.string);
			var array = wrap(ensure.array);
			var fn = wrap(ensure.fn);

			assert.noException(number(0));
			assert.exception(number("foo"), /variable expected number, but was string/);
			assert.exception(number({}), /variable expected number, but was object/);
			assert.exception(number([]), /variable expected number, but was array/);
			assert.exception(number(undefined), /variable expected number, but was undefined/);
			assert.exception(number(null), /variable expected number, but was null/);
			assert.exception(number(NaN), /variable expected number, but was NaN/);

			assert.exception(number("foo", "name"), /name expected number, but was string/);

			assert.exception(string(null, "name"), /name expected string, but was null/);
			assert.exception(array(null, "name"), /name expected array, but was null/);
			assert.exception(fn(null, "name"), /name expected function, but was null/);
		});

		it("checks if variable is object of specific type", function() {
			function Example1() {}

			function Example2() {}

			function NoConstructor() {}

			delete NoConstructor.constructor;
			var Anon = function() {};
			var object = wrap(ensure.object);

			assert.noException(object(new Example1()));
			assert.noException(object(new Example1(), Example1));

			assert.exception(object(null, Example1), /variable expected object, but was null/);
			assert.exception(object(new Example1(), Example2), /Expected variable to be (Example2 instance|a specific type)(, but was Example1)?/);
			assert.exception(object(new Anon(), Example2), /Expected variable to be (Example2 instance|a specific type)/);
			assert.exception(object(new NoConstructor(), Example2), /Expected variable to be (Example2 instance|a specific type)/);
			assert.exception(object(new Example1(), Example2, "name"), /Expected name to be (Example2 instance|a specific type)/);

			if (Object.create) {    // don't run this test on IE 8
				assert.exception(object(Object.create(null), Example2), /Expected variable to be (Example2 instance|a specific type), but it has no prototype/);
			}
		});

	});

	function wrap(fn) {
		return function() {
			var outerArgs = arguments;
			return function() {
				fn.apply(this, outerArgs);
			};
		};
	}

});
