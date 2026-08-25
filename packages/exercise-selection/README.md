# @step-wise/exercise-selection

Select an exercise from a collection and create a ready-to-use exercise instance.

The package supports two strategies:

- **Random selection** uses exercise weights and works for any requested exercise mode.
- **Skill-based selection** estimates which solo exercise best suits one learner's current skill levels.

Exercise definitions come from [`@step-wise/exercise-definition`](https://www.npmjs.com/package/@step-wise/exercise-definition), while collections are defined by [`@step-wise/exercise-bundling`](https://www.npmjs.com/package/@step-wise/exercise-bundling).


## Installation

```bash
npm install @step-wise/exercise-selection
```


## Quick start

Use `generateRandomExerciseInstance` when no learner-specific skill data is available:

```ts
import type { ExerciseCollection } from '@step-wise/exercise-bundling'
import { generateRandomExerciseInstance } from '@step-wise/exercise-selection'

const exercises = {
	addition: {
		metadata: { weight: 2 },
		generateParameters: () => ({ left: 2, right: 3 }),
		getInitialState: () => ({ done: false }),
		processSoloAction: ({ action, parameters }) => ({
			done: action.answer === parameters.left + parameters.right,
		}),
	},
} satisfies ExerciseCollection

const instance = generateRandomExerciseInstance(exercises, 'solo')
```

The result contains everything needed to start the exercise:

```ts
{
	exerciseId: 'addition',
	mode: 'solo',
	parameters: { left: 2, right: 3 },
	initialState: { done: false },
	history: [],
}
```


## Random selection

`selectRandomExercise` returns an exercise ID without generating parameters:

```ts
import { selectRandomExercise } from '@step-wise/exercise-selection'

const exerciseId = selectRandomExercise(exercises, 'solo')
```

Only exercises supporting the requested mode participate. A solo-only exercise cannot be selected for group mode, while an exercise implementing both reducers is eligible for both modes.

Selection is random but respects `metadata.weight`. An exercise with weight `2` is twice as likely to be selected as an otherwise equivalent exercise with weight `1`. A weight of `0` excludes an exercise. The default weight is `1`.

To select and immediately instantiate an exercise, use:

```ts
const instance = generateRandomExerciseInstance(
	exercises,
	'group',
	false,
)
```

The optional third argument is the `example` flag passed to the selected exercise's parameter generator. It defaults to `false`.


## Skill-based selection

Skill-based selection chooses a solo exercise for one learner. It uses the skills declared in each exercise's metadata and a `SkillLevelSet` from [`@step-wise/skill-tracking`](https://www.npmjs.com/package/@step-wise/skill-tracking).

```ts
import { selectSkillBasedExercise } from '@step-wise/exercise-selection'

const loadSkillLevelSet = async skillIds => {
	return loadLearnerSkillLevels(skillIds)
}

const exerciseId = await selectSkillBasedExercise(
	exercises,
	loadSkillLevelSet,
)
```

The loader receives all required skill IDs at once. Duplicate IDs are removed before it is called. When none of the candidate exercises declare a skill or setup, no skill data is loaded and every exercise receives the neutral expected success rate `0.5`.

Skill-based selection intentionally considers only exercises supporting solo mode. One learner's skill estimates cannot meaningfully personalize an exercise for an entire group with different skill levels. Group selection should therefore use `selectRandomExercise` or `generateRandomExerciseInstance`.

### Generating the instance

`generateSkillBasedExerciseInstance` combines selection and generation:

```ts
const instance = await generateSkillBasedExerciseInstance(
	exercises,
	loadSkillLevelSet,
	previousExercises,
)
```

The resulting instance always has `mode: 'solo'`. Skill-based generation creates regular exercises rather than examples, so the selected parameter generator receives `false`.


## How skill-based probabilities are calculated

For every candidate, the package estimates the learner's probability of successfully completing its declared `skill` and `setup`. Exercises around the target difficulty are favored: the default selection curve is centered on an expected success rate of `0.4`.

Very unlikely candidates relative to the best candidate are excluded. Exercise weights are then applied, and the remaining scores are normalized to probabilities whose sum is one.

The public `getSelectionProbabilities` function exposes this final calculation when success-rate estimates are already available:

```ts
import { getSelectionProbabilities } from '@step-wise/exercise-selection'

const probabilities = getSelectionProbabilities(
	[0.25, 0.4, 0.7],
	[1, 2, 1],
)
```

Success rates must be finite numbers between `0` and `1`. Weights must have the same length, be finite and non-negative, and leave at least one exercise with a positive selection score. If weights are omitted, every exercise receives weight `1`.


## Avoiding recent repetitions

Skill-based selection optionally receives previous exercises:

```ts
const previousExercises = [
	{
		exerciseId: 'addition',
		createdAt: new Date('2026-08-25T08:00:00Z'),
	},
]

const exerciseId = await selectSkillBasedExercise(
	exercises,
	loadSkillLevelSet,
	previousExercises,
)
```

The `metadata.repeatAfter` value specifies the preferred number of intervening exercises before the same exercise may be selected again. It is a non-negative safe integer and defaults to `1`.

For example, `repeatAfter: 2` prevents an exercise from being selected when fewer than two other exercises have followed its most recent occurrence. If every compatible exercise is blocked, the package treats this as a preference rather than an absolute prohibition and allows compatible exercises to repeat. Selection therefore does not become impossible merely because the available collection is small.

Random selection does not use previous-exercise data or `repeatAfter`.


## Exercise metadata

The following standard metadata influences selection:

| Property | Default | Purpose |
| --- | --- | --- |
| `skill` | None | One directly practiced skill used for estimating success. |
| `setup` | None | A combined skill setup used for estimating success. |
| `setupInferenceOrder` | Skill-tracking default | Optional inference resolution when combining both `skill` and `setup` metadata. |
| `weight` | `1` | Relative probability after suitability scoring. |
| `repeatAfter` | `1` | Preferred number of intervening exercises before repetition. |

Metadata is validated through exercise-definition. Invalid weights, repetition counts, inference orders, skills, or setups are rejected rather than silently replaced.


## Selection versus generation

Use selection functions when only the chosen ID is needed:

```ts
selectRandomExercise(exercises, mode)
selectSkillBasedExercise(exercises, loadSkillLevelSet, previousExercises?)
```

Use generation functions when a complete instance should be created immediately:

```ts
generateRandomExerciseInstance(exercises, mode, example?)
generateSkillBasedExerciseInstance(exercises, loadSkillLevelSet, previousExercises?)
```

Generation calls the selected exercise's parameter and initial-state factories. Both results must be plain objects. The returned history is initially empty.

All functions reject malformed exercise collections. Selection also throws when the collection contains no exercise supporting the required mode.


## TypeScript types

The package exports two supporting types:

- `PreviousExercise` contains the `exerciseId` and `createdAt` date used for repeat avoidance.
- `ExerciseInstance` extends `BaseExerciseInstance` with the selected `exerciseId`. Its mode determines the corresponding history type.
