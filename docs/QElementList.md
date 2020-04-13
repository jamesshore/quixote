# Quixote API: `QElementList`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QElementList` instances contain a list of [`QElement`](QElement.md) objects. It's provided by [`QFrame.getAll()`.](QFrame.md#framegetall)


## Methods

### list.length()

```
Stability: 3 - Stable
```

Determine the number of elements in the list.

`length = list.length()`

* `length (number)` The number of elements in the list.


### list.at()

```
Stability: 3 - Stable
```

Retrieve an element from the list. Positive and negative indices are allowed (see below). Throws an exception if the index is out of bounds.

`element = list.at(index, nickname)`

* `element (`[`QElement`](QElement.md)`)` The element retrieved.

* `index (number)` Zero-based index of the element to retrieve. If the index is negative, it counts from the end of the list.

* `nickname (optional string)` The name to use when describing `element` in error messages. Uses the list's nickname with a subscript (e.g., `myList[0]`) by default.

Example: Retrieve the last element: `var element = list.index(-1);`
