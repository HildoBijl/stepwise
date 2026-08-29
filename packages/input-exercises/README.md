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
- `generateParameters(example)` creates the fixed problem parameters. It generally uses randomization.
- `getSolution` uses the parameters to build a solution, as well as other useful info for the exercise.
- `checkInput(data)` decides whether the interpreted learner input is correct.

Only `metadata` and `checkInput` are required. Omitting `generateParameters` uses an empty object.

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
	checkInput: data => compareInputValue(
		data.input.answer,
		data.solution?.answer,
		{ key: 'answer', type: 'Expression', data },
	),
})
```

The builders validate the registry and extract its adapters once. Serialization adapters handle generated and stored parameters, input-value adapters interpret every submitted input, and equality adapters are included in `CheckInputData` for grading. An omitted registry is equivalent to an empty one, so the fundamental integer and multiple-choice types continue to work without configuration.

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

For most exercises, `getSolution` can be a function that derives the full solution from the parameters:

```ts
getSolution: parameters => ({
	answer: parameters.left + parameters.right,
})
```

This keeps answer derivation separate from input checking and lets other consumers display or inspect the solution. The solution can also contain other parameters that are useful to render the exercise.


## Solutions that depend on the input

Sometimes the appropriate solution depends on how the learner approached the problem. For example, a learner may choose which unknown to calculate, select a coordinate system, or enter an equivalent intermediate form. In that situation, `getSolution` can be an object:

```ts
getSolution: {
	getStaticSolution: parameters => ({
		total: parameters.left + parameters.right,
	}),
	dependentFields: ['solveFor'],
	getInputDependency: input => input.solveFor as 'left' | 'right',
	getDynamicSolution: (solveFor, staticSolution, parameters) => {
		if (solveFor === 'left') return {
			left: staticSolution.total! - parameters.right,
		}
		return {
			right: staticSolution.total! - parameters.left,
		}
	},
}
```

The fields returned by `getDynamicSolution` are merged into the static solution. Dynamic fields take precedence if both objects contain the same key.

The object form has four parts:

- `getStaticSolution(parameters)` is required and computes everything independent of the learner's input.
- `dependentFields` optionally selects the interpreted input fields relevant to the solution. (Default: all input fields.)
- `getInputDependency(input, staticSolution)` optionally converts those fields into a smaller or more meaningful dependency. (Default: all values of dependent fields.)
- `getDynamicSolution(inputDependency, staticSolution, parameters)` optionally computes the input-dependent solution fields.

The idea is that the input dependency is only recalculated when one of the dependent fields change, and the dynamic solution is only recalculated when the input dependency changes. This can save expensive computations.

Use the exported `resolveSolution(getSolution, parameters, input?)` helper when another consumer needs to resolve either form of solution definition directly.


## Looking up previous input

The history helpers accept either solo or group exercise instances:

- `getLastRawInput(instance, userId?, options?)` returns stored input values.
- `getLastInput(exercise, instance, userId?, options?)` returns interpreted values using the exercise's value types.
- `hasPreviousInput(instance, userId?)` reports whether an input exists.
- `getLastRawInputAtStep`, `getLastInputAtStep(exercise, instance, step, userId?, options?)`, and `hasPreviousInputAtStep` provide the corresponding operations for one step.

For group histories, `userId` is required. By default, lookups may return input from a pending group event. Pass `{ resolvedOnly: true }` to ignore pending actions:

```ts
const input = getLastInput(exercise, instance, userId, { resolvedOnly: true })
```


## Multiple-choice mappings

When generating the parameters of input exercises, the multiple choice mapper is useful to have. `generateMultipleChoiceMapping` selects and optionally shuffles indexes from a larger choice collection:

```ts
const mapping = generateMultipleChoiceMapping({
	numChoices: 6,
	pick: 4,
	include: 2,
	randomOrder: true,
})
```

The result contains four unique indexes and always includes index `2`. `pick` defaults to all choices, `include` defaults to none, and `randomOrder` defaults to `false`. Storing this mapping in the exercise parameters, and later on feeding it to a `MultipleChoiceInput` field, will set up an input field which has consistent options.


## TypeScript types

The main author-facing types are:

- `MonoExerciseSpec` and `MonoExercise` for single-stage exercises.
- `StepExerciseSpec` and `StepExercise` for guided exercises.
- `InputExerciseParameters`, `InputExerciseInput`, and `InputExerciseSolution` for exercise-specific data.
- `CheckInputData` for the object supplied to `checkInput`, including the active equality adapters.
- `ValueTypes` for the optional domain capabilities attached to an exercise.
- `SolutionDefinition` and `DynamicSolutionDefinition` for solution declarations.
- `StepExerciseSteps`, `StepExerciseState`, and `StepExerciseMetadata` for step structures.
- `InputExerciseAction` and `InputExerciseRawInput` for stored learner actions.
- `MultipleChoiceMappingOptions` for multiple-choice generation.

Prefer supplying concrete parameter and solution types to the builders. This gives `generateParameters`, `getSolution`, and `checkInput` a shared inferred contract.
