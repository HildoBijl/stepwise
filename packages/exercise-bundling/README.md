# @step-wise/exercise-bundling

Organize exercise definitions into named collections and bundle the exercises and examples belonging to a skill.

Exercise behavior itself is defined by [@step-wise/exercise-definition](https://www.npmjs.com/package/@step-wise/exercise-definition). This package adds the structures used to group those definitions for selection and discovery.


## Installation

```bash
npm install @step-wise/exercise-bundling
```


## Quick start

An `ExerciseCollection` maps stable exercise IDs to exercise definitions:

```ts
import type { Exercise } from '@step-wise/exercise-definition'
import type { ExerciseCollection } from '@step-wise/exercise-bundling'

type AdditionParameters = { left: number, right: number }
type AdditionAction = { type: 'answer', answer: number }
type AdditionState = { done: boolean }

const additionExercise = {
	metaData: {},
	generateParameters: () => ({ left: 2, right: 3 }),
	getInitialState: () => ({ done: false }),
	processSoloAction: ({ action, parameters }) => ({
		done: action.answer === parameters.left + parameters.right,
	}),
} satisfies Exercise<{}, AdditionAction, AdditionState, AdditionParameters>

const exercises = {
	addition: additionExercise,
} satisfies ExerciseCollection
```

The collection key is the exercise ID. IDs must be non-empty and may not start or end with whitespace. Their casing is preserved and comparisons are case-sensitive.


## Skill exercise bundles

A `SkillExerciseBundle` contains the regular exercises and examples associated with one skill:

```ts
import type { SkillExerciseBundle } from '@step-wise/exercise-bundling'

const skillExercises = {
	exercises: {
		addition: additionExercise,
	},
	examples: {
		addition: additionExercise,
	},
} satisfies SkillExerciseBundle
```

Both collections may be empty. An exercise may also appear in both collections.


## Using the same exercises as examples

Use `withSameExamples` when every exercise can also serve as an example:

```ts
import { withSameExamples } from '@step-wise/exercise-bundling'

const skillExercises = withSameExamples({
	addition: additionExercise,
})
```

This is equivalent to:

```ts
const exercises = { addition: additionExercise }

const skillExercises = {
	exercises,
	examples: exercises,
}
```


## Validation

Use `isExerciseCollection(value)` when reading a collection from an unknown boundary:

```ts
import { isExerciseCollection } from '@step-wise/exercise-bundling'

if (!isExerciseCollection(value)) throw new TypeError('Expected an exercise collection.')
```

The guard checks that:

- The collection is a plain object.
- Every ID is non-empty and has no leading or trailing whitespace.
- Every value satisfies the exercise format from `@step-wise/exercise-definition`.

An empty object is a valid exercise collection. Use `isEmptyExerciseCollection(collection)` when the caller requires at least one exercise:

```ts
import { isEmptyExerciseCollection } from '@step-wise/exercise-bundling'

isEmptyExerciseCollection({}) // true
isEmptyExerciseCollection(undefined) // true
isEmptyExerciseCollection({ addition: additionExercise }) // false
```


## TypeScript types

The package exports the following types for collection and bundle declarations:

- `ExerciseId` is the string identifier used as an exercise collection key.
- `ExerciseCollection` is a `Record<ExerciseId, AnyExercise>`.
- `SkillExerciseBundle<T>` contains `exercises` and `examples`, both of type `T`. Its generic parameter defaults to `ExerciseCollection`.

Use `satisfies ExerciseCollection` for standalone collections and `satisfies SkillExerciseBundle` for complete skill exports. This validates their structure without discarding the concrete exercise IDs and exercise types inferred by TypeScript.
