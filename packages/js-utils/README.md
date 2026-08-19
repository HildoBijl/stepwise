# @step-wise/js-utils

`@step-wise/js-utils` is a general-purpose JavaScript and TypeScript utility library for working with numbers, strings, arrays, objects, functions, sets and dates. It favors small composable functions, explicit validation, predictable boundary behavior and immutable transformations.


## Installation

```bash
npm install @step-wise/js-utils
```


## Usage

Import public utilities directly from the package root.

```ts
import { deduplicate, ensureNumber, integerRange, partition } from '@step-wise/js-utils'

ensureNumber(4) // 4
integerRange(2, 5) // [2, 3, 4, 5]
deduplicate([1, 2, 1]) // [1, 2]
partition([1, 2, 3, 4], value => value % 2 === 0) // [[2, 4], [1, 3]]
```


## Conventions

- Functions starting with `is` inspect a value and return a boolean. Where possible, they also act as TypeScript type guards.
- Functions starting with `ensure` validate a value and return the validated or normalized result. They throw a `TypeError` for an invalid type and generally throw a `RangeError` when the type is correct but its value is outside the permitted range.
- Strict number functions such as `ensureNumber`, `ensureInteger` and `ensureNumberArray` accept JavaScript numbers only. Normalizing functions such as `ensureNumeric`, `ensureNumericInteger` and `ensureNumericArray` additionally accept numeric strings and convert them to numbers.
- Array and object transformation functions return new containers and do not mutate their input unless explicitly stated otherwise.
- Range endpoints and random-selection boundaries are documented for each function. Do not assume that every range follows the same convention.
- All public utilities are exported from `@step-wise/js-utils`; no deep imports are necessary.


## API overview

