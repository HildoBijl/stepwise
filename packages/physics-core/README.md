# @step-wise/physics-core

`@step-wise/physics-core` provides immutable value objects for precision-aware numbers, physical units and quantities. It preserves significant digits and display powers, understands unit prefixes and conversions, and supports arithmetic, comparison, serialization, editable input values and random generation.


## Installation

```bash
npm install @step-wise/physics-core
```


## Quick start

```ts
import { PrecisionNumber, Quantity, Unit } from '@step-wise/physics-core'

const value = new PrecisionNumber('3.140 * 10^2')
value.number // 314
value.significantDigits // 4

const speed = new Quantity('90.0 km / h')
speed.setUnit('m / s').toString() // '25.0 m / s'

new Unit('N').toUnitDefinitions().toString() // 'kg * m / s^2'
```

All operations return new objects. Existing `PrecisionNumber`, `Unit` and `Quantity` instances are never mutated.


## Precision numbers

`PrecisionNumber` represents a number together with its significant digits and optional display power. Consequently, `3.1`, `3.10` and `310 * 10^-2` have the same numerical value but remain distinguishable representations.

### Creation

```ts
import { asPrecisionNumber, PrecisionNumber } from '@step-wise/physics-core'

const a = new PrecisionNumber('2.99792458 * 10^8')
const b = asPrecisionNumber('6.62607015 * 10^-34')
const c = new PrecisionNumber({ number: 1.380649, significantDigits: 7, power: -23 })
const exact = new PrecisionNumber(Math.PI)
```

Strings may use a period or comma as decimal separator and may include `* 10^n` or `10^n`. Constructing from a JavaScript number creates an exact value with infinitely many significant digits. Object input requires a finite `number`, a non-negative integer or `Infinity` for `significantDigits`, and an optional integer `power`. `asPrecisionNumber(input)` returns an existing instance unchanged and otherwise constructs one.

### Display

Use `str` or `toString()` for plain text and `tex` or `toTex()` for TeX. `toTex({ decimalSeparator: '.' })` overrides the default comma separator. `texWithSign` adds an explicit plus sign to positive values, while `texWithParentheses` adds round parentheses when a displayed power requires them.

The display power is representational: `new PrecisionNumber('3.14 * 10^2').number` is `314`. Use `setDisplayPower(power)` or `clearDisplayPower()` to control that representation.

### Arithmetic and precision

```ts
new PrecisionNumber('16').add('2.8').toString() // '19'
new PrecisionNumber('16').add('2.8', true).toString() // '18.8'
new PrecisionNumber('2.0').multiply('3.00').toString() // '6.0'
```

Addition and subtraction normally preserve the least precise decimal position; their `keepDecimals` flag preserves the most precise position instead. Multiplication and division normally preserve the lowest number of significant digits; their `keepDigits` flag preserves the highest number instead. The class also provides `negate`, `abs`, `invert` and `toPower`.

Precision can be changed with `setSignificantDigits`, `adjustSignificantDigits`, `setMinimumSignificantDigits`, `setDecimals` and `makeExact`. `roundToPrecision()` changes the stored numerical value to its displayed precision; without that call, calculations continue using the unrounded internal number.

### Comparison

`compare(input)` compares numerical size. `equals(input, options)` returns a boolean, while `checkEquality(input, options)` returns the complete number, significant-digit and optional display-power comparison.

```ts
new PrecisionNumber('3.14').equals('3.14159') // true
new PrecisionNumber('3.14').checkEquality('3.20', {
	absoluteTolerance: 0.02,
	relativeTolerance: 0.01,
	significantDigitTolerance: 0,
	checkPower: false,
})
```

Absolute and relative tolerance are alternative numerical criteria: satisfying either is sufficient. The effective absolute tolerance cannot be smaller than half of the reference value's least significant displayed place. Significant-digit tolerance and, when enabled, display-power equality are additional required criteria.

### Random generation

```ts
import { getRandomExponentialPrecisionNumber, getRandomPrecisionNumber } from '@step-wise/physics-core'

getRandomPrecisionNumber({ min: 3, max: 6, significantDigits: 2 })
getRandomExponentialPrecisionNumber({ min: 1e-4, max: 1e4, randomSign: true })
```

Random options may specify either `significantDigits` or `decimals`, plus `round` and one or more prevented values through `prevent`. Exponential generation requires positive bounds and additionally supports `negative` or `randomSign`, but not both.


## Units

`Unit` represents a physical unit as numerator and denominator arrays of `UnitFactor` objects. Each factor combines a `Prefix`, a `UnitDefinition` and a positive integer power. Most consumers can work entirely with unit strings and do not need these lower-level classes.

### Creation

```ts
import { asUnit, Unit } from '@step-wise/physics-core'

const speed = new Unit('m / s')
const force = asUnit('kg * m / s^2')
const volume = new Unit({ numerator: [{ unit: 'm', power: 3 }] })
```

Factors are separated with `*`, and a unit may contain one `/`. Parentheses are neither required nor accepted. An empty string or empty object represents a dimensionless unit. `asUnit(input)` preserves existing instances.

### Display and arithmetic

Use `str` or `toString()` for plain text, `tex` or `toTex()` for TeX, and `texWithBrackets` or `toTexWithBrackets()` for a TeX unit in square brackets. `invert`, `multiply`, `divide` and `toPower` perform unit arithmetic. `combineLikeFactors` merges identical factors across numerator and denominator, `sortFactors` applies the package's stable physical-unit order, and `normalizePrefixes` converts prefixes to their standard form.

### Simplification

`simplifyWithData(options)` supports four targets:

- `unchanged` retains the written factors.
- `normalizedPrefixes` normalizes prefixes, including converting grams to the standard mass prefix kilograms.
- `standard` also converts definitions such as bar to pascal and degrees Celsius to kelvin.
- `base` reduces the result to the seven SI base units.

