# Quixote API

For a Quixote overview, installation notes, and an example, see [the readme](../README.md).


## Compatibility

**The API will change!** This is an early version. Don't use this code if you don't want to be on the bleeding edge.

Class names may change at any time. Don't construct classes manually or refer to them by name. Any object you need can be obtained from a property or method call.

Breaking changes to any property or method documented here will be mentioned in the [change log](CHANGELOG.md). All other properties and methods should be considered non-public and subject to change at any time.


## Table of Contents

There are three primary classes and modules:

* [`quixote`](quixote.md) is your entry point. It allows you to create a iframe for testing.
* [`Frame`](Frame.md) is how you manipulate the DOM inside your test frame.
* [`QElement`](QElement.md) allows you to make assertions and get information.

Your assertions (using `QElement.assert()` or `QElement.diff()`) will use properties or methods that return "Descriptors." Descriptors describe some aspect of an element and its CSS. They're documented here:

* [Descriptors](descriptors.md)


## Overview

These are the methods you'll use most often:

* `quixote.createFrame(width, height, options, callback(err, frame))` creates the test frame. Call this once per test suite.

* `frame.remove()` removes the test frame. Call this once per test suite.

* `frame.reset()` resets the test frame. Call this before or after each test to reset to a known-good state. (This is faster than creating a new frame each time.)

* `element = frame.getElement(selector)` gets an element out of the frame. Call this for each element you want to test.
 
* `element.assert({ property, property, ... });` checks the styling of an element. Call this in each test.

* `element.getRawStyle(style)` looks up a specific CSS style. You can use it for anything `assert()` doesn't support yet.

The `assert()` function looks at the properties of your element and checks them against hardcoded values *or* other element's properties. For example, `element.assert({ top: 10 });` or `element.assert({ top: otherElement.bottom })`.
