# @step-wise/value-equality

Determine whether two domain values should be considered equal through a small, domain-independent adapter interface. The package validates values, options, and equality results without knowing about exercises or specific mathematical, physical, or geometric types.


## Installation

```bash
npm install @step-wise/value-equality
```


## Defining an equality adapter

An equality adapter checks unknown values and options before its strongly typed operation is called:

```ts
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

type ToleranceOptions = { tolerance?: number }

function isToleranceOptions(value: unknown): value is ToleranceOptions {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
	const tolerance = (value as ToleranceOptions).tolerance
	return tolerance === undefined || typeof tolerance === 'number'
}

const numberEquality: ValueEqualityAdapter<number, ToleranceOptions> = {
	isValue: (value): value is number => typeof value === 'number' && Number.isFinite(value),
	isOptions: isToleranceOptions,
	areEqual: (inputValue, expectedValue, options) => Math.abs(inputValue - expectedValue) <= (options?.tolerance ?? 0),
}
```

Both values enter the package as `unknown`. Only after `isValue` accepts them does `areEqual` receive them as the adapter's domain type. `isOptions` validates supplied options. It is not called when the options are omitted.


## Checking equality

Pass the adapter followed by both values to `areValuesEqual`:

```ts
import { areValuesEqual } from '@step-wise/value-equality'

const equal = areValuesEqual(
	numberEquality,
	11,
	10,
	{ tolerance: 1 },
)
```

When the fourth argument is omitted, the equality operation receives `undefined`. The adapter remains responsible for applying its own defaults.

`areValuesEqual` throws when either value, the options, or the adapter is invalid. An equality operation must return a boolean; any other result also causes a `TypeError`. Errors thrown by the adapter are not hidden.

Value types without configurable options can omit both the options type and `isOptions`:

```ts
const stringEquality: ValueEqualityAdapter<string> = {
	isValue: (value): value is string => typeof value === 'string',
	areEqual: (inputValue, expectedValue) => inputValue === expectedValue,
}
```

For such adapters, supplying equality options is both a TypeScript error and a runtime error. When an options type is specified, `isOptions` is required.


## Package scope

This package handles generic domain-value equality. It deliberately does not contain:

- Domain-specific equality adapters.
- A global registry of value types.
- Exercise metadata or solution handling.
- Input interpretation or serialization.

Domain integrations provide adapters for their own values. Exercise-grading tools select the relevant adapter and supply its values and options.


## TypeScript types

The main public types are:

- `ValueEqualityOptions`, the generic record shape for equality options.
- `ValueEqualityAdapter<TValue, TOptions>`, the guards and strongly typed equality operation for one value type.
- `AnyValueEqualityAdapter`, the same contract with concrete types erased for heterogeneous registries.
- `ValueEqualityAdapters`, a registry of erased equality adapters keyed by value type.
