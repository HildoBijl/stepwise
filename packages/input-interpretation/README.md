# @step-wise/input-interpretation

Convert stored learner input into usable domain values and convert domain values back into editable input representations.

Input values are plain objects with a stable `type` and `value`. Their contents reflect what an input field needs to display and edit, which may differ from the general storage representation produced by [@step-wise/serialization](https://www.npmjs.com/package/@step-wise/serialization).


## Installation

```bash
npm install @step-wise/input-interpretation
```


## Adapter registries

This package does not hard-code input domains. Every recognized input type is supplied through an adapter registry, keeping input interpretation independent of exercise orchestration and domain engines.

The fundamental Integer and MultipleChoice adapters are defined by [@step-wise/value-types](https://www.npmjs.com/package/@step-wise/value-types). `@step-wise/input-exercises` includes them automatically and passes the resulting registry into this package. Direct callers can extract and pass the adapters themselves.

## Custom input types

Pass an adapter registry as the second argument:

```ts
import { isString } from '@step-wise/js-utils'
import {
	type InputValue,
	type InputValueAdapter,
	isInputValueOfType,
	interpretInputValue,
	toInputValue,
} from '@step-wise/input-interpretation'

type LabelInputValue = InputValue<'Label', string>

const labelAdapter = {
	isInputValue: (value: unknown): value is LabelInputValue =>
		isInputValueOfType(value, 'Label', isString),
	isDomainValue: isString,
	interpret: inputValue => inputValue.value.trim(),
	toInputValue: label => ({ type: 'Label', value: label }),
} satisfies InputValueAdapter<LabelInputValue, string>

const adapters = { Label: labelAdapter }

interpretInputValue({ type: 'Label', value: ' answer ' }, adapters) // 'answer'
toInputValue('answer', 'Label', adapters) // { type: 'Label', value: 'answer' }
```

Public conversion functions validate input before calling a typed conversion and validate the adapter's output afterward. Registry composition and duplicate-name validation are handled by `@step-wise/value-types`.

Domain packages commonly bundle these registries through [@step-wise/value-types](https://www.npmjs.com/package/@step-wise/value-types).


## Interpreting nested input data

`interpretInputData(value, adapters)` recursively processes arrays and plain objects. Registered input values are interpreted; objects with unknown type names remain ordinary data while their contents are processed.

A malformed value for a recognized type throws. Sparse arrays, circular structures, unsupported class instances, functions, symbols, and bigints are rejected. Repeated non-circular references are allowed, although shared identity is not preserved.

Because arbitrary nested input data cannot statically describe the domain values that will be created, `interpretInputData` returns `unknown`. Narrow untrusted data or assert the expected shape when reading input produced by your own application.


## TypeScript types

The main public types are:

- `InputValue<TType, TValue>` for a plain `{ type, value }` input representation.
- `InputValueAdapter<TInputValue, TDomainValue>` for one input type's guards and conversions.
- `InputValueAdapters` for a registry keyed by input type.
- `isInputValueAdapter` for runtime adapter validation.
- `isInputValueOfType` for checking an exact simple input-value envelope.