```ts
const result = new Unit('bar').simplifyWithData({ target: 'base' })

result.unit.toString() // 'kg / m * s^2'
result.decimalExponent // 5
result.factor // 1
result.offset // 0
```

The returned `decimalExponent`, `factor` and `offset` describe how a corresponding numerical value must change. `Quantity.simplify()` applies these transformations automatically. Options also include `combine` and `sort`, both defaulting to `true`. Convenience methods `toStandardUnits`, `toUnitDefinitions` and their `WithData` variants perform common transformations directly.

### Inspection and comparison

`isEmpty`, `usesStandardPrefixes`, `isInStandardUnits`, `isInStandardForm`, `isInUnitDefinitions` and `isInBaseForm` inspect the current representation.

```ts
unitsEqual('m * s', 's * m') // true: same written factors
unitsEquivalent('N', 'kg * m / s^2') // true: same unit and scale
unitsEquivalent('km', 'm') // false: different scale
unitsCompatible('km', 'm') // true: same physical dimension
```

`unit.equals(input, options)` and `unit.checkEquality(input, options)` allow selecting a simplification `target` and whether `checkSize` must compare scale and offset separately.

### Prefixes and definitions

The package exports the `prefixes` and `unitDefinitions` registries together with `findPrefix` and `findUnitDefinition`. `Prefix`, `UnitDefinition` and `UnitFactor` are also public for consumers that need to inspect or construct metadata. Unknown symbols, inconsistent definitions and invalid powers throw rather than being accepted silently.


## Quantities

`Quantity` combines a `PrecisionNumber` in its `value` property with a `Unit` in its `unit` property.

### Creation

```ts
import { asQuantity, Quantity } from '@step-wise/physics-core'

const speed = new Quantity('2.99792458 * 10^8 m / s')
const constant = asQuantity({ value: { number: 1.380649, significantDigits: 7, power: -23 }, unit: 'J / K' })
const dimensionless = asQuantity(3.14159265358979)
```

`asQuantity(input)` accepts strings, numbers, precision numbers and `{ value, unit }` objects and preserves an existing `Quantity` instance.

### Arithmetic and conversion

Quantities provide the precision-number arithmetic and precision methods described above. Multiplication, division, inversion and powers combine their units. Addition, subtraction and comparison require compatible dimensions and convert the input to the receiver's unit first.

```ts
new Quantity('2.0 m').add('50 cm').toString() // '2.5 m'
new Quantity('20 °C').setUnit('K').toString() // '293 K'
new Quantity('2.0 m').multiply('3.00 s').toString() // '6.0 m * s'
```

`setUnit(unit)` converts to an equivalent target unit and throws for an incompatible dimension. If the target already equals the current unit, the existing quantity is returned.

### Simplification and comparison

`simplify(options)` applies unit normalization and the corresponding numerical transformation. It accepts the unit `target`, `combine` and `sort` options plus `simplifyPrecisionNumber`, which defaults to `true` and clears an explicit display power after conversion.

`compare(input)` compares compatible quantities after conversion. `equals(input, options)` returns a boolean, while `checkEquality(input, options)` returns separate `value` and `unit` reports.

```ts
new Quantity('2.00 m').equals('200 cm') // true

new Quantity('2.00 m').checkEquality('201 cm', {
	value: { absoluteTolerance: 0.01, relativeTolerance: 0 },
	unit: { target: 'base', checkSize: false },
})
```

Value tolerances are interpreted after simplification to the configured unit target. `checkSize: true` additionally requires matching unit scale, so metres and centimetres then differ even when their converted values agree.

### Random generation

`getRandomQuantity(options)` and `getRandomExponentialQuantity(options)` accept the corresponding precision-number options plus a required `unit` input.

```ts
getRandomQuantity({ min: 2, max: 5, decimals: 1, unit: 'm' })
```


## Input values

The package provides editable input-value types and conversions for integration with input fields:

- `PrecisionNumberInputValue` stores the displayed number and optional power as strings.
- `UnitInputValue` stores numerator and denominator arrays of editable unit factors.
- `QuantityInputValue` combines these under `{ value, unit? }`.

For each domain type, `is...InputValue` validates an unknown value, `interpret...InputValue` creates the domain object, and `...ToInputValue` converts a domain object back to its editable representation. Type guards return `false` for malformed data; interpretation functions throw when syntactically valid-looking input cannot be interpreted.


## Serialization

`serializePrecisionNumber`, `serializeUnit` and `serializeQuantity` produce explicitly discriminated storage objects. Their matching `deserialize...` functions validate both the discriminator and nested structure.

```ts
serializeQuantity(new Quantity('3.14 m'))
// {
//   type: 'Quantity',
//   value: {
//     value: { number: 3.14, significantDigits: 3, power: 0 },
//     unit: { numerator: [{ unit: 'm' }] },
//   },
// }
```

Serialized values use the discriminators `PrecisionNumber`, `Unit` and `Quantity`. Deserialization is strict: unknown keys, missing required values, invalid numbers and malformed nested units are rejected.


## Errors and constraints

Constructors and resolving functions validate their inputs and throw `TypeError` for an unexpected data type, `RangeError` for a value outside its supported range, and `Error` for semantic inconsistencies such as unknown units or incompatible dimensions. Arithmetic does not silently discard units or accept invalid conversions. Division and inversion by zero throw.


## TypeScript

The package includes TypeScript declarations. Public inputs accept convenient string and object forms, while constructed `PrecisionNumber`, `Unit`, `UnitFactor`, `Prefix`, `UnitDefinition` and `Quantity` instances expose readonly state and immutable operations.
