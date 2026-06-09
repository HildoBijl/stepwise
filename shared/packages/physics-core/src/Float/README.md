# Float

The `Float` class represents a numerical quantity having a specific accuracy. It distinguishes `3.1` from `3.14159` from `314159 * 10^(-5)`.


## Creation

Setting up a new `Float` object can be done in various ways.

```
import { asFloat, Float } 
const c = new Float('2.99792458 * 10^8') // String, constructor
const h = asFloat('6.62607015 * 10^-34') // String, function
const k = new Float({ number: 1.380649, significantDigits: 7, power: -23 }) // Object, constructor
const N = asFloat({ number: 602214076, significantDigits: 8, power: 23 }) // Object, function
const R = asFloat({ number: 8.314462618, significantDigits: 10 }) // Note: power is optional, the other attributes are not
```

The resulting `Float` object has a variety of properties and methods.


## Display

Common ways to display a Float are:

```
console.log(c.str) // String representation
console.log(c.tex) // Tex representation
```

For specific cases, you can also use these functions:

```
console.log(c.texWithPM) // Write -3 as "-3" and 3 as "+3": it adds an addition/subtraction symbol before it.
console.log(c.texWithBrackets) // Write 300 as "300" and 3.00 * 10^2 as "(300 * 10^2)". So it adds brackets when there is a displayed power.
```


## Arithmetics

To manipulate the numbers, there is a variety of functions.

- `negate()`: turns `x` into `-x`.
- `abs()`: turns a negative number into a positive one (and keeps positive numbers as is).
- `add(x, keepDecimals)`: adds two numbers, while taking into account precision rules, taking the minimum number of decimals. By setting `keepDecimals` to true, the maximum number of decimals is kept.
- `subtract(x, keepDecimals)`: subtracts two numbers.
- `multiply(x, keepDigits)`: multiplies two numbers, while taking into account precision rules, taking the minimum number of significant digits. By setting `keepDigits` to true, the maximum number of digits is kept.
- `divide(x, keepDigits)`: divides by a number.
- `invert()`: gives 1 divide by this number.
- `toPower(n)`: gives this number to the power of the given number.


## Precision operations

It is possible to adjust the precision with which the number is stored; its significant digits. There are various functions here.

- `setSignificantDigits(significantDigits)`: directly sets the significant digits.
- `makeExact()`: sets the significant digits to infinity.
- `adjustSignificantDigits(delta)`: increases (on positive) or decreases (on negative) the number of significant digits by the given `delta` change.
- `setMinimumSignificantDigits(significantDigits)`: ensures that the number of significant digits is at least the given amount. (If already higher, nothing changes.)
- `setDecimals(decimals)`: ensures that the given number of decimals is shown. Note that `314.15926 * 10^2` represents the number `31415.926`, and when set to two decimals will display (using the given display power) as `314.1593 * 10^2` representing `31415.93` which indeed has two decimals. When set to `-1` decimals, it will display as `314.2 * 10^2`. Note that, when set to `-3` decimals, it shows as `310 * 10^2` since the display power is defined as `2` and that takes priority.
- `roundToPrecision()`: internally rounds a number to the specified precision. If you define a number `{ number: 3.14159, significantDigits: 3 }` then it will show as `3.14` but internally it will still have the value `3.14159` for any calculations. Calling this function will internally adjust the number to `3.14`.
- `clearDisplayPower()`: removes any defined display power. Defining `314.15926 * 10^2` will set the display power to `2`, and the number will be displayed that way. By clearing it, you resort to the default mode of only displaying a power when needed. In this case, the number will show as `31415.926` instead.


## Comparison

Comparing float objects can be done through their absolute difference or relative difference.

- The absolute difference is defined through `abs(a - b)`.
- The relative difference is defined through `abs(a - b)/max(abs(a), abs(b))`. So if you for example compare numbers `18` and `20` then the relative difference is `0.1` (being `10%` of the largest of the two).

To compare `Float` objects, you first have to set up an `equalityOptions` object. This object can have the following properties (all optional).

- `absoluteTolerance` (default 0): defines how small the absolute difference must be to consider the numbers as equal. If you have the numbers `3.14159 * 10^2` and `3.142 * 10^2` then their difference is `0.041`. So if given an `absoluteTolerance` of for instance `0.05` then these numbers are considered equal.
- `relativeTolerance` (default 0): defines how small the relative difference must be to consider the numbers as equal. If you compare `18` to `20` then a relative tolerance of `0.1` will consider these numbers equal (though barely).
- `significantDigitTolerance` (default 0): defines how small the difference between significant digits must be to consider the numbers as equal. So `3.1` and `3.10` are considered equal only if the tolerance here is at least one.
- `checkPower` (default `false`): do we require the display powers to be the same? Normally `314` and `3.14 * 10^2` are considered equal, but if `checkPower` is set to true, they are unequal.

There are three important notes with the above options.

- All three criteria (number, significantDigits and power) have to match for the full `Float` to be considered equal. (Obviously if the power is not checked, it's always considered OK.)
- For the number: when both an `absoluteTolerance` and a `relativeTolerance` are used, only *one* of them (or both) has to match for the *number* to be considered equal. It's relatively loose that way.
- The absolute tolerance is always *at minimum* the precision of the number. (This bound is applied internally and cannot be changed.) So let's say we compare `{ number: 3.14159, significantDigits: 2 }` with `{ number: 3.1, significantDigits: 5 }`. Because the comparing object (the first-mentioned `Float` or the `this` object) has two significant digits, it is displayed as `3.1`. As a result, its *minimum absolute tolerance* is `±0.05`. So any number between `3.09159` and `3.19159` will be considered equal. (The number of significant digits of the other number is irrelevant here.) Setting an `absoluteTolerance` larger than this may widen it, but setting the tolerance smaller than this (or `0`) will keep it on this minimum.

Once you have set up your equality options, you can do the comparison. There are two useful methods here.

```
asFloat('3.14').equals('3.14159') // Returns true. Though the default margins are zero, the minimum absolute margin (here 0.005) is always applied, and the number falls within it.
asFloat('3.14159').equals('3.14') // Returns false. The default absolute margin is now 0.000005 which is not wide enough.
asFloat('3.14').checkEquality('3.14159') // Returns an object functioning as a full comparison report. If the numbers are not true, you an see which checks it failed and why. This can be useful for giving feedback.
asFloat('3.14').equals('317 * 10^(-2)', { absoluteMargin: 0.02, relativeMargin: 0.01 }) // Returns true: the absolute margin is too narrow for equality, but the relative margin is wide enough, so the numbers are considered equal. By default, the `significantDigitTolerance` is zero, but that's OK here since the numbers are equally accurate. We also (by default) don't care about powers.
```

Note that the `equals` and `checkEquality` function accept `Float` objects, but also inputs that can be interpreted as `Float` objects.


## Serialization

See the [serialization](./serialization.ts) and [inputValue](./inputValue.ts) files to learn more about how `Float` objects are serialized and/or created as input.
