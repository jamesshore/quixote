# How to Create a Value

Descriptors and Values are the two core architectural concepts in Quixote.

* **Descriptors** represent some aspect of your page, such as the width of an element. They have the ability to *compute* the value of that thing (the `value()` method) and the ability to *describe* that thing (the `toString()` method).
* **Values** contain calculated values.

This file describes how to create a value class.


## Implementation Checklist

Implement a value class by following these steps.

1. Create testbed.
2. Implement factory methods.
3. Extend `Value` base class.
4. Check for compatibility with other values: implement `compatibility()`.
5. Render differences: implement `diff()`.
6. Render to a string: implement `toString()`.

The following example implements the (as yet fictional) `Color` value. It represents the value of CSS color properties like `background-color`.

For a real value example, see any of the value classes in this directory. [`RenderState`](render_state.js) and [its tests](_render_state_test.js) are a good choice.


## Create testbed

Start out by creating your test.

```javascript
"use strict";    // always use strict mode

// Our custom test assertion library
var assert = require("../util/assert.js");

// The base class we'll be extending.
var Value = require("./value.js");

// Our class under test
var Color = require("./color.js");

// It's important to use the "VALUE" tag. Otherwise, the build won't run the test.
describe("VALUE: Color", function() {

  var RED = "#ff0000";
  var color = Color.create(RED);    // our test color

});
```


## Implement factory methods

We have a convention of using factory methods, not constructors, to instantiate all descriptors and values. The factory methods use a normal constructor under the covers, but other code is expected to use the factory.

Value objects' factory methods should provide sophisticated type conversions and parsing. For example, our Color object should be able to understand that "#000000", "rgb(0, 0, 0)", "rgba(0, 0, 0, 0)", and "black" all represent the same color. For the sake of this example, though, we'll keep it simple.


```javascript
"use strict";    // always use strict mode

// Our runtime assertion library. We mostly use it for runtime signature type checking.
var ensure = require("../util/ensure.js");

// The base class we'll be extending.
var Value = require("./value.js");

var Me = module.exports = function Color(value) {
  // Check that the constructor is called with the correct parameter types.
  ensure.signature(arguments, [ String ]);
  
  // store the value for later
  this._value = value;
};

Me.create = function(value) {
  // Our factory method. It just calls the constructor. More complicated value objects might do more.
  // We don't call 'ensure.signature()' here because the constructor already does that.
  return new Color(value);
};
```


## Extend `Value` base class

All values have to extend `Value` in order to work properly.

Our tests:

```javascript
it("is a value object", function() {
  assert.implements(color, Value);
});
```

Our production code:

```javascript
var Me = module.exports = function Color(value) {
  ⋮
};
Value.extend(Me);

⋮
// Temporary methods so the tests pass
Me.prototype.compatibility = function() {
};

Me.prototype.diff = Value.safe(function diff(expected) { 		// Value.safe() is explained below
});

Me.prototype.toString = function() {
};
```


## Check for compatibility with other values: `compatibility()`

The user can cause value objects to be compared against any other value object. Some comparisons, such as comparing colors with sizes, don't make sense. Quixote provides a nice error message when this happens.

The `Value.safe()` method is Quixote's mechanism for checking for valid comparisons. Every function that takes another value type should be wrapped in a `Value.safe()` call, like the `diff` method above.

In order for `Value.safe()` to work properly, you need to implement the `compatibility()` method. It should return an array containing constructors for all the value objects you support. Anything not in the list will automatically fail. You're responsible for doing the appropriate checking on anything that is in the list.

In many cases, you'll just return your own constructor and nothing else. That's what we'll do for our `Color` example. 

```javascript
Me.prototype.compatibility = function() {
  return [ Me ];
};
```


## Render differences: `diff()`

Remember, value objects are the mechanism Quixote uses to provide its assertion messages. The `diff()` method finishes the sentence, "the thing was..." For example, here's a typical assertion failure:

```
top edge of '.navbar' should be 13px higher.
  Expected: 50px (bottom edge of '#header')
  But was:  63px
```

In this example, the text "13px higher" was provided by a `diff()` method.
   
For our `Color` example, we could implement a fancy visual explanation, such as "darker" or "more red." But we'll just say "different" for simplicity.

The `diff()` method is also used to determine when two values are equal. If they're equal, the result of `diff()` should be an empty string. Returning an empty string causes the `equals()` method, which is inherited from `Value`, to return true.

```javascript
it("describes difference", function() {
  assert.equal(color.diff(Color.create(RED), "", "same");
  assert.equal(color.diff(Color.create("#000000"), "different than expected", "different");
});
```

```javascript
// Don't forget Value.safe()!
Me.prototype.diff = Value.safe(function diff(expected) {
  if (this._value === expected._value) return "";
  else return "different than expected";
});
```


## Render to a string: `toString()`

The `toString()` method provides a human-readable rendering of the value. It's used in the "Expected:" and "But was:" portions of the assertion message.

For our `Color` example, we could convert common colors to their natural-language equivalents, such as #ff0000 to "red" and #000000 to "black." Real Quixote value objects provide this level of conversion. It makes Quixote more useful. For the sake of this example, though, we'll keep it simple.

```javascript
it("converts to string", function() {
  assert.equal(color.toString(), "#ff0000");
});
```

```javascript
Me.prototype.toString = function() {
  return this._value;
};
```


## That's it!

Your value object is done.

For a complete descriptor example, see [`RenderState`](render_state.js) and [its tests](_render_state_test.js).
