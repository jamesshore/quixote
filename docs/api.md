# Quixote API

For a Quixote overview, installation notes, and an example, see [the readme](../README.md).


## Table of Contents

There are three primary classes and modules:

* [`quixote`](quixote.md) is your entry point. It allows you to create an iframe for testing.
* [`Frame`](Frame.md) is how you manipulate the DOM inside your test frame.
* [`QElement`](QElement.md) allows you to make assertions and get information.

Your assertions (using `QElement.assert()` or `QElement.diff()`) will use properties or methods that return "Descriptors." Descriptors describe some aspect of an element and its CSS. They're documented here:

* [Descriptors](descriptors.md)


## Compatibility

Each section is marked with a *stability index* corresponding to [the Node.js stability indices](http://nodejs.org/api/documentation.html#documentation_stability_index). They have the following meaning:
 
```
Stability: 0 - Deprecated
This feature is known to be problematic, and changes are
planned.  Do not rely on it.  Use of the feature may cause warnings.  Backwards
compatibility should not be expected.

Stability: 1 - Experimental
This feature was introduced recently, and may change
or be removed in future versions.  Please try it out and provide feedback.
If it addresses a use-case that is important to you, tell the node core team.

Stability: 2 - Unstable
The API is in the process of settling, but has not yet had
sufficient real-world testing to be considered stable. Backwards-compatibility
will be maintained if reasonable.

Stability: 3 - Stable
The API has proven satisfactory, but cleanup in the underlying
code may cause minor changes.  Backwards-compatibility is guaranteed.

Stability: 4 - API Frozen
This API has been tested extensively in production and is
unlikely to ever have to change.

Stability: 5 - Locked
Unless serious bugs are found, this code will not ever
change.  Please do not suggest changes in this area; they will be refused.
```

Breaking changes to any property or method documented here will be described in the [change log](../CHANGELOG.md). All other properties and methods should be considered non-public and may change at any time.

Class names may change at any time. Don't construct classes manually or refer to them by name. Any object you need can be obtained from a property or method call.


## Overview

These are the methods you'll use most often:

* `quixote.createFrame(width, height, options, callback(err, frame))` creates the test frame. Call this once per test suite.

* `frame.remove()` removes the test frame. Call this once per test suite.

* `frame.reset()` resets the test frame. Call this before or after each test to reset to a known-good state. (This is faster than creating a new frame each time.)

* `element = frame.getElement(selector)` gets an element out of the frame. Call this for each element you want to test.
 
* `element.assert({ property, property, ... });` checks the styling of an element. Call this in each test.

* `element.getRawStyle(style)` looks up a specific CSS style. You can use it for anything `assert()` doesn't support yet.

The `assert()` function looks at the properties of your element and checks them against hardcoded values *or* other element's properties. For example, `element.assert({ top: 10 });` or `element.assert({ top: otherElement.bottom })`.
