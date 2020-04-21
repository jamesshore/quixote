# How to Create a Descriptor

Descriptors and Values are the two core architectural concepts in Quixote.
 
* **Descriptors** represent some aspect of your page, such as the width of an element. They have the ability to *compute* the value of that thing (the `value()` method) and the ability to *describe* that thing (the `toString()` method).
* **Values** contain calculated values.

This file describes how to create a descriptor class.


## Implementation Checklist

Implement a descriptor class by following these steps.

1. Create testbed.
2. Provide factory methods.
3. Extend `Descriptor` base class.
4. Compute values: `value()`.
5. Render to a string: `toString()`.
6. (Optional) Convert primitives: `convert()`.
7. Add assertions.
8. Expose properties.
9. (Optional) Add API.

The following example implements the (as yet fictional) `BackgroundColor` descriptor. It represents the background color of an element and corresponds to the `background-color` CSS property.

For a real descriptor example, see any of the descriptors in this directory. [`ElementEdge`](element_edge.js) and [its tests](_element_edge_test.js) are a good choice.


## Create testbed

Start out by creating a test file for your descriptor. As you follow the example, leave out the comments.

```javascript
"use strict";    // always use strict mode

// Our custom test assertion library
var assert = require("../util/assert.js");

// For speed, we reuse the same test frame, containing a reset stylesheet, across all our Quixote tests.
var reset = require("../__reset.js");

// The base class we'll be extending. In some cases, you'll extend a subclass of Descriptor, such as
// SizeDescriptor or PositionDescriptor. In that case, you'd require that class here instead.
var Descriptor = require("./descriptor.js");

// Our class under test
var BackgroundColor = require("./background_color.js");

// It's important to use the "DESCRIPTOR" tag. Otherwise, the build won't run the test.
describe("DESCRIPTOR: BackgroundColor", function() {

  // Normally, you'd need a beforeEach() function to reset the test frame. But our
  // __reset.js file implements that for us.

  it("runs tests", function() {
    // make sure the tests run (and fail)
    assert.fail("hi");
  });

});
```

Stub in the production code as well.

```javascript
"use strict";    // always use strict mode

// Our runtime assertion library. We mostly use it for runtime signature type checking.
var ensure = require("../util/ensure.js");

// The base class we'll be extending. If you're extending a subclass of Descriptor, such as
// SizeDescriptor or PositionDescriptor, require that instead.
var Descriptor = require("./descriptor.js");

// We'll implement the rest of the class later.
```


## Implement factory methods

We have a convention of using factory methods, not constructors, to instantiate all descriptors and values. The factory methods use a normal constructor under the covers, but other code is expected to use the factory.

Design the signature for your factory method, then implement a utility function in your test that calls the factory method. Your test's utility function will typically need to create an element for the descriptor to use.

In the case of our BackgroundColor example, the design of our factory method is simple: `BackgroundColor.create(element)`.

```javascript
⋮
var ELEMENT_NAME = "element";
var IRRELEVANT_COLOR = "#abcdef";
⋮
it("runs tests", function() {
  // Call the utility method. We're not making any assertions yet because this test is still temporary.
  color();
});

// We have a convention of putting our tests' utility functions at the bottom of the file.

function color(backgroundColor) {
  // Provide a default so we can leave out the parameter when we don't need it
  if (backgroundColor === undefined) backgroundColor = IRRELEVANT_COLOR;

  // Create a test element for our descriptor to use
  element = reset.frame.add(
    "<p id='element' style='background-color: " + backgroundColor + "'>element</p>",
    ELEMENT_NAME
  );

  // Create the descriptor and return it
  return BackgroundColor.create(element);
}
```

The test will fail because the factory method doesn't exist. Implement it and its constructor.

```javascript
⋮

// The constructor always comes first (after require statements). This is our convention for
// constructors. Be sure to include the function name. Even though it isn't technically required,
// we include it because it makes stack traces more readable.
var Me = module.exports = function BackgroundColor(element) {
  // We need to type-check our signature. To do that, we need the QElement constructor. Normally,
  // we'd require it at the top of the file, but in the case of QElement, that creates a circular
  // dependency. So we need to require QElement here.
  var QElement = require("./q_element.js");   // Break circular dependency

  // Check that the constructor was called correctly.
  ensure.signature(arguments, [ QElement ]);

  // Store the element for later
  this._element = element;
};

Me.create = function(element) {
  // Our factory method. It just calls the constructor. More complicated descriptors might do more.
  // We don't call 'ensure.signature()' here because the constructor already does that.
  return new Me(element);
};
```


## Extend `Descriptor` base class

All descriptors have to extend `Descriptor` or another base class (such as `SizeDescriptor`) in order to work properly.

Our tests:

```javascript
⋮
// Replace the temporary 'runs tests' test with this new test
it("is a descriptor", function() {
  // replace the 'runs tests' test with this one
  assert.implements(color(), Descriptor);
});
⋮
```

Our production code:

```javascript
var Me = module.exports = function BackgroundColor(element) {
  ⋮
};
// extend the base class. If you're extending another base class (such as `SizeDescriptor`), use that instead.
Descriptor.extend(Me);

⋮
// Temporary methods so the tests pass. We use `ensure.unreachable()` so we get a nice error message
// in case we forget to implement them later.
Me.prototype.value = function() {
  ensure.unreachable();
};

Me.prototype.toString = function() {
  ensure.unreachable();
};
```


## Compute value: `value()`

This is where the magic happens. Descriptors represent some part of a page. They can compute the value of that part of the page on demand. Those values are returned as Value object instances, not primitives.

In the case of our `BackgroundColor` descriptor, it represents the background color of an element. In the `value()` method, it will compute the color. We're assuming that the `Color` value object has already been implemented. (See the [Value class tutorial](../values/README.md) for that example.)

```javascript
var Color = require("../values/color.js");
⋮
var RED = "#ff0000";
⋮
it("resolves to value", function() {
  // The `objEqual` assertion calls `.equals`, like this: `color.value().equals(Color.create(COLOR))`
  // We're checking that the descriptor returns the correct Color value object.
  assert.objEqual(color(RED).value(), Color.create(RED));
});
```

We implement it by getting `background-color` from our element. Note that `value()` always returns a value object, never a primitive.
 
```javascript
Me.prototype.value = function() {
  // check parameters
  ensure.signature(arguments, []);
  
  // get the style
  var style = this._element.getRawStyle("background-color");
  
  // convert it to a value object and return
  return Color.create(style);
};
```


## Render to a string: `toString()`

Descriptors have the ability to describe, in human-readable terms, which part of the page they represent. This human-readable description will be used in assertions.

In the case of our `BackgroundColor` example, a good value for `toString()` might be something like "background color of 'element'".

```javascript
it("renders to string", function() {
  assert.equal(color().toString(), "background color of " + ELEMENT_NAME);
});
```

```javascript
Me.prototype.toString = function() {
  // check parameters
  ensure.signature(arguments, []);

  return "background color of " + this._element;
};
```


## Convert primitives: `convert()`

If the user tries to compare our descriptor to a primitive type, `convert()` will be called by the `Descriptor` base class. Any type we support should be converted to a value object here. The value object should do the parsing, so all this function needs to do is decide which factory method to invoke.

Any type that isn't supported should be ignored (resulting in `undefined` being returned). The base class turns `undefined` results into a nice error message.

If you use one of the pre-built descriptor base classes (such as `SizeDescriptor`), this method may already be implemented for you.

Our `BackgroundColor` example converts a string to a `Color` value, but ignores everything else:

```javascript
it("converts comparison arguments", function() {
  assert.objEqual(color().convert("#aabbcc", "string"), Color.create("#aabbcc"));
});
```

```javascript
Me.prototype.convert = function(arg, type) {
  // We don't check the signature on this method because it's strictly for internal use.

  if (type === "string") return Color.create(arg);
};
```


## Add assertions

The base `Descriptor` class provides support for the `.should.equal()` and `.should.notEqual()` assertions. To support it, we need to modify our constructor to call a factory method.

First, we document how our assertion works in a test. This also makes sure that our descriptor and value object work together as we expect. We only need to test one assertion, because if one inherited assertion works, they should all work.

```javascript
it("has assertions", function() {
  assert.exception(
    function() { color("#000000").should.equal("#ffffff"); },
    "background color of 'element' should be different.\n" +
    "  Expected: #ffffff\n" +
    "  But was:  #000000"
  );
});
```

Implementing the assertions is just a matter of calling an inherited method in our constructor.

```javascript
// This is the constructor we already wrote.
var Me = module.exports = function BackgroundColor(element) {
  var QElement = require("./q_element.js");   // Break circular dependency
  ensure.signature(arguments, [ QElement ]);

  // This is the only new line.
  this.should = this.createShould();

  this._element = element;
};
```

If you want to add custom assertions, you can add them after the `this.should` line. For example, `this.should.beDarkerThan = function() {...}`. Additional assertions should have additional tests.


## Expose with a property

For a descriptor to be accessible by users, it must be exposed with a property on `QElement` or another object.

For our `BackgroundColor` example, we'll add a `QElement.backgroundColor` property. The tests and code are simple because the heavy lifting is done in the descriptor.

In the QElement tests, we add a test to the "properties" `describe` block:

```javascript
describe("properties", function() {
  ⋮
  it("colors", function() {
    assert.equal(element.backgroundColor.diff(COLOR), "", "background color");
  });
```

And in the QElement constructor, we create the property:

```javascript
var Me = module.exports = function QElement(domElement, qframe, nickname) {
  ⋮
  this.backgroundColor = BackgroundColor.create(this);
```


## That's it!

Your descriptor is done.

Next, think about how you can add properties to this descriptor (just as with the last step above) that allow it to be more useful. You might provide a property that exposes an existing descriptor or create a new descriptor that modifies this one. For example, we might want to add a `darken()` method to `BackgroundColor` that returns a `RelativeColor` descriptor. If you extended a pre-built descriptor base class (such as `SizeDescriptor`), this has probably already been done for you.

For a complete descriptor example, see [`ElementSize`](element_size.js) and [its tests](_element_size_test.js).
