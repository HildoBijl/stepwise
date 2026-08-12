# FloatUnit

The `FloatUnit` class represents a numerical quantity having a specific accuracy and a specific unit. An example is `2.0 km` or `2000.00 m`.


## Creation

Setting up a new `FloatUnit` object can be done in various ways.

```
import { asFloatUnit, FloatUnit, asFloat, asUnit } from '@step-wise/physics-core'
const c = new FloatUnit('2.99792458 * 10^8 m/s') // String, constructor
const h = asFloatUnit('6.62607015 * 10^-34 J * s') // String, function
const k = asFloatUnit({ float: { number: 1.380649, significantDigits: 7, power: -23 }, unit: 'J / K'}) // Object, where float and unit can be strings, objects, etcetera.
const pi = asFloatUnit(3.14159265358979) // Directly from a number or Float object. Will have no unit then.
```

The resulting `FloatUnit` object has a variety of properties and methods.


## Display

The `FloatUnit` has the same display functions as the `Float` object. The most common ones are:

```
console.log(c.str) // String representation
console.log(c.tex) // Tex representation
```


## Arithmetics

To manipulate the numbers, there is a variety of functions, identical to the `Float` object.

- `negate()`: turns `x` into `-x`.
- `abs()`: turns a negative number into a positive one (and keeps positive numbers as is).
- `add(x, keepDecimals)`: adds two numbers, while taking into account precision rules, taking the minimum number of decimals. By setting `keepDecimals` to true, the maximum number of decimals is kept.
- `subtract(x, keepDecimals)`: subtracts two numbers.
- `multiply(x, keepDigits)`: multiplies two numbers, while taking into account precision rules, taking the minimum number of significant digits. By setting `keepDigits` to true, the maximum number of digits is kept.
- `divide(x, keepDigits)`: divides by a number.
- `invert()`: gives 1 divide by this number.
- `toPower(n)`: gives this number to the power of the given number.

Any operation that requires the parameters to have the same unit will check this, and throw an error if this is not the case. When units are equivalent but different (like adding `m` to `cm`) then the other's units are first converted to this object's units.


## Precision operations

It is possible to adjust the precision with which the number is stored; its significant digits. There are various functions here, identical to the `Float` object.

- `setSignificantDigits(significantDigits)`: directly sets the significant digits.
- `makeExact()`: sets the significant digits to infinity.
- `adjustSignificantDigits(delta)`: increases (on positive) or decreases (on negative) the number of significant digits by the given `delta` change.
- `setMinimumSignificantDigits(significantDigits)`: ensures that the number of significant digits is at least the given amount. (If already higher, nothing changes.)
- `setDecimals(decimals)`: ensures that the given number of decimals is shown. Note that `314.15926 * 10^2` represents the number `31415.926`, and when set to two decimals will display (using the given display power) as `314.1593 * 10^2` representing `31415.93` which indeed has two decimals. When set to `-1` decimals, it will display as `314.2 * 10^2`. Note that, when set to `-3` decimals, it shows as `310 * 10^2` since the display power is defined as `2` and that takes priority.
- `roundToPrecision()`: internally rounds a number to the specified precision. If you define a number `{ number: 3.14159, significantDigits: 3 }` then it will show as `3.14` but internally it will still have the value `3.14159` for any calculations. Calling this function will internally adjust the number to `3.14`.
- `clearDisplayPower()`: removes any defined display power. Defining `314.15926 * 10^2` will set the display power to `2`, and the number will be displayed that way. By clearing it, you resort to the default mode of only displaying a power when needed. In this case, the number will show as `31415.926` instead.


## Unit adjustments

To adjust the units, there are various functions available. These functions generally throw an error if the adjustment is not possible.

- `setUnit(newUnit)`: turns the unit of the `FloatUnit` into the given units. Use for instance `new FloatUnit('2.0 cm').setUnit('mm').str` to get `20 mm`.


## Simplification

Simplifying a `FloatUnit` object is done through the `simplify(options)` function. The options it can take are the following.

- `target`: (default `'standard'`) either `'unchanged'`, `'noPrefixes'`, `'standard'` or `'base'`. How much should the unit be simplified? It can turn `mbar` into `bar`, `Pa` or `kg / m * s^2`. Quantities are adjusted accordingly.
- `combine`: (default `true`) should `m * m^2` be combined into `m^3`?
- `sort`: (default `true`) should units be sorted in the default way?
- `simplifyFloat`: (default `true`) should the display power of the `Float` part be set to `undefined` to allow for intelligent displaying?


## Comparison

To compare `FloatUnit` objects, we separately compare `Float` and `Unit` objects. As is the case with these classes too, there are two functions.

- `equals(otherFloatUnit, equalityOptions)`: checks for equality and returns `true`/`false`.
- `checkEquality(otherFloatUnit, equalityOptions)`: gives a report (as an object) with data on equality and which checks failed/passed.

The equality options should be set up as follows.

```
const equalityOptions = {
	float: {
		absoluteTolerance: 0, // How much may the quantities differ to still be considered equal? This is a number, assuming standard units are used. So when comparing `2.00 km` with `2.01 km` the absolute margin should be 10 (meters, standard) to consider them equal.
		relativeTolerance: 0, // How much may the quantities differ ratio-wise to still be considered equal? Only one of the two margins (absolute and relative) has to match to obtain equality.
		significantDigitTolerance: Infinity, // How much may the significant digits differ for the numbers to be considered equal?
		checkPower: false, // Do the numbers require an equal display power?
	},
	unit: {
		target: 'base', // To what target do we simplify before we check for equality?
		checkSize: false, // Do we require the units to have an equal size separately from the float? If set to `true`, then `mm` will be different from `cm`.
	},
}
```


## Random generation

To randomly generate `FloatUnit` objects, there are two functions.

- `getRandomFloatUnit(options)` gives a `FloatUnit` according to a uniform distribution. Use for instance `getRandomFloatUnit({ min: 3, max: 6 })`.
- `getRandomExponentialFloatUnit(options)` gives a `FloatUnit` where `log(x)` satisfies a uniform distribution. Use for instance `getRandomExponentialFloatUnit({ min: 1000, max: 10 ** 6 })`. The minimum and maximum must be positive.

Other options the can be included are:

- `unit`: which unit the `FloatUnit` will have. Default is `undefined` (no unit) but use for instance `kg * m / s^2` to get this unit. It will be converted into a `Unit` object internally.
- `significantDigits`: how many significant digits the `Float` should have.
- `decimals`: how many decimals the `FloatUnit` should have. Cannot be combined with `significantDigits`.
- `round`: should the `FloatUnit` be rounded to its precision? Default `true`: this ensures that a random value of `3.4` is not behind the scenes actually `3.34499999`.
- `negative`: only for `getRandomExponentialFloat`, makes the outcome negative.
- `randomSign`: only for `getRandomExponentialFloat`, makes the outcome have a random sign. Cannot be combined with `negative`.


## Serialization

See the [serialization](./serialization.ts) and [inputValue](./inputValue.ts) files to learn more about how `FloatUnit` objects are serialized and/or created as input.
