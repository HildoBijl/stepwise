# Step-Wise utility functions

Step-Wise has a large amount of utility functions: simple functions that do a small task, and can be used anywhere in the code base. These are sorted into various groups. Each utility submodule may use submodules higher up the chain, but not vice versa, to prevent circular references.

## Primitive data types

These are utilities related to the fundamental ways Javascript stores data.

- [numbers](./src/primitives/numbers/) deals with everything around numbers, both integer and float. Think of checking if a number satisfies certain requirements, or bounding a number to a range.
- [strings](./src/primitives/strings/) concerns everything related to strings. Think of efficiently browsing through the characters of a string, or adding/removing characters.
- [objects](./src/primitives/objects/) adds utilities to objects. Think of comparing objects (with `deepEquals`), generating objects from a list of keys, filtering its properties, or applying a function to each object parameter.
- [arrays](./src/primitives/arrays/) adds functionalities to browsing through arrays. Think of finding the sum or product of arrays, rearranging/shuffling arrays, efficiently searching through arrays, and so forth.
- [functions](./src/primitives/functions/) adds utilities around functions. Think of repeating a function multiple times, or calling all functions within an array/object subject to certain parameters.
- [sets](./src/primitives/sets/) is about the Javascript sets. Think of taking their unions, intersections, difference and symmetric difference (xor).

## Built-in data types

These are utilities related to some more advanced built-in Javascript objects.

- [errors](./src/builtins/errors/) extends various `Error` classes.
- [dates](./src/builtins/dates/) provides extra functionality upon the Javascript `Date` object.

## Math functinos

These are various other mathematical utility tools.

- [integers](./src/math/integers/) deals with basic mathematics, like finding the prime factors of a number, the greatest common divisor/smallest common multiple of two numbers, and so forth.
- [interpolation](./src/math/interpolation/) deals with the interpolation between numbers, up to multi-dimensional interpolation.
