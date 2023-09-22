/*
 * This is where all the magic happens for math input fields. Inside these input fields, there are several element types.
 * - Expression: this is the default for any maths stuff. It's a list of the below elements.
 * - ExpressionPart: anything that's a string. So "a+b" can be an expression part, or "2*sin(3)+5". (It transforms stars into cdots.)
 * - Function: there is a large variety of functions that can be used. Some examples include:
 *   x frac: has two arguments and puts a divide stripe between them.
 *   x subSup: a subscript and superscript. Can have one of them or both.
 *   x sqrt: the square root.
 *   x root: the root with a power added to it.
 *   x log: a logarithm with certain base.
 * - Accent: there is also a large variety of accents that can be used, like dot(m).
 * 
 * Every one of the above element types can have a variety of functions. We will list the important ones.
 * - toLatex(FI): takes an FI object and returns an object { latex: ..., chars: ... } where latex has the latex code and chars show the chars that will be in said latex code, in the order in which Katex renders them. (Yes, this requires back-engineering Katex, but otherwise we cannot trace elements in the equation.)
 * - getCursorProperties(FI, charElements, container): takes an FI object, an array of char elements and the container of the input field and uses this to determine the properties { x, y, height } that the cursor should have.
 * - keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement): takes a keyInfo event, an FI object and some reference elements. It uses this to determine a new FI object: how the FI (value and cursor) change depending on the given key press.
 * - canMoveCursorVertically(FI, up): takes an FI object and a boolean parameter "up". It checks whether a cursor can move vertically (up or down depending on the second parameter) inside this element or one of its children.
 * - charElementClickToCursor(evt, FI, trace, charElements, contentsElement): takes a click on a charElement and returns the responding cursor position. It's given all required FI. It may return null in case it cannot find anything, in which coordinates are used instead.
 * - coordinatesToCursor(coordinates, boundsData, FI, charElements, contentsElement) takes a set of coordinates and turns it into a cursor position close to that click.
 * - getStartCursor(value): takes a value object and returns the cursor for the start of said value.
 * - getEndCursor(value): same as getStartCursor, but then for the end.
 * - isCursorAtStart(value, cursor): checks if the cursor can be considered to be at the start of the given value.
 * - isCursorAtEnd(value, cursor): same as isCursorAtStart, but then for the end.
 * - getEmpty(): returns an empty value for the element type.
 * - isEmpty(value): checks if the given value for the element type can be seen as empty.
 * - shouldRemove(FI): checks if the element is empty enough that it needs to be automatically removed on a clean-up.
 * - countNetBrackets(FI, relativeToCursor = 0): counts the net number of brackets (opening brackets minus closing brackets) inside this element. If relativeToCursor is set to 1 (right) or -1 (left) this is only done for a part of the expression: the part as seen from the cursor in the indicated direction.
 * - canMerge(FI, mergeWithNext, fromOutside): checks if the element is capable of merging with an expression part coming after it (when mergeWithNext = true) or before it (when mergeWithNext = false). This may depend on whether this merging is triggered from outside (the cursor is after the element and a backspace is pressed or the cursor is before the element and a delete is pressed) or from inside (vice versa). 
 * - merge(FI, partIndex, mergeWithNext, fromOutside): takes an expression and an index pointing to a special element. It then merges what comes after this element (when mergeWithNext is true) or what comes before the element (when mergeWithNext is false) into the element. The function must handle all the complexities of merging, returning an expression FI object including properly placed cursor.
 * - canSplit(FI): checks if the element can split off a part of it (like on a spacebar press) given its value and cursor position.
 * - split(FI): takes an element that needs to be split (like a fraction with a cursor halfway through the denominator) and returns an object (including cursor) representing the split result (like an expression with two elements, one being a fraction without most of the denominator and the second being what used to be in the denominator). Often the result is a non-cleaned expression, but it can be any element type.
 * - cleanUp(FI, settings): takes an element and cleans it up, removing unnecessary elements and such. While doing so, the respective cursor is kept in the same place. If no cursor is provided, no cursor is returned either. Generally, the clean-up function is called by the input field after every FI change. The settings are general input field settings, which give data on what kind of input is allowed.
 * 
 * In addition to the above functions, certain element types may have extra functionalities, but naturally this varies per element type.
 */

export * from './support/zooming'
export * from './main'
export { allFunctions as expressionFunctions } from './Expression'
