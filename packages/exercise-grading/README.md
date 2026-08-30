# @step-wise/exercise-grading

Grade interpreted learner input against the solution of an input exercise. The package supplies comparison functions for individual fields, groups of fields, and order-independent lists. Generic domain-value equality is delegated to [@step-wise/value-equality](https://www.npmjs.com/package/@step-wise/value-equality).

This package is designed for the `checkInput` functions created with [@step-wise/input-exercises](https://www.npmjs.com/package/@step-wise/input-exercises). Input interpretation remains the responsibility of that package; exercise grading compares the resulting domain values.


## Installation

```bash
npm install @step-wise/exercise-grading
```


## Comparing input fields

Use `compareInputs` inside an input exercise to compare a field with the equally named field in its solution:

```ts
import { compareInputs } from '@step-wise/exercise-grading'
import { buildMonoExercise } from '@step-wise/input-exercises'

const addition = buildMonoExercise({
	metadata: {},
	generateParameters: () => ({ left: 7, right: 8 }),
	getSolution: ({ left, right }) => ({ answer: left + right }),
	checkInput: data => compareInputs('answer', data),
})
```

An array checks several fields at once. Every field must match:

```ts
checkInput: data => compareInputs(['numerator', 'denominator'], data)
```

`compareInputs` validates that every requested key exists in the raw input, interpreted input, and solution before comparing anything. It throws when the solution is absent or the key array is empty.


## Configuring comparisons

Add `comparisons` to the exercise metadata to customize equality. Settings can be provided for one input key or for every input of a given type:

```ts
const exercise = buildMonoExercise({
	metadata: {
		comparisons: {
			answer: { absoluteTolerance: 0.01 },
			Quantity: { value: { relativeTolerance: 0.02 } },
		},
	},
	// ...
})
```

A setting for a specific key takes precedence over a setting for its input type. When neither is present, the comparison for that type receives `undefined` and applies its defaults.

The available options depend on the selected equality adapter. Integers use the number-equality options from `@step-wise/js-utils`; domain-owned adapters define and validate their own options.


## Custom comparison functions

Instead of an options object, a field or type may define its own comparison function:

```ts
const exercise = buildMonoExercise({
	metadata: {
		comparisons: {
			answer: (inputValue: number, expectedValue: number) => inputValue * 2 === expectedValue,
		},
	},
	// ...
})
```

A custom comparison receives four arguments:

```ts
(inputValue, expectedValue, solution, data) => boolean
```

- `inputValue` is the interpreted value entered by the learner.
- `expectedValue` is the value stored at the corresponding key in the solution.
- `solution` is the complete solution object.
- `data` is the complete `CheckInputData` object supplied to `checkInput`.

The function must return a boolean. Returning another value throws an error instead of silently treating a truthy or falsy value as the result.


## Comparing an order-independent list

Use `compareInputList` when several input fields should contain the solution values but their order does not matter:

```ts
checkInput: data => compareInputList(['root1', 'root2'], data)
```

For example, inputs `{ root1: 3, root2: 2 }` match a solution `{ root1: 2, root2: 3 }`. Matching is one-to-one, so entering the same correct value twice cannot satisfy two different solution entries.

`compareInputEntry(inputKey, solutionKey, data)` performs one field-level comparison. Passing the same key twice compares an input with its corresponding solution field; passing different keys compares an input against another solution field, as used by list matching and field-level feedback.


## Supported value types

The package directly supplies equality adapters for integers and multiple-choice values. Domain-specific equality adapters are passed through `CheckInputData`, normally after [@step-wise/input-exercises](https://www.npmjs.com/package/@step-wise/input-exercises) extracts them from the exercise's ValueTypes.

This keeps grading independent of mathematics, physics, geometry, and mechanics engines. Values and options are validated by the selected adapter before its strongly typed equality operation runs. Missing adapters and invalid values throw instead of producing an incorrect grade. Duplicate type registrations are rejected earlier while composing the exercise value-type registry.

## TypeScript types

The main public types are:

- `InputKey<TData>` represents a string key accepted for the interpreted input in a `CheckInputData` object.
- `InputComparisonOptions` represents an options object supplied to a value-type comparison.
- `InputComparisonFunction` is the signature of a custom comparison function defined by an exercise.
- `InputComparisonSetting` is either an `InputComparisonOptions` object or an `InputComparisonFunction`.
- Domain integrations use `ValueEqualityAdapter` from `@step-wise/value-equality`; their registries are carried in `CheckInputData`.

The generic key parameters of `compareInputs`, `compareInputList`, and `compareInputEntry` stay aligned with the supplied `CheckInputData` type. Runtime validation remains responsible for detecting fields that are absent from a particular input or solution.
