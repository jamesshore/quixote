# Quixote API

For an overview, installation notes, and an example, see [the readme](../README.md).


## Table of Contents

There are three primary classes and modules:

* [`quixote`](quixote.md) is your entry point. It allows you to create the Quixote test frame.
* [`QFrame`](QFrame.md) is how you manipulate the DOM inside your test frame.
* [`QElement`](QElement.md) wraps individual DOM elements. It allows you to make assertions and get styling information.

In your tests, you will make assertions on elements using two methods:

* [`QElement.assert()`](QElement.md#elementassert) is a powerful tool for comparing elements. This is the preferred assertion technique, but it doesn't yet support all style properties.
* [`QElement.getRawStyle()`](QElement.md#elementgetrawstyle) allows you to retrieve style information and use it with another assertion library. This is meant to be used when `QElement.assert()` doesn't support the styles you want to test.

`QElement.assert()` takes an object containing "descriptors," which are documented here:

* [Descriptors](descriptors.md) describes how descriptors work and lists all the descriptors available for you to use.
* [`PositionDescriptor`](PositionDescriptor.md) descriptors have a common API related to positioning.
* [`SizeDescriptor`](SizeDescriptor.md) descriptors have a common API related to sizes.

There's also one supporting class:

* [`QElementList`](QElementList.md) contains a list of QElements.


## Stability

Each section is marked with a *stability index* corresponding to [the Node.js stability indices](http://nodejs.org/api/documentation.html#documentation_stability_index). They have the following meaning:
 
```
Stability: 0 - Deprecated
This feature is known to be problematic, and changes are
planned.  Do not rely on it.  Use of the feature may cause warnings.  Backwards
compatibility should not be expected.

Stability: 1 - Experimental
This feature was introduced recently, and may change
or be removed in future versions.  Please try it out and provide feedback.
If it addresses a use-case that is important to you, tell the core team.

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

Breaking changes to any property or method in the API documentation will be described in the [change log](../CHANGELOG.md). All other properties and methods should be considered non-public and may change at any time.

Class names may change at any time. Don't construct classes manually or refer to them by name. Any object you need can be obtained from a property or method call.
