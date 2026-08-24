# @step-wise/input-interpretation

Convert stored learner input into usable domain values and convert domain values back into editable input representations.

Input values are plain objects with a stable `type` and `value`. Their contents reflect what an input field needs to display and edit, which may differ from the general storage representation produced by [@step-wise/serialization](https://www.npmjs.com/package/@step-wise/serialization).


## Installation

```bash
npm install @step-wise/input-interpretation
```


## Interpreting one input value

Use `interpretInputValue` when the value is known to be exactly one registered input value:

```ts
import { interpretInputValue } from '@step-wise/input-interpretation'

const quantity = interpretInputValue({
	type: 'Quantity',
	value: {
		value: { number: '9.81' },
		unit: {
			numerator: [{ text: 'm' }],
			denominator: [{ text: 's', power: '2' }],
		},
	},
})
```

The result is the corresponding domain value, in this case a `Quantity` representing `9.81 m/s^2`.

The function requires a plain object with a string `type` and an own `value` property. Unknown types and malformed values throw an error.


## Interpreting nested input data

Use `interpretInputData` for a complete input structure. It recursively processes arrays and plain objects and interprets any registered input values it encounters:

```ts
import type { Quantity } from '@step-wise/physics-core'

import { interpretInputData } from '@step-wise/input-interpretation'

const input = {
	acceleration: {
		type: 'Quantity',
		value: {
			value: { number: '9.81' },
			unit: {
				numerator: [{ text: 'm' }],
				denominator: [{ text: 's', power: '2' }],
			},
		},
	},
	choice: { type: 'MultipleChoice', value: 2 },
}

const interpreted = interpretInputData(input) as {
	acceleration: Quantity
	choice: number
}
```

An object with an unknown `type` remains an ordinary plain object, while its nested contents are still processed. An object with a recognized `type` commits to that interpretation. Malformed input for a recognized type therefore throws instead of silently remaining plain data.

Sparse arrays, circular structures, unsupported class instances, functions, symbols, and bigints are rejected. Repeated references are allowed when they are not circular, although shared object identity is not preserved.


## Converting a domain value to input

Use `toInputValue` to create an editable input representation. The target type is required because primitive values do not carry enough information to determine which input field they belong to:

```ts
import { Quantity, QuantityType } from '@step-wise/physics-core'
import { toInputValue } from '@step-wise/input-interpretation'

const inputValue = toInputValue(
	new Quantity('9.81 m/s^2'),
	QuantityType,
)
```

This produces:

```ts
{
	type: 'Quantity',
	value: {
		value: { number: '9.81' },
		unit: {
			numerator: [{ text: 'm' }],
			denominator: [{ text: 's', power: '2' }],
		},
	},
}
```

The result uses display-oriented strings such as `'9.81'` and editable unit factors such as `{ text: 'm' }`. This is intentionally different from a serialized `Quantity`, whose representation is designed for general domain-object storage.

The type must be registered and must match the supplied domain value. Missing and unknown types throw an error.


## Fundamental input types

This package defines two fundamental input types directly.

### Integers

Integer input uses a string so partially entered text can be represented before interpretation:

```ts
import { IntegerType, interpretInputValue, toInputValue } from '@step-wise/input-interpretation'

interpretInputValue({ type: IntegerType, value: '-42' }) // -42
toInputValue(-42, IntegerType) // { type: 'Integer', value: '-42' }
```

Interpreted and converted integers must be safe JavaScript integers. Empty input, a lone minus sign, decimals, non-string input values, and unsafe integers are rejected.

### Multiple choice

A multiple-choice selection is either one non-negative option index or an array of unique indexes:

```ts
import { MultipleChoiceType, interpretInputValue } from '@step-wise/input-interpretation'

interpretInputValue({ type: MultipleChoiceType, value: 2 }) // 2
interpretInputValue({ type: MultipleChoiceType, value: [2, 4] }) // [2, 4]
```

An empty array represents no selection. Negative, fractional, unsafe, non-number, and duplicate options are rejected.


## Registered domain inputs

The package currently includes input adapters for:

- [@step-wise/cas](https://www.npmjs.com/package/@step-wise/cas): expressions and equations.
- [@step-wise/geometry](https://www.npmjs.com/package/@step-wise/geometry): vectors, lines, line segments, and rectangles.
- [@step-wise/physics-core](https://www.npmjs.com/package/@step-wise/physics-core): precision numbers, units, and quantities.
- [@step-wise/engineering-mechanics](https://www.npmjs.com/package/@step-wise/engineering-mechanics): free-body diagrams.

Import domain-owned type constants and input types directly from their respective packages. This package re-exports only the integer, multiple-choice, and free-body-diagram types that it currently defines itself.


## TypeScript types

The main public types are:

- `InputValue<TType, TValue>` describes a plain `{ type, value }` input representation.
- `IntegerInputValue` describes an editable integer input.
- `MultipleChoiceSelection` is one option index or an array of option indexes.
- `MultipleChoiceInputValue` describes an editable multiple-choice input.
- `FreeBodyDiagramInputValue` describes a free-body-diagram input containing serialized loads.
- `InputValueAdapter<TInputValue, TDomainValue>` describes the matching `interpret` and `toInputValue` functions for one input type.

Because arbitrary nested input data cannot statically describe the precise domain values that `interpretInputData` will create, its return type is `unknown`. Consumers should narrow the result at an untrusted boundary or assert the expected form when interpreting input produced by their own application.
