# How to Create a Descriptor

Descriptors and Values are the two core architectural concepts in Quixote.
 
* **Descriptors** represent some *as yet uncalculated* aspect of CSS
* **Values** contain calculated values.

This directory is for descriptors.

A descriptor has the following key features, which should be implemented in this order.

* It has tests.
* It provides factory methods for construction.
* It resolves itself to a Value object: `value()`
* It converts primitives to Value objects that are comparable to itself: `convert(arg, type)`
* It renders itself as a string: `toString()`
* It extends the `Descriptor` base class.
* It is returned from QElement or another descriptor
* Optional: It provides properties or methods that return other descriptors.

The following explanations use the (as yet fictional) example of a `BackgroundColor` descriptor. It represents the `background-color` CSS property.


## Create tests

Start out by creating a testbed that contains an element including the style you're going to test.

For our `BackgroundColor` example, we create an element that has a background color.

```javascript
"use strict";

var assert = require("../util/assert.js");
var reset = require("../__reset.js");
var BackgroundColor = require("./background_color.js");
var Descriptor = require("./descriptor.js");

describe("BackgroundColor", function() {
  
  var COLOR = "#abcde0"       // our test element's background color
  
  var element;                // the test element
  var color;                  // the descriptor under test
  
  beforeEach(function() {
    // get the test frame (for speed, we reuse the same frame, containing a reset 
    // stylesheet, for all Quixote tests)
    var frame = reset.frame;
    
    // add our test element
    element = frame.add(
      "<p id='element' style='background-color: " + COLOR + "'>element</p>",
      "element"
    );
    
    // create the test descriptor
    color = BackgroundColor.create(element);
  });
  
});
```


## Implement factory methods

We have a convention of using factory methods, not constructors, to instantiate all descriptors and values. The factory methods use a normal constructor under the covers, but other code is expected to use the factory.
 
```javascript
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");

var Me = module.exports = function BackgroundColor(element) {
  // Normally we would do this require at the top of the file, but we need to break a circular
  // dependency with QElement. 
  var QElement = require("./q_element.js");
  // Check that the constructor is called with the correct parameter types.
  ensure.signature(arguments, [ QElement ]);
  
  // store the element for later
  this._element = element;
};

Me.create = function create(element) {
  // Our factory method. It just calls the constructor. More complicated descriptors might do more.
  // We don't call 'ensure.signature()' here because the constructor already does that.
  return new BackgroundColor(element);
};
```


## Calculate value: `value()`

A descriptor is a *description* of a CSS property. They don't store the value of the property, but they know how to calculate it on demand.

For our `BackgroundColor` example, we start by testing that our descriptor gives us the actual background-color of our test element. We're assuming that we have an (also fictional) `Color` value object, and that we've required it at some point.

```javascript
it("resolves to value", function() {
  assert.objEqual(color.value(), Color.create(COLOR));
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

Remember, a descriptor is a *description* of a CSS property, not the value of the property. When we render it to a string, we want to *describe* the property. This human-readable description will be used when describing differences.

In the case of our `BackgroundColor` example, a good value for `toString()` might be something like "background color of 'element'".

```javascript
it("renders to string", function() {
  assert.equal(color.toString(), "background color of " + element);
});
```

```javascript
Me.prototype.toString = function toString() {
  // check parameters
  ensure.signature(arguments, []);

  return "background color of " + this._element;
};
```


## Convert primitives: `convert()`

If the user tries to compare our descriptor to a primitive type, `convert()` will be called by the `Descriptor` base class. Any type we support should be converted to a value object here. The value object should do the parsing, so all this function needs to do is decide which factory method to invoke.

Any type that isn't supported should be ignored (resulting in `undefined` being returned). The base class turns `undefined` results into a nice error message.

Our `BackgroundColor` example converts a string to a `Color` value, but ignores everything else:

```javascript
it("converts comparison arguments", function() {
  assert.objEqual(color.convert("#aabbcc", "string"), Color.create("#aabbcc"));
});
```

```javascript
Me.prototype.convert = function convert(arg, type) {
  if (type === "string") return Color.create(arg);
};
```


## Extend `Descriptor` base class

All descriptors have to extend `Descriptor` in order to work properly. We do this last because the tests will fail if the other methods aren't implemented.

Our tests and code:

```javascript
it("is a descriptor", function() {
  assert.implements(color, Descriptor);
});
```

```javascript
var Me = module.exports = function BackgroundColor(element) {
  ⋮
};
Descriptor.extend(Me);
```


## Expose with a property

For a descriptor to be accessible by users, it must be returned from a property on `QElement` or another descriptor.

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

Next, think about how you can add properties to this descriptor (just as with the last step above) that allow it to be more useful. You might provide a property that exposes an existing descriptor or create a new descriptor that modifies this one. For example, we might want to add a `darken()` method to `BackgroundColor` that returns a `RelativeColor` descriptor.

For a complete descriptor example, see [`ElementCenter`](element_center.js) and [its tests](_element_center.js). 
