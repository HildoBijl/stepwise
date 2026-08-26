# @step-wise/exercises

Access the complete Step-Wise exercise registry and retrieve the examples and regular exercises belonging to a skill.

This package combines the concrete exercise collections from mathematics, mechanics, physics and demonstration packages. Exercise structures are defined by [@step-wise/exercise-definition](https://www.npmjs.com/package/@step-wise/exercise-definition), while collections and skill bundles are defined by [@step-wise/exercise-bundling](https://www.npmjs.com/package/@step-wise/exercise-bundling).


## Installation

```bash
npm install @step-wise/exercises
```


## Quick start

Use a skill ID to retrieve its exercises:

```ts
import { getExamples, getExercises, getExercise } from '@step-wise/exercises'

const examples = getExamples('specificHeatRatio')
const exercises = getExercises('specificHeatRatio')
const exercise = getExercise('specificHeatRatio', 'specificHeatRatio')
```

Skill IDs are resolved through [@step-wise/skill-tree](https://www.npmjs.com/package/@step-wise/skill-tree). An unknown skill ID throws. A known skill without a corresponding exercise bundle returns `undefined` from `getExamples` and `getExercises`.


## Exercise registry

The `exercises` namespace contains the complete registry:

```ts
import { exercises } from '@step-wise/exercises'

const physicsExercises = exercises.physics
const mathematicsExercises = exercises.mathematics
```

The registry combines these subject namespaces:

- `mathematics`
- `mechanics`
- `physics`
- `demo`

Its nested structure follows each skill's `groupPath` from the skill tree, followed by the skill ID. The value at that path is a `SkillExerciseBundle` containing `examples` and `exercises` collections. This alignment lets callers look up exercises by skill ID without knowing where a subject package stores them.


## Querying collections

### `getExercises(skillId)`

Returns the regular `ExerciseCollection` for a skill, or `undefined` when that skill has no exercise bundle.

```ts
const collection = getExercises('specificHeatRatio')
```

### `getExamples(skillId)`

Returns the example collection for a skill, with the same `undefined` behavior.

```ts
const examples = getExamples('specificHeatRatio')
```

### `hasExercises(skillId)` and `hasExamples(skillId)`

Report whether the corresponding collection exists and contains at least one definition:

```ts
if (hasExamples(skillId)) {
	const examples = getExamples(skillId)
}
```

A missing bundle and an empty collection both produce `false`.


## Combining and selecting exercises

`getAllExercises(skillId)` returns a single collection containing both examples and regular exercises:

```ts
import { getAllExercises } from '@step-wise/exercises'

const availableExercises = getAllExercises('specificHeatRatio')
```

It returns an empty collection when the skill has no bundle. When an ID occurs in both collections, both entries must refer to the same exercise definition. A collision between different definitions throws instead of silently choosing one.

Use `getExercise(skillId, exerciseId)` to retrieve one definition from this combined collection:

```ts
const exercise = getExercise('specificHeatRatio', 'specificHeatRatio')

if (exercise === undefined) {
	// The skill exists, but this exercise ID does not.
}
```


## Validation and immutability

Collections are validated when queried. A bundle must be a plain object, and its `examples` and `exercises` properties must be valid `ExerciseCollection` values. Invalid registry entries throw with the affected skill ID and collection name.

Returned bundles and collections are frozen. `getAllExercises` creates and freezes a new combined collection; it does not modify either source collection.


## Adding exercises

Exercise definitions belong in the relevant subject package rather than this aggregate package. Export each skill's `SkillExerciseBundle` at the path described by its skill-tree `groupPath` and skill ID, then expose that subject registry through its package-level `exercises` export.

The central registry tests verify that:

- Registry paths correspond to skills in the skill tree.
- Every bundle contains valid examples and exercises collections.
- Exercises are connected to their containing skill through `metadata.skill` or `metadata.setup`.
- Examples and regular exercises generate valid parameters and initial state.
- Optional input-exercise solutions resolve to plain objects.
- IDs shared by examples and exercises use the same definition.
