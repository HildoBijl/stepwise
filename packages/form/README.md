# @step-wise/form

`@step-wise/form` provides headless form state, field registration, input conversion, validation, and submission for React applications. It manages form behavior without prescribing input components, visual styling, translations, or grading logic.


## Installation

```bash
npm install @step-wise/form react
```

React is a peer dependency. The package currently supports React 19.


## Value lifecycle

Every field distinguishes its temporary editor state from its serializable input value and interpreted domain value.

```text
InputState --normalizeInput--> InputValue --interpretInput--> DomainValue
InputState <--hydrateInput---- InputValue
```

- `InputState` contains everything needed by an editor, such as text, cursor position, and selection.
- `InputValue` is the normalized representation that can be stored or submitted.
- `DomainValue` is the value used by application logic, such as a number, expression, or quantity.

Validation is associated with normalized InputValues. Editor-only changes therefore preserve cached validation when normalization produces an equal InputValue.


## Defining a field

A field definition provides its default InputValue and the conversions between InputState and InputValue. It may customize InputValue equality and DomainValue validation.

```ts
import type { InputValue } from '@step-wise/input-interpretation'

import type { FormFieldDefinition } from '@step-wise/form'

type IntegerInputValue = InputValue<'Integer', string>
type IntegerInputState = {
	text: string
	cursor: number
}

export const integerFieldDefinition = {
	defaultInputValue: { type: 'Integer', value: '' },
	normalizeInput: state => ({ type: 'Integer', value: state.text }),
	hydrateInput: inputValue => ({ text: inputValue.value, cursor: inputValue.value.length }),
	getInterpretationErrorFeedback: () => 'Enter a valid integer.',
	validateDomainValue: ({ domainValue }) => domainValue >= 0
		? { valid: true }
		: { valid: false, feedback: 'Enter a non-negative integer.' },
} satisfies FormFieldDefinition<IntegerInputState, IntegerInputValue, number>
```

`defaultInputValue` is the field-level fallback. Form-specific `initialInputValues`, such as previously stored answers, override it.


## Creating a form store

The form store is the recommended orchestration API. It coordinates field registration, input updates, validation invalidation, snapshots, and submission.

```ts
import type { InputValue } from '@step-wise/input-interpretation'

import { createFormStore } from '@step-wise/form'

type IntegerInputValue = InputValue<'Integer', string>
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

const store = createFormStore<InputValues, DomainValues>({
	initialInputValues: {
		answer: { type: 'Integer', value: '2' },
	},
	interpretInput: inputValues => ({
		answer: Number(inputValues.answer.value),
	}),
	onSubmit: submission => {
		console.log(submission.inputValues)
		console.log(submission.domainValues)
	},
})
```

Keep a store instance stable for the lifetime of one form. In a component, create it through a lazy state initializer or another stable owner rather than recreating it during every render.


## React usage

Provide the store through `FormProvider`. `useFormField` registers a field for the lifetime of its component and returns its typed state and operations.

```tsx
import { useState } from 'react'

import { FormProvider, createFormStore, useFormField } from '@step-wise/form'

function AnswerField() {
	const field = useFormField('answer', integerFieldDefinition)

	return <>
		<input
			value={field.inputState.text}
			onChange={event => field.setInputState(current => ({ ...current, text: event.target.value }))}
			onBlur={() => void field.validate()}
		/>
		{field.validationState.status === 'invalid' && field.validationState.feedback}
	</>
}

export function ExampleForm() {
	const [store] = useState(() => createFormStore({
		interpretInput: inputValues => ({ answer: Number(inputValues.answer.value) }),
		onSubmit: submission => console.log(submission),
	}))

	return <FormProvider store={store}>
		<AnswerField />
		<button type="button" onClick={() => void store.submit()}>Submit</button>
	</FormProvider>
}
```

Pass `{ sectionId }` as the third `useFormField` argument when fields should be validated as a group:

```ts
useFormField('answer', integerFieldDefinition, { sectionId: 'step-1' })
```


## Validation

Validation consists of two stages:

1. The store applies `interpretInput` to obtain DomainValues. Interpretation failures are converted with the field's optional `getInterpretationErrorFeedback`.
2. A successfully interpreted value is passed to the field's optional `validateDomainValue` callback.

Domain validators may be asynchronous. They receive an `AbortSignal` so obsolete work can stop when the InputValue changes or validation is otherwise invalidated.

```ts
validateDomainValue: async ({ domainValue, signal }) => {
	const response = await fetch(`/api/check/${domainValue}`, { signal })
	return response.ok
		? { valid: true, report: await response.json() }
		: { valid: false, feedback: 'This value is unavailable.' }
}
```

The manager also rejects stale results when a validator does not cooperate with cancellation. Successful validation reports are included in the eventual submission.

Use `validateField`, `validateSection`, or `validateForm` for the desired scope. A form submission always validates the complete active form first.


## Input updates and resets

The store supports individual and bulk input updates:

| Method | Behavior |
| --- | --- |
| `setFieldInputState` | Updates editor state and normalizes its InputValue. |
| `setFieldInputValue` | Applies an InputValue and hydrates editor state. |
| `setInputValues` | Replaces the complete supplied InputValue collection. |
| `patchInputValues` | Updates only supplied field IDs. |
| `resetInputValues` | Restores the current initial-value baseline or replaces that baseline first. |
| `updateInitialInputValues` | Updates the baseline using the `untouched`, `always`, or `never` policy. |

Values supplied before their fields register remain pending and are applied when those fields mount.


## Store snapshots

`useFormSnapshot` subscribes through React's `useSyncExternalStore`. A snapshot contains:

- Active field IDs.
- InputStates and InputValues by field ID.
- Validation states by field ID.
- The current submission state.

Snapshots retain their reference until the store emits a change. Use `useFormStore` when an operation is needed without subscribing to snapshots.


## Public API

The main high-level exports are:

| Export | Purpose |
| --- | --- |
| `createFormStore` | Creates the coordinated headless form store. |
| `FormProvider` | Places a store in React context. |
| `useFormStore` | Retrieves the current store without subscribing to its state. |
| `useFormSnapshot` | Subscribes to complete form snapshots. |
| `useFormField` | Registers and controls one typed field. |
| `FormFieldDefinition` | Defines field conversion, equality, and validation behavior. |

The field registry, input manager, validation manager, and submission manager are also exported for advanced composition. Most applications should use `createFormStore`, which preserves their coordination invariants automatically.


## Package boundary

This package owns:

- Field registration and section membership.
- InputState and InputValue synchronization.
- Interpretation and DomainValue validation.
- Validation caching and asynchronous cancellation.
- Form snapshots, subscriptions, and submission orchestration.

It intentionally does not own visual input components, focus traversal, virtual keyboards, translations, grading feedback, or exercise behavior. Those concerns belong to higher-level input, feedback, and exercise-component packages.


## Related packages

- `@step-wise/input-interpretation` defines serializable InputValues and their adapter-driven conversion to DomainValues.
- `@step-wise/react-utils` provides general-purpose React hooks unrelated to form semantics.
- Domain-specific input packages can build visual field components and keyboards on top of this package.
