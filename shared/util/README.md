# Step-Wise utility functions

Step-Wise has a large amount of utility functions: simple functions that do a small task, and can be used anywhere in the code base. These are sorted into various groups. Each utility submoduyle may use submodules higher up the chain, but not vice versa, to prevent circular references.

## Fundamental functions

These are utilities related to the fundamental working of Javascript. Think of the basic data types like numbers, strings, arrays, objects, etcetera.

- [numbers](./numbers.js) deals with everything around numbers, both integer and float. Think of checking if a number satisfies certain requirements, bounding a number to a range, and basic interpolation between two numbers.
- [strings](./strings.js) concerns everything related to strings. Think of efficiently browsing through the characters of a string, or adding/removing characters.
- [objects](./objects.js) adds utilities to objects. Think of comparing objects (with `deepEquals`), generating objects from a list of keys, filtering its properties, or applying a function to each object parameter.
- [arrays](./arrays.js) adds functionalities to browsing through arrays. Think of finding the sum or product of arrays, rearranging/shuffling arrays, efficiently searching through arrays, and so forth.
- [functions](./functions.js) adds utilities around functions. Think of repeating a function multiple times, or calling all functions within an array/object subject to certain parameters.
- [sets](./sets.js) is about the Javascript sets. Think of taking their unions, intersections, difference and symmetric difference (xor).

## Javascript-related utilities

These are utilities related to already existing Javascript functionalities.

- [errors](./errors.js) extends various `Error` classes.
- [date](./date.js) provides extra functionality upon the Javascript `Date` object.
- [random](./random.js) helps picking random numbers, array elements, strings and more.

## Extra add-on utilities

These are various other, often mainly mathematical, utility tools.

- [maths](./maths.js) deals with basic mathematics, like finding the prime factors of a number, the greatest common divider/smallest common multiple of two numbers, and so forth.
- [combinatorics](./combinatorics.js) deals with factorials, binomials, and so forth.
- [interpolation](./interpolation.js) deals with the interpolation between numbers, up to multi-dimensional interpolation.
