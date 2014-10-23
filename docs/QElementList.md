# Quixote API: `QElementList`

`QElementList` instances contain a list of [`QElement`](QElement.md) instances. It's provided by [`QFrame.getAll()`.](QFrame.md)

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


#### list.length()

```
Stability: 1 - Experimental
```

Determine the number of elements in the list.

`length = list.length()`

* `length (number)` The number of elements in the list.


#### list.at()

```
Stability: 1 - Experimental
```

Retrieve an element from the list. Positive and negative indices are allowed. Throws an exception if the index is out of bounds.

`element = list.at(index, nickname)`

* `element (`[`QElement`](QElement.md)`)` The element retrieved.

* `index (number)` Zero-based index of the element to retrieve. If the index is negative, it counts from the end of the list.

* `nickname (optional string)` The name to use when describing `element` in error messages. Uses the list's nickname with a subscript (e.g., `myList[0]`) by default.

Example: Retrieve the last element: `var element = list.index(-1);`
