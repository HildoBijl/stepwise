# Interpolation utility functions

All utility functions related to interpolation are in this folder. There are a few ways to call them.


## Step 1: define a table

This is usually the hard part, but it only needs to be done once. You can define a table representing the mathematical function `x = 2a+3b, y = 3a-2b, z = b` through:

```
const exampleTable = {
	inputLabels: ['a', 'b']
	inputValues: [[0, 1, 2], [0, 1, 2, 3]]
	outputLabels: ['x', 'y']
	grids: [
		[[0, 2, 4], [3, 5, 7], [6, 8, 10], [9, 11, 13]], // Output for x
		[[0, 3, 6], [-2, 1, 4], [-4, -1, 2], [-6, -3, 0]], // Output for y
		[[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]], // Output for z
	]
}
```

A few things to note here are:

- It is easily possible to define tables with single input and/or single outputs. Do keep the same array format though.
- Within the grids, within the final arrays, the first-mentioned input value will vary across its range. A layer higher, it's the second-mentioned input value. This can continue for further input values, creating a multi-dimensional table.


## Step 2: use a table

Once a table has been defined, we can interpolate in it. There are two functions to do so: one for a single output value, and one for extracting multiple output values. For the single-output case, there are a few options.

```
tableInterpolate([1.5, 2.5], exampleTable, 'x') // Use array as input. Gives 10.5 here.
tableInterpolate({ a: 1.5, b: 2.5 }, exampleTable, 'x') // Use object as input. Gives 10.5 here.
tableInterpolate(1.5, exampleTable, 'x') // Use value as input: only works for single-input tables, and will throw an error in this example case with a two-dimensional table.
tableInterpolate([1.5, 2.5], exampleTable) // Omit output label: only works for single-output tables, and will throw an error in this example case with three possible outputs.
```

To get multiple outputs at the same time, use `multiOutputTableInterpolate`. The options here are similar.

```
multiOutputTableInterpolate([1.5, 2.5], exampleTable) // Use array as input. Gives { x: 10.5, y: -0.5, z: 2.5 }.
multiOutputTableInterpolate({ a: 1.5, b: 2.5 }, exampleTable) // Use object as input. Gives { x: 10.5, y: -0.5, z: 2.5 }.
multiOutputTableInterpolate(1.5, exampleTable) // Use value as input: only works for single-input tables, and will throw an error in this example case with a two-dimensional table.
multiOutputTableInterpolate([1.5, 2.5], exampleTable, ['z', 'x']) // Provide output labels. Gives { z: 2.5, x: 10.5 }. (Also works with other input types.)
```

Tables may also have `undefined` in them, for instance when the output value there is unknown or not applicable. Whenever an interpolation function encounters `undefined` anywhere, the output is always directly `undefined` too, as the output cannot be computed.


## Interpolation with non-number values

Interpolation can be done with numbers, but it can also be done with objects. All it takes is that the objects match the right interface:

```
interface NumberLike<T> {
	number: number
	add(x: T): T
	subtract(x: T): T
	multiply(x: T | number): T
	divide(x: T | number): T
	compare(x: T): number
}
```

In other words, the objects must have `add`, `subtract`, `multiply`, `divide` and `compare` methods. Here, `multiply` and `divide` should accept both numbers and objects of the same type as the respective objects. `compare` is a function that gives `-1`, `0` or `1`: which number is larger? Also, `number` returns a numeric representation of the object. This is needed after calculating the interpolation part `(x-a)/(b-a)` (or `x.subtract(a).divide(b.subtract(a))).number`) which should always be a number.


## Extra interpolation methods

Behind the scenes, the interpolation toolbox uses functions that operate directly on grids. Though not as useful for most use cases, they can be used directly as well. The format is `gridInterpolate(input, outputGrid, inputSeries1, inputSeries2, ...)`.

```
gridInterpolate([1.5, 2.5], [[0, 2, 4], [3, 5, 7], [6, 8, 10], [9, 11, 13]], [0, 1, 2], [0, 1, 2, 3]) // Use array as input. Gives 10.5.
gridInterpolate(1.5, [2, 4, 6, 8], [0, 1, 2, 3]) // Use value as input. Only works for single-output grids. Gives 5.
```

The grid must be structured identically to that of the tables.


## Supporting functions

The toolbox has various supporting checks and functions too. You can read about them in their respective files.
- [checks](./src/checks.ts) has functions that check the inputs given to interpolation functions.
- [support](./src/support.ts) has support functions, for instance to find interpolation parts or to find where in a series we need to interpolate.
