# @step-wise/input-exercises

Build educational exercises that interpret learner input, check it against generated parameters, update practiced skills, and track whether the exercise was solved or given up.

This package specializes the reducer model from [@step-wise/exercise-definition](https://www.npmjs.com/package/@step-wise/exercise-definition). Exercise authors describe how to generate a problem and check an answer; the builders in this package supply the solo- and group-reducers.


## Installation

```bash
npm install @step-wise/input-exercises
```


## Mono exercises

A `MonoExercise` checks one problem as a whole. The input is either correct or it's not. Create one with `buildMonoExercise`:

```ts
import { buildMonoExercise, getInput } from '@step-wise/input-exercises'

type Parameters = { left: number, right: number }
type Solution = { answer: number }

const addition = buildMonoExercise<Parameters, Solution>({
	metadata: { skill: 'addition' },
	generateParameters: example => example ? { left: 2, right: 3 } : { left: 7, right: 8 },
	getSolution: parameters => ({ answer: parameters.left + parameters.right }),
	checkInput: data => getInput('answer', data, 'number') === data.solution?.answer,
})
```

An input exercise specification commonly contains:

- `metadata` includes the practiced `skill` or a more involved skill `setup`.
- `generateParameters(example)` creates the fixed problem parameters. It generally uses randomization and may be synchronous or asynchronous.
- `getSolution(parameters, inputDependency, staticSolution)` builds the solution. Exercises without input dependencies normally use only `parameters`.
- `checkInput(data)` decides whether the interpreted learner input is correct. It may return either a boolean or `{ correct, report? }`, immediately or through a promise.

Only `metadata` and `checkInput` are required. Omitting `generateParameters` uses an empty object.

Returning a structured result lets grading retain plain-data details about the transition without putting them in the exercise state:

```ts
checkInput: data => ({
	correct: getInput('answer', data, 'number') === data.solution?.answer,
	report: { unitCorrect: true },
})
```

Existing boolean checks are normalized to `{ correct }` and therefore produce no report. A solo reducer exposes the report directly in its result. A group reducer collects reports by user ID. If `checkInput` omits its report, the reducer result omits it too; an explicit empty object remains an explicit report.

`buildMonoExercise` creates both `processSoloAction` and `processGroupActions`. Consumers therefore do not need separate exercise definitions for solo and group use.


## Step exercises

A `StepExercise` first lets the learner answer the complete problem. If the learner gives up, it splits the problem into guided steps:

```ts
import {buildStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'

const multiplication = buildStepExercise({
	metadata: {
		...createStepExerciseMetadata(['multiply-ones', 'multiply-tens']),
		skill: 'multiplication',
	},
	generateParameters: () => ({ left: 12, right: 3 }),
	getSolution: ({ left, right }) => ({ answer: left * right }),
	checkInput: (data, step) => {
		const answer = getInput('answer', data, 'number')
		switch (step) {
			case 1: return answer === 6
			case 2: return answer === 30
			default: return answer === data.solution?.answer
		}
	},
})
```

Steps are numbered from `1`. The unsplit main problem uses step `0`. `getCurrentStep(state)` returns this number.

`createStepExerciseMetadata(steps)` stores the step structure and combines its defined skills into a skill setup. A step may be `undefined` when it does not have a separately tracked skill.


## Substeps

A step can contain an array of substeps:

```ts
const metadata = createStepExerciseMetadata(['expand-brackets', ['combine-like-terms', 'simplify-coefficients']])
```

A substep array must contain at least two entries; otherwise it should be an ordinary step. Substeps are numbered from `1`. For the main problem and ordinary steps, `substep` is `0`:

```ts
checkInput: (data, step, substep) => {
	if (step === 0) return checkCompleteProblem(data)
	if (step === 1) return checkExpansion(data)
	if (substep === 1) return checkLikeTerms(data)
	return checkCoefficients(data)
}
```

One input may solve one or more substeps if `checkInput` accepts that same input for them. Attempts are stored per step, not separately for every substep.


## Custom value types

An exercise can opt into domain-specific behavior through its optional `valueTypes` registry. Each value type may provide input interpretation, parameter serialization, equality, or any combination of those capabilities.

```ts
const exercise = buildMonoExercise({
	metadata: { skill: 'algebra' },
	valueTypes: mathematicsValueTypes,
	generateParameters: () => ({ expression: createExpression() }),
	checkInput: data => compareInputs('answer', data),
})
```

The builders combine the supplied registry with the fundamental Integer and MultipleChoice value types, validate it, and capture its adapters privately. The built exercise exposes `valueOperations` with `serialize`, `deserialize`, `interpretInput`, `toInputValue`, and `areValuesEqual`; consumers never need the registry or its adapters. Generated parameters and submitted actions use the same captured operations internally. An omitted registry therefore still provides Integer and MultipleChoice interpretation and equality without exercise-level configuration.

Use `combineValueTypes` from [@step-wise/value-types](https://www.npmjs.com/package/@step-wise/value-types) when an exercise needs more than one domain. Duplicate type names and incomplete adapters throw instead of being silently overwritten.


## Raw and interpreted input

Input actions contain serializable raw input values. Before `checkInput` runs, the package interprets those values into their domain values. Its argument contains both forms:

```ts
checkInput: ({ rawInput, input, parameters, solution, metadata }) => {
	// rawInput: values suitable for storage and transport
	// input: interpreted numbers, quantities, expressions, and other domain values
	return input.answer === solution?.answer
}
```

Because every exercise defines different fields, interpreted input is initially typed as a record of unknown values. `getInput` retrieves one field, checks its runtime type, and returns the corresponding TypeScript type:

```ts
const count = getInput('count', data, 'number')
const name = getInput('name', data, 'string')
const quantity = getInput('quantity', data, Quantity)
```

Use `getInputs` when several fields share a type or need a matching list of types:

```ts
const [left, right] = getInputs(['left', 'right'], data, 'number')
const [count, quantity] = getInputs(['count', 'quantity'], data, ['number', Quantity])
```

Both helpers throw when a field is missing or has an unexpected type. Interpretation itself is provided by [@step-wise/input-interpretation](https://www.npmjs.com/package/@step-wise/input-interpretation).


## Defining a solution

`getSolution` is optional. If it is absent, `data.solution` is `undefined`, and `checkInput` can compare the interpreted input directly with the parameters:

```ts
checkInput: ({ input, parameters }) => input.answer === parameters.left + parameters.right
```

Most exercises derive their complete solution directly from the parameters:

```ts
getSolution: parameters => ({
	answer: parameters.left + parameters.right,
})
```

The framework always calls `getSolution(parameters, inputDependency, staticSolution)`. Ordinary exercises can omit unused arguments. This keeps simple definitions short while giving input-dependent exercises access to the complete lifecycle.


## Solutions that depend on earlier input

Sometimes the appropriate solution depends on how the learner approached the problem. Such exercises can maintain an input dependency in their state:

```ts
updateInputDependency: ({ previousInputDependency, input }) =>
	input.solveFor === undefined ? previousInputDependency : input.solveFor as 'left' | 'right',

getStaticSolution: parameters => ({
	total: parameters.left + parameters.right,
}),

getSolution: (parameters, solveFor, staticSolution) => {
	if (solveFor === 'left') return { left: staticSolution.total! - parameters.right }
	return { right: staticSolution.total! - parameters.left }
},
```

The lifecycle consists of three optional callbacks. The input dependency initially is `undefined`:

- `getStaticSolution(parameters)` calculates a reusable, input-independent partial solution.
- `updateInputDependency({ parameters, previousInputDependency, staticSolution, input, step })` updates the dependency from the input submitted for the current step. The unsplit main problem uses step `0`.
- `getSolution(parameters, inputDependency, staticSolution)` calculates the dynamic portion of the solution. The framework merges this over the static portion.

All three callbacks may be synchronous or asynchronous. The runtime definition checks enforce these relationships:

- `getStaticSolution` requires `updateInputDependency`.
- `updateInputDependency` requires `getSolution`.

If no updater exists, the resolution helper preserves the previous dependency. Returning `undefined` removes the dependency from state. If no static generator exists, the package supplies `{}` as the static solution. Static fields are automatically included in the final solution; dynamic fields with the same names override them. The builder stores dependencies through the exercise's generic serialization operation, so they may contain registered domain values while persisted exercise state remains plain data. Group mode stores a separate dependency for each participant. An input action may include `adoptUserHistory`, identifying the participant whose work it continues. The reducer then starts from that participant's previous input dependency and stores the updated dependency for the submitting participant. Accumulated input follows these references backward, so chained branches are reconstructed without copying earlier actions.

The package exports focused helpers for consumers implementing the lifecycle:

- `resolveUpdatedInputDependency(definition, data)`
- `resolveStaticSolution(definition, parameters)`
- `resolveSolution(definition, parameters, inputDependency, staticSolution)`


## Looking up previous input

The history helpers accept either solo or group exercise instances:

- `getLastRawInput(instance, userId?, options?)` returns stored input values.
- `getLastInput(exercise, instance, userId?, options?)` returns interpreted values using the exercise's value types.
- `getAccumulatedRawInput(instance, userId?, options?)` combines partial input actions, with later values replacing earlier values for repeated fields.
- `getAccumulatedInput(exercise, instance, userId?, options?)` provides the interpreted version of that combined input.
- `getAccumulatedReport(instance, userId?, options?)` combines reports from the corresponding resolved input actions in the same way.
- `hasPreviousInput(instance, userId?)` reports whether an input exists.
- `getLastRawInputAtStep`, `getLastInputAtStep(exercise, instance, step, userId?, options?)`, and `hasPreviousInputAtStep` provide the corresponding operations for one step.

For group histories, `userId` is required. By default, lookups may return input from a pending group event. Pass `{ resolvedOnly: true }` to ignore pending actions. The accumulated helpers also accept `throughEventIndex` to reconstruct input at an earlier point in the history:

```ts
const input = getAccumulatedInput(exercise, instance, userId, { resolvedOnly: true, throughEventIndex: 4 })
```


## TypeScript types

The main author-facing types are:

- `MonoExerciseSpec` and `MonoExercise` for single-stage exercises.
- `StepExerciseSpec` and `StepExercise` for guided exercises.
- `InputExerciseParameters`, `InputExerciseInput`, and `InputExerciseSolution` for exercise-specific data.
- `CheckInputData` for the object supplied to `checkInput`, including the exercise-bound `areValuesEqual` operation.
- `ValueTypes` for optional domain capabilities on an exercise specification, and `InputExerciseValueOperations` for the operations exposed by a built exercise.
- `GetSolution`, `GetStaticSolution`, and `UpdateInputDependency` for solution generation.
- `StepExerciseSteps`, `StepExerciseState`, and `StepExerciseMetadata` for step structures.
- `InputExerciseAction` and `InputExerciseRawInput` for stored learner actions.

Prefer supplying concrete parameter and solution types to the builders. This gives `generateParameters`, the solution callbacks, and `checkInput` a shared inferred contract.
