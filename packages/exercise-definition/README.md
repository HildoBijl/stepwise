# @step-wise/exercise-definition

Define educational exercises as reducers. An exercise receives its current state and an action, then returns its next state. The package supplies the shared types and history utilities needed to run this model in solo and group settings.


## Installation

```bash
npm install @step-wise/exercise-definition
```


## Quick start

A solo exercise is centered on `processSoloAction`:

```ts
import type { Exercise } from '@step-wise/exercise-definition'

type Parameters = { target: number }
type Action = { type: 'answer', value: number }
type State = { attempts: number, done?: boolean }

const exercise: Exercise<{}, Action, State, Parameters> = {
	metaData: {},
	generateParameters: () => ({ target: 6 }),
	getInitialState: () => ({ attempts: 0 }),
	processSoloAction: ({ action, state, parameters }) => ({
		attempts: state.attempts + 1,
		done: action.value === parameters.target,
	}),
}
```

Reducers should return a new state without modifying the old one:

```ts
const state = exercise.processSoloAction!({
	action: { type: 'answer', value: 6 },
	state: { attempts: 0 },
	parameters: { target: 6 },
	history: [],
})
// { attempts: 1, done: true }
```


## The reducer model

At its core, an exercise is a state transition:

```text
current state + action -> new state
```

`processSoloAction` receives one action and returns the resulting state. Its input also provides the (fixed) exercise parameters, the exercise history, and an optional `updateSkills` callback.

The action describes what happened, while the state stores the consequences. For example, an answer is an action; whether the exercise is complete belongs in the state. An exercise is considered completed when the state satisfies `state.done === true`.

The reducer model is not restricted to solo use. An exercise can supply reducers for other execution modes. The built-in group mode uses `processGroupActions`, which processes a collection of user-attributed actions together. The mode registry and mode-specific history types keep this structure extendable if more modes are introduced later.

An exercise must support at least one mode at runtime. It may support solo mode, group mode, or both.


## Parameters, actions, and state

The package distinguishes three kinds of exercise data:

- **Parameters** describe the generated problem and remain fixed for an exercise instance.
- **Actions** describe events to process, such as entering an answer or giving up.
- **State** records the accumulated result of processing those actions.

All three use plain data objects so they can be stored and transferred safely. Every action must have a string `type` property.

`generateParameters(example)` creates the parameters for a new exercise. The boolean `example` flag allows a generator to distinguish (possibly simplified) examples from regular exercises.

`getInitialState(parameters)` derives the state before the first action.

When defining a higher-level exercise specification, both factories may be omitted, in which case they default to `() => ({})`.


## Solo mode

A solo reducer receives one action:

```ts
processSoloAction: ({
	action,
	state,
	parameters,
	history,
	updateSkills,
}) => newState
```

Each solo history event stores the processed action and resulting state:

```ts
{
	action: { type: 'answer', value: 6 },
	state: { attempts: 1, done: true },
}
```


## Group mode

A group reducer receives all actions collected for the current event:

```ts
processGroupActions: ({
	actions,
	state,
	parameters,
	history,
	updateSkills,
}) => newState
```

Every item in `actions` is a `UserExerciseAction` containing the user attribution and raw exercise action:

```ts
{
	userId: 'user-1',
	action: { type: 'answer', value: 6 },
}
```

A pending group history event contains only `actions`. Once the event has been processed, its resulting `state` is added:

```ts
// Pending
{ actions: [{ userId: 'user-1', action: { type: 'answer', value: 6 } }] }

// Resolved
{
	actions: [{ userId: 'user-1', action: { type: 'answer', value: 6 } }],
	state: { attempts: 1, done: true },
}
```


## Exercise instances and history

A `BaseExerciseInstance` combines the generated data with its execution context:

```ts
{
	mode: 'solo' | 'group',
	parameters,
	initialState,
	history,
}
```

The `mode` determines the history shape. `initialState` remains stored separately and is used whenever the history does not yet contain a suitable resolved state.

The following helpers work with either mode:

- `getCurrentState(instance)` returns the latest resolved state or the initial state.
- `getPreviousState(instance)` returns the state before the current resolved state, falling back to the initial state.
- `getLastAction(instance, userId?)` returns the latest action, including one in a pending group event.
- `getLastResolvedAction(instance, userId?)` ignores pending group events.
- `isExerciseDone(instance)` checks whether the current state has `done: true`.
- `isStateDone(state)` performs the same check directly on a state.

Group action lookups require a `userId` and throw when it is missing. Solo action lookups ignore it.


## Metadata and skill updates

`ExerciseMetadata` can describe how an exercise relates to the surrounding learning system:

- `skill` identifies one directly practiced skill.
- `setup` describes a more involved skill setup.
- `setupInferenceOrder`, `weight`, and `repeatAfter` provide exercise-selection metadata.

Reducers may call the optional `updateSkills(setup, correct, userId?)` function supplied in their input. A group reducer can provide the relevant user ID for each update.

See [@step-wise/skill-setup](https://www.npmjs.com/package/@step-wise/skill-setup) for constructing combined skill requirements.


## Specifications and validation

`ExerciseSpec` describes author-provided metadata and optional parameter/state factories. `Exercise` represents the resolved form used at runtime: its factories are present and it supplies at least one reducer.

- `isExerciseSpec(value)` checks the specification structure.
- `isExercise(value)` checks the resolved factories and verifies that a reducer exists for at least one registered mode.

These guards validate the general exercise structure. Individual exercise types remain responsible for validating their own parameters, actions, and state.


## Specialized exercise types

This package deliberately defines only the general reducer model. More opinionated packages can build author-friendly exercise types on top of it. For exercises that interpret and grade learner input, see [@step-wise/input-exercises](https://www.npmjs.com/package/@step-wise/input-exercises).
