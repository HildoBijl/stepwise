# @step-wise/interpolation

`@step-wise/interpolation` provides linear interpolation for ranges, grids and reusable labeled tables. It supports ordinary numbers as well as custom number-like values, one-dimensional and multidimensional input, multiple output grids, inverse table interpolation and explicitly undefined regions.


## Installation

```bash
npm install @step-wise/interpolation
```


## Quick start

Create and validate a table once, then use it for repeated interpolation.

```ts
import { createInterpolationTable, interpolateTable } from '@step-wise/interpolation'

const pressureByTemperature = createInterpolationTable({
	inputLabels: ['temperature'],
	inputAxes: [[0, 10, 20]],
	outputLabels: ['pressure'],
	outputGrids: [[100, 120, 150]],
})

interpolateTable(5, pressureByTemperature) // 110
interpolateTable({ temperature: 15 }, pressureByTemperature, 'pressure') // 135
interpolateTable(25, pressureByTemperature) // undefined
```

The factory copies and freezes the table structure. It also validates its labels, axes, grids and value types, so subsequent table interpolations can use the trusted structure without validating the complete table again.


## Creating interpolation tables

### `createInterpolationTable(definition)`

Creates an `InterpolationTable` from a typed definition. Every table has one label and axis per input and one label and grid per output.

```ts
const table = createInterpolationTable({
	inputLabels: ['x', 'y'],
	inputAxes: [
		[0, 1, 2],
		[0, 10],
	],
	outputLabels: ['sum', 'difference'],
	outputGrids: [
		[[0, 1, 2], [10, 11, 12]],
		[[0, 1, 2], [-10, -9, -8]],
	],
})
```

Each input axis must be non-empty and ascending. Equal neighboring coordinates are allowed, although interpolating at the duplicated coordinate is ambiguous and throws. Input and output labels must be unique.

Grid nesting follows the input axes from last to first: the outermost grid dimension corresponds to the last input axis, while the innermost dimension corresponds to the first input axis. Every dimension must have the same length as its corresponding axis.

An output grid may contain `undefined` leaves to represent unavailable values or regions. A grid must otherwise contain one consistent interpolation value type; numbers and custom number-like objects cannot be mixed within the same grid.

### `ensureInterpolationTable(value)`

Validates an unknown value, copies and freezes its structure, and returns an `InterpolationTable`. Use this at boundaries such as parsed files, external data or API responses.

```ts
const table = ensureInterpolationTable(JSON.parse(serializedTable))
```

### `isInterpolationTable(value)`

Returns whether a value has a structurally valid interpolation-table definition. This check does not create the branded, copied and frozen table returned by the factory functions.


## Interpolating tables

### `interpolateTable(input, table, outputLabel?)`

Interpolates one output. A single-input table accepts a scalar, a one-element array or an object keyed by its input label. Multidimensional tables accept an array in axis order or a labeled object.

```ts
interpolateTable([0.5, 5], table, 'sum') // 5.5
interpolateTable({ x: 0.5, y: 5 }, table, 'difference') // -4.5
```

The output label may be omitted only when the table has exactly one output. Interpolation outside an axis, or across an undefined output value, returns `undefined`. Unknown or missing labels, incompatible input shapes and ambiguous duplicated coordinates throw an error.

### `interpolateTableOutputs(input, table, outputLabels?)`

Interpolates multiple outputs and returns an object keyed by output label. When no labels are supplied, every table output is included. A supplied label list controls both the selection and property order and must not contain duplicates.

```ts
interpolateTableOutputs({ x: 0.5, y: 5 }, table) // { sum: 5.5, difference: -4.5 }
interpolateTableOutputs([0.5, 5], table, ['difference']) // { difference: -4.5 }
```

### `interpolateTableInput(output, table, outputLabel?)`

Performs inverse interpolation and returns the corresponding input. Inverse interpolation requires exactly one input axis and a selected output series containing at least two defined values. The output series must be strictly increasing or strictly decreasing.

```ts
interpolateTableInput(135, pressureByTemperature) // 15
```

An output outside the series returns `undefined`. Undefined output values, equal neighboring values, changing direction and multidimensional tables are rejected because they do not define an unambiguous inverse.


## Direct range interpolation

### `interpolateRange(input, outputRange, inputRange)`

Linearly interpolates between two endpoints. It returns `undefined` when the input lies outside the input range or either output endpoint is undefined. Equal input endpoints are rejected.

```ts
interpolateRange(5, [100, 120], [0, 10]) // 110
interpolateRange(15, [100, 120], [0, 10]) // undefined
```

### `getInterpolationFraction(input, range)`

Returns the relative position of an input within a range. Unlike `interpolateRange`, this function may return a value below zero or above one for inputs outside the range.

```ts
getInterpolationFraction(5, [0, 10]) // 0.5
getInterpolationFraction(15, [0, 10]) // 1.5
```

### `isInterpolationFraction(value)`

Returns whether a number lies on the closed interval from zero through one.


## Direct grid interpolation

### `interpolateGrid(input, outputGrid, ...inputAxes)`

Interpolates directly on a one-dimensional series or multidimensional grid. This lower-level function validates the complete grid on every call; prefer an interpolation table when the same data is reused.

```ts
interpolateGrid(1.5, [0, 10, 20], [0, 1, 2]) // 15

interpolateGrid(
	[0.5, 5],
	[[0, 1, 2], [10, 11, 12]],
	[0, 1, 2],
	[0, 10],
) // 5.5
```

Exact-coordinate lookups return the corresponding grid value without requiring neighboring values to be defined. Inputs outside the grid and interpolations touching undefined values return `undefined`.

### `getBracketingIndices(value, getAxisValue, axisLength)`

Uses binary search to find the neighboring indices around a value in an ascending axis. This is a low-level helper for working with indexable axes. The axis length must be a positive safe integer.


## Custom number-like values

Interpolation inputs and outputs may use objects implementing the exported `NumberLike<T>` interface. This is useful for domain values such as quantities with units.

```ts
interface NumberLike<T> {
	readonly number: number
	add(value: T): T
	subtract(value: T): T
	multiply(value: T | number): T
	divide(value: T | number): T
	compare(value: T): number
}
```

The `number` property must be finite and represents the numeric value used to calculate interpolation fractions. The arithmetic methods construct interpolated results, while `compare` determines ordering and equality. All values within one input axis or output grid must use the same representation: either numbers or compatible number-like objects.


## TypeScript

The package includes TypeScript declarations and uses readonly arrays throughout its public table and grid types. It exports `NumberLike`, `InterpolationValue`, `InterpolationPair`, `InterpolationAxis`, `InterpolationSeries`, `InterpolationGrid`, `InterpolationTableDefinition`, `InterpolationTable`, `TableInterpolationInput` and `TableInterpolationOutput` alongside its runtime functions.