- [Numbers](#numbers)
- [Strings](#strings)
- [Arrays](#arrays)
- [Objects](#objects)
- [Functions](#functions)
- [Sets](#sets)
- [Dates](#dates)
- [TypeScript](#typescript)


## Numbers

### Validation and normalization

| Function | Behavior |
| --- | --- |
| `isNumber(value)` | Recognizes JavaScript numbers other than `NaN`. Infinities are numbers according to this check. |
| `isNumeric(value)` | Recognizes numbers and non-empty strings that JavaScript can convert to numbers. |
| `ensureNumber(value, options?)` | Strictly requires a number and returns it unchanged. |
| `ensureNumeric(value, options?)` | Accepts a number or numeric string and returns a number. |
| `isInteger(value)` | Recognizes JavaScript integers. |
| `isNumericInteger(value)` | Recognizes integers and strings representing integers. |
| `ensureInteger(value, options?)` | Strictly requires an integer number. |
| `ensureNumericInteger(value, options?)` | Accepts an integer or integer string and returns an integer. |

The ensure functions support `nonNegative`, `nonZero` and `allowInfinity` options, all defaulting to `false`.

```ts
ensureNumber(2) // 2
ensureNumber('2') // throws TypeError
ensureNumeric(' 2.5 ') // 2.5
ensureInteger(-2, { nonNegative: true }) // throws RangeError
ensureNumber(Infinity, { allowInfinity: true }) // Infinity
```

### Comparison and tolerances

| Function | Behavior |
| --- | --- |
| `epsilon` | The small tolerance used by `approximatelyEqual` and by detailed equality checks. |
| `defaultNumberEqualityOptions` | The default detailed equality options, with both tolerances set to zero. |
| `approximatelyEqual(input, reference)` | Compares two numbers using the library's small absolute and relative tolerance. Equal infinities compare equal. |
| `compareNumbers(input, reference)` | Returns `-1`, `0` or `1` according to the ordering of the numbers. |
| `numbersEqual(input, reference, options?)` | Checks equality with configurable `absoluteTolerance` and `relativeTolerance`. |
| `checkNumberEquality(input, reference, options?)` | Returns equality, direction, calculated differences and applied tolerances. |
| `resolveNumberEqualityOptions(options?)` | Applies default zero tolerances and validates the result. |
| `validateNumberEqualityOptions(options)` | Validates non-negative absolute and relative tolerances. |
| `adjustNumberTolerances(options, factor)` | Resolves and multiplies both tolerances by a positive factor. |
| `getAbsoluteDifference(input, reference)` | Returns the absolute difference. |
| `getRelativeDifference(input, reference)` | Returns the difference relative to the larger absolute magnitude. |
| `isMultipleOf(a, b)` | Checks whether `a` is approximately an integer multiple of non-zero `b`. |

```ts
numbersEqual(10.1, 10, { absoluteTolerance: 0.1 }) // true
numbersEqual(101, 100, { relativeTolerance: 0.01 }) // true
```

### Limiting and ranges

| Function | Behavior |
| --- | --- |
| `mod(a, n)` | Returns a modulus from `0` inclusive to positive `n` exclusive, including for negative `a`. |
| `clamp(value, min?, max?)` | Clamps a value between bounds defaulting to `0` and `1`. Infinite bounds act as unconstrained sides. |
| `isBetween(value, min?, max?, options?)` | Checks a range inclusively by default; `{ inclusive: false }` excludes the boundaries. Infinite bounds are supported. |

```ts
mod(-1, 5) // 4
clamp(4, -Infinity, 3) // 3
```

### Rounding

| Function | Behavior |
| --- | --- |
| `roundTo(value, decimals?)` | Rounds to decimal positions. Negative positions round to the left of the decimal separator. |
| `roundToDigits(value, digits)` | Rounds to a non-negative number of significant digits. |

```ts
roundTo(12.345, 2) // 12.35
roundTo(1234, -2) // 1200
roundToDigits(1234, 2) // 1200
```

### Angles

| Function | Behavior |
| --- | --- |
| `degreesToRadians(degrees)` | Converts degrees to radians. |
| `radiansToDegrees(radians)` | Converts radians to degrees. |
| `normalizeAngle(angle, period?)` | Normalizes to `0` inclusive through `period` exclusive. The default period is `2 * Math.PI`. |
| `anglesEqual(angle1, angle2, period?)` | Approximately compares angles modulo the period. |

### Random values

| Function | Behavior |
| --- | --- |
| `randomBoolean(probability?)` | Returns `true` with a probability from `0` through `1`, defaulting to `0.5`. |
| `randomNumber(min, max)` | Returns a floating-point number between `min` inclusive and `max` exclusive. |
| `randomInteger(min, max, options?)` | Returns a safe integer between both inclusive bounds; `{ exclude }` removes selectable values. |


## Strings

### Validation and searching

| Function | Behavior |
| --- | --- |
| `ensureString(value, options?)` | Requires a string; `{ nonEmpty: true }` rejects the empty string. |
| `isLetter(value)` | Recognizes exactly one Unicode letter. |
| `indexOfAnyCharacter(value, characters, startIndex?)` | Finds the earliest requested single Unicode character at or after the start index, or returns `-1`. |

### Manipulation and creation

| Function | Behavior |
| --- | --- |
| `lowerFirst(value)` | Lowercases the first character. |
| `upperFirst(value)` | Uppercases the first character. |
| `removeWhitespace(value)` | Removes all whitespace sequences. |
| `removeAt(value, index, length?)` | Removes `length` characters, defaulting to one, at an index. |
| `insertAt(value, index?, insertion?)` | Inserts text at an index. |
| `camelToKebab(value)` | Converts uppercase transitions into lowercase hyphenated segments. |
| `alphabet` | The lowercase English alphabet. |
| `getSpreadsheetColumnLabel(value)` | Converts a non-negative integer to a lowercase spreadsheet column label. Numbering is one-based and `0` returns `''`. |

```ts
camelToKebab('camelCaseValue') // 'camel-case-value'
getSpreadsheetColumnLabel(1) // 'a'
getSpreadsheetColumnLabel(26) // 'z'
getSpreadsheetColumnLabel(27) // 'aa'
getSpreadsheetColumnLabel(703) // 'aaa'
```


## Arrays

### Validation

| Function | Behavior |
| --- | --- |
| `isArray(value)` | Recognizes arrays and narrows them to readonly arrays. |
| `isEmptyArray(value)` | Recognizes empty arrays. |
| `ensureArray(value)` | Validates and returns the original array, preserving readonly typing. |
| `isNumberArray(value)` | Strictly recognizes arrays of JavaScript numbers. |
| `ensureNumberArray(value, options?)` | Strictly validates every number and returns a copied number array. |
| `isNumericArray(value)` | Recognizes arrays containing numbers and numeric strings. |
| `ensureNumericArray(value, options?)` | Normalizes numbers and numeric strings into a copied number array. |
| `hasDuplicates(array, equals?)` | Detects duplicates using strict or custom equality. |

### Reading and finding

| Function | Behavior |
| --- | --- |
| `first(array, options?)` | Returns the first element. |
| `last(array, options?)` | Returns the last element. |
| `secondLast(array, options?)` | Returns the second-last element. |
| `isIn(value, options)` | Checks list membership and narrows the value type. |
| `findWithValue(array, mapper)` | Returns the first `{ index, element, value }` whose mapped value is not `undefined`. |
| `findValue(array, mapper)` | Returns only the first mapped value that is not `undefined`. |
| `findIndexPath(array, element)` | Returns the path of a strictly equal value in a nested array. |
| `findOptimumIndex(array, isBetter)` | Returns the best index, or `-1` for an empty array. |
| `findOptimum(array, isBetter)` | Returns the best element, or `undefined` for an empty array. |

`first`, `last` and `secondLast` throw for undersized arrays by default. Pass `{ allowOutOfBounds: true }` to receive `undefined`.

```ts
findIndexPath([1, [2, [3]]], 3) // [1, 1, 0]
```

### Creation

| Function | Behavior |
| --- | --- |
| `integerRange(end)` | Creates an inclusive integer range from `0` to `end`. |
| `integerRange(start, end)` | Creates an inclusive ascending or descending integer range. |
| `arithmeticSequence(start, step, length)` | Creates positive `length` values following `start + index * step`. |
| `subdivideRange(start, end, subdivisions)` | Divides a range equally and returns both endpoints in `subdivisions + 1` values. |
| `rangeByStep(start, end, step?)` | Moves from `start` toward `end`; the end is included only when reached exactly. |

```ts
integerRange(3) // [0, 1, 2, 3]
integerRange(2, -1) // [2, 1, 0, -1]
arithmeticSequence(2, 3, 4) // [2, 5, 8, 11]
subdivideRange(0, 1, 4) // [0, 0.25, 0.5, 0.75, 1]
```

The `rangeByStep` step must be non-zero and point toward the endpoint.

### Iteration

| Function | Behavior |
| --- | --- |
| `sum(array)` | Returns the sum, with `0` as the empty-array identity. |
| `product(array)` | Returns the product, with `1` as the empty-array identity. |
| `count(array, predicate)` | Counts truthy predicate results. |
| `cumulative(array)` | Returns cumulative sums. |

### Comparison and matching

| Function | Behavior |
| --- | --- |
| `shallowEqual(a, b)` | Checks equal length and strict equality at every position. |
| `compareNumberArrays(a, b)` | Approximately compares equally shaped nested number arrays. |
| `getOneToOneMatching(a, b, matcher?)` | Maps each item in `a` to an unused matching index in `b`, using deep equality by default. |
| `hasOneToOneMatching(a, b, matcher?)` | Checks for a complete one-to-one matching. |
| `invertOneToOneMatching(matching, invertedLength?)` | Inverts a complete or partial matching. |

### Transformation and shaping

| Function | Behavior |
| --- | --- |
| `deduplicate(array, equals?)` | Keeps the first occurrence of each distinct value while preserving order. |
| `partition(array, predicate)` | Returns `[kept, removed]` while preserving both groups' order. |
| `removeUndefined(array)` | Removes only `undefined`, retaining other falsy values. |
| `flattenDeep(array)` | Flattens arbitrarily nested arrays without mutating the input. |
| `cartesianProduct(arrays)` | Returns every combination selecting one item per constituent array. |

The outer input of `cartesianProduct` must be non-empty. An empty constituent array produces an empty product.

### Multidimensional arrays

| Function | Behavior |
| --- | --- |
| `getDimensions(value, isElement)` | Returns the dimensions of a rectangular nested array with guarded endpoints. A scalar has dimensions `[]`. |
| `getMatrixElement(value, indices, isElement, options?)` | Traverses a nested array and returns the endpoint verified by `isElement`. |

Irregular dimensions, invalid endpoints and incomplete element paths throw. `getMatrixElement` can return `undefined` for an out-of-bounds traversal when passed `{ allowOutOfBounds: true }`.

### Sorting and randomness

| Function | Behavior |
| --- | --- |
| `sortBy(values, numbers, options?)` | Sorts values by corresponding finite numbers, ascending by default or descending through `{ order: 'descending' }`. |
| `sample(array, options?)` | Selects one item uniformly or according to non-negative `{ weights }` with a positive total. |
| `shuffle(array)` | Returns a shuffled copy using Fisher-Yates. |
| `randomIndices(arrayLength, options?)` | Selects unique indices with optional `count`, `randomOrder` and `weights`. |
| `randomSubset(array, options)` | Selects a subset with required `count` and optional `randomOrder` and `weights`. |


## Objects

### Basic and plain-object checks

| Function | Behavior |
| --- | --- |
| `isObject(value)` | Recognizes non-null objects, including arrays but excluding functions. |
| `ensureObject(value)` | Validates and returns a non-null object. |
| `isBoolean(value)` | Recognizes primitive booleans. |
| `ensureBoolean(value)` | Validates and returns a primitive boolean. |
| `hasOnlyKeys(object, allowedKeys)` | Checks enumerable own string keys, ignoring inherited keys. |
| `isPlainObject(value)` | Recognizes objects with `Object.prototype` or `null` as prototype, excluding React elements. |
| `isEmptyObject(value)` | Recognizes plain objects without enumerable own string keys. |
| `ensurePlainObject(value)` | Validates and returns a plain object. |

### Plain data

| Function | Behavior |
| --- | --- |
| `isPlainDataValue(value)` | Recursively recognizes strings, numbers, booleans, `null`, arrays and plain objects. |
| `isPlainDataArray(value)` | Recognizes arrays containing only plain data. |
| `isPlainDataObject(value)` | Recognizes plain objects containing only plain data. |

Functions, special object types, sparse arrays and circular references are not plain data.

### Deep comparison

#### `deepEqual(a, b)`

Deeply compares primitives, arrays, plain objects, dates and regular expressions. It supports enumerable symbol keys and circular structures while requiring matching reference topology. Distinct unsupported object types such as maps, sets and class instances throw instead of producing an unreliable result.

### Creation and nested paths

| Function | Behavior |
| --- | --- |
| `fromKeys(keys, mapper, options?)` | Creates properties from `mapper(key, index, partialResult)`. Undefined results are omitted by default. |
| `fromKeysAndValues(keys, values, options?)` | Creates properties from equal-length parallel arrays. Undefined values are omitted by default. |
| `getByPath(object, path)` | Reads through string and number keys. A missing path returns `undefined`; an empty path returns the root. |
| `setByPath(object, path, value)` | Immutably sets a nested value, creating missing object or array containers and preserving untouched siblings. |

Pass `{ filterUndefined: false }` to either object-creation function to retain undefined properties.

```ts
const original = { user: { name: 'Ada' } }
const updated = setByPath(original, ['user', 'name'], 'Grace')
// updated: { user: { name: 'Grace' } }
```

An empty `setByPath` path replaces the root value. Existing values traversed along a non-empty path must be plain objects or arrays.

### Immutable manipulation

| Function | Behavior |
| --- | --- |
| `mapValues(input, mapper)` | Maps an array or plain object into a new container; object mapper results of `undefined` are omitted. |
| `preserveRefs(newValue, oldValue)` | Reuses old references wherever corresponding supported values are deeply equal. |
| `pickKeys(object, allowedKeys)` | Keeps requested own properties that exist, including existing undefined values. |
| `pickFromDefaults(allOptions, allowedOptions)` | Keeps only keys occurring in `allowedOptions`. |
| `omitKeys(object, keysToRemove)` | Returns a shallow copy without the requested keys. |
| `omitDefaults(object, comparison)` | Omits properties strictly equal to comparison values and always omits undefined results. |
| `mergeDefaults(givenOptions, defaultOptions, options?)` | Applies defaults where values are undefined. Unknown keys throw unless `{ filterUnknownKeys: true }` discards them. |
| `filterProperties(object, predicate)` | Keeps properties for which `predicate(value, key, object)` is truthy. |


## Functions

### Fundamentals and repetition

| Function | Behavior |
| --- | --- |
| `noop()` | Does nothing and returns `undefined`. |
| `identity(value)` | Returns the value unchanged, preserving its type and reference. |
| `ensureFunction(value)` | Validates and returns the same function reference. |
| `repeat(times, callback)` | Returns callback results for indices from `0` through `times - 1`. |
| `repeatFromTo(min, max, callbackOrValue)` | Repeats over both inclusive integer bounds. A non-function value is repeated as-is. |
| `repeatMultidimensional(times, callback)` | Repeats over a zero-based multidimensional index space and returns a nested array. |
| `repeatMultidimensionalFromTo(min, max, callback)` | Repeats over inclusive multidimensional minimum and maximum indices. |
| `forEachCombination(length, size, callback)` | Visits every ascending combination of distinct indices from `0` through `length - 1`. |

An empty dimension list calls a multidimensional callback once without indices and returns its value directly.

```ts
const combinations: number[][] = []
forEachCombination(4, 2, (...indices) => combinations.push(indices))
// [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
```

### Resolving function-valued data

| Function | Behavior |
| --- | --- |
| `resolveFunctionValue(value, ...args)` | Calls a function with the supplied arguments or returns a non-function unchanged. |
| `resolveFunctionValuesDeep(value, ...args)` | Recursively resolves functions inside arrays and plain objects while reusing unchanged references. |

```ts
resolveFunctionValuesDeep({ fixed: 2, dynamic: (n: number) => n * 2 }, 3)
// { fixed: 2, dynamic: 6 }
```


## Sets

| Function | Behavior |
| --- | --- |
| `isSet(value)` | Recognizes JavaScript `Set` instances. |
| `union(...sets)` | Returns values occurring in any supplied set. |
| `intersection(...sets)` | Returns values occurring in every supplied set. No inputs produce an empty set. |
| `difference(setA, setB)` | Returns values from `setA` that do not occur in `setB`. |
| `symmetricDifference(setA, setB)` | Returns values occurring in exactly one input set. |

```ts
const a = new Set([1, 2])
const b = new Set([2, 3])

union(a, b) // Set { 1, 2, 3 }
intersection(a, b) // Set { 2 }
difference(a, b) // Set { 1 }
symmetricDifference(a, b) // Set { 1, 3 }
```

All set operations return new sets and leave their inputs unchanged.


## Dates

| Function | Behavior |
| --- | --- |
| `isDate(value)` | Recognizes valid `Date` instances and rejects invalid dates whose timestamp is `NaN`. |
| `ensureDate(value)` | Returns a valid date unchanged or attempts to construct one from the supplied value. |
| `formatDate(date, options?)` | Formats local date components as `YYYY-MM-DD`, optionally including time and seconds. |

```ts
const date = new Date(2024, 0, 2, 3, 4, 5)

formatDate(date) // '2024-01-02'
formatDate(date, { includeTime: true }) // '2024-01-02 03:04'
formatDate(date, { includeTime: true, includeSeconds: true }) // '2024-01-02 03:04:05'
```

Requesting `includeSeconds` without `includeTime` throws a `RangeError`.


## TypeScript

The package includes TypeScript declarations. Its `is...` functions narrow values where possible, readonly inputs are accepted by utilities that do not mutate their arguments, and option types are exported alongside their functions.

Useful exported structural types include `NestedArray`, `NestedValue`, `PropertyPath`, `TypeGuard`, `PlainDataValue`, `PlainDataArray`, `PlainDataObject`, `OneToOneMatching`, `NumberEqualityOptions` and the various function-specific option interfaces.
