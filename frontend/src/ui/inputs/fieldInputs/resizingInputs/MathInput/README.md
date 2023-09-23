# Math Input field

Want to know how the mathematics input fields work internally? It's not easy.

## Basic working principle

Effectively, an expression while it's being inputed (before interpretation) is a Javascript object/array. For instance, if we have `2x*(3/(4+y))+5` then this may be processed in the form.

```
{
	type: 'Expression',
	value: [
		{ type: 'ExpressionPart', value: '2x*' },
		{ type: 'Function', name: 'frac', value: [
			{ type: 'Expression', value: [
				{ type: 'ExpressionPart', value: '3' },
				{ type: 'ExpressionPart', value: '4+y' },
			] },
		]	},
		{ type: 'ExpressionPart', value: '+5' },
	],
	cursor: { part: 1, cursor: { part: 0, cursor: { part: 1, cursor: 2 } } },
	settings: {},
}
```

Note that the cursor is in the denominator of the fraction at position 2: right before the `y`.

Whenever a key is pressed, a mouse button is clicked, or anything similar, then this object is updated. The way in which it is done is all fully defined.

## Object types

There are several object types that are used when inputing expressions. 

- `Expression`: this is the default for any maths stuff. It's always an array containing various of the below elements.
- `ExpressionPart`: anything that's a string. So `a+b` can be an expression part, or `2*sin(3)+5`. (It transforms stars into latex `\cdot` upon rendering.)
- `Function`: there is a large variety of functions that can be used. Some examples include:
  x `frac`: has two arguments and puts a divide stripe between them.
  x `subSup`: a subscript and superscript. Can have one of them or both.
  x `sqrt`: the square root.
  x `root`: the root with a power added to it.
  x `log`: a logarithm with certain base.
- `Accent`: there is also a large variety of accents that can be used, like `dot(m)`.

## Functionalities

Every one of the above element types has lots of functionalities defined. We list the most important ones.

- `toLatex(FI)`: takes an FI object and returns an object `{ latex: ..., chars: ... }` where `latex` has the latex code and `chars` show the chars that will be in said latex code, in the order in which Katex renders them. (Yes, this requires back-engineering Katex, but otherwise we cannot trace elements in the equation.)
- `getCursorProperties(FI, charElements, container)`: takes an FI object, an array of char elements and the container of the input field and uses this to determine the properties `{ x, y, height }` that the cursor should have.
- `keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)`: takes a `keyInfo` event, an FI object and some reference elements. It uses this to determine a new FI object: how the FI (value and cursor) change depending on the given key press.
- `canMoveCursorVertically(FI, up)`: takes an FI object and a boolean parameter `up`. It checks whether a cursor can move vertically (up or down depending on the second parameter) inside this element or one of its children.
- `charElementClickToCursor(event, FI, trace, charElements, contentsElement)`: takes a click on a charElement and returns the responding cursor position. It may return `null` in case it cannot find anything, in which case the click coordinates are used instead.
- `coordinatesToCursor(coordinates, boundsData, FI, charElements, contentsElement)` takes a set of click coordinates and turns it into a cursor position close to that click.
- `getStartCursor(value)`: takes a value object and returns the cursor for the start of said value.
- `getEndCursor(value)`: same as `getStartCursor`, but then for the end.
- `isCursorAtStart(value, cursor)`: checks if the cursor can be considered to be at the start of the given value.
- `isCursorAtEnd(value, cursor)`: same as `isCursorAtStart`, but then for the end.
- `getEmpty()`: returns an empty value for the element type.
- `isEmpty(value)`: checks if the given value for the element type can be seen as empty.
- `shouldRemove(FI)`: checks if the element is empty enough that it needs to be automatically removed on a clean-up.
- `countNetBrackets(FI, relativeToCursor = 0)`: counts the net number of brackets (opening brackets minus closing brackets) inside this element. If relativeToCursor is set to `1` (right) or `-1` (left) this is only done for a part of the expression: the part as seen from the cursor in the indicated direction.
- `canMerge(FI, mergeWithNext, fromOutside)`: checks if the element is capable of merging with an expression part coming after it (when `mergeWithNext = true`) or before it (when `mergeWithNext = false`). This may depend on whether this merging is triggered from outside (the cursor is after the element and a backspace is pressed or the cursor is before the element and a delete is pressed) or from inside (vice versa). 
- `merge(FI, partIndex, mergeWithNext, fromOutside)`: takes an expression and an index pointing to a special element. It then merges what comes after this element (when `mergeWithNext` is true) or what comes before the element (when mergeWithNext is false) into the element. The function must handle all the complexities of merging, returning an expression FI object including properly placed cursor.
- `canSplit(FI)`: checks if the element can split off a part of it (like on a spacebar press) given its value and cursor position.
- `split(FI)`: takes an element that needs to be split (like a fraction with a cursor halfway through the denominator) and returns an object (including cursor) representing the split result (like an expression with two elements, one being a fraction without most of the denominator and the second being what used to be in the denominator). Often the result is a non-cleaned expression, but it can be any element type.
- `cleanUp(FI, settings)`: takes an element and cleans it up, removing unnecessary elements and such. While doing so, the respective cursor is kept in the same place. If no cursor is provided, no cursor is returned either. Generally, the clean-up function is called by the input field after every FI change. The settings are general input field settings, which give data on what kind of input is allowed.

In addition to the above functions, certain element types may have extra functionalities, but naturally this varies per element type.

## Further steps

Want to add new types of input elements? Then the above functions need to be implemented. But keep in mind: this is only for the input. Once the input is submitted, it must be interpreted. This is however not done in this package, as it is the responsibility of the [Computer Algebra System (CAS)](../../../../../../../shared/CAS/).
