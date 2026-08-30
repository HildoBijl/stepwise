# @step-wise/physics-exercises

Physics exercise definitions used by Step-Wise. The package groups exercises and examples into a registry that follows the physics section of the Step-Wise skill tree.

For application-level lookup by skill ID, use [@step-wise/exercises](https://www.npmjs.com/package/@step-wise/exercises). Exercise behavior and bundle structures are provided by [@step-wise/exercise-definition](https://www.npmjs.com/package/@step-wise/exercise-definition), [@step-wise/input-exercises](https://www.npmjs.com/package/@step-wise/input-exercises) and [@step-wise/exercise-bundling](https://www.npmjs.com/package/@step-wise/exercise-bundling).


## Installation

```bash
npm install @step-wise/physics-exercises
```


## Exercise registry

The package exports its complete registry as `exercises`:

```ts
import { exercises } from '@step-wise/physics-exercises'

const fundamentals = exercises.fundamentals
const thermodynamics = exercises.thermodynamics
```

The top-level sections are:

- `inputs`
- `fundamentals`
- `physicsMathematics`
- `thermodynamics`

Nested paths mirror the corresponding skill groups. A skill-level entry is a `SkillExerciseBundle` containing an `examples` collection and an `exercises` collection.


## Adding an exercise

Define an exercise under the directory belonging to its skill, add it to that skill's bundle, and export the bundle through the surrounding index files. Import `buildMonoExercise`, `buildStepExercise`, `createStepExerciseMetadata`, and related exercise-building utilities from the private `#exerciseBuilding` module; its builders provide every physics exercise with the shared PrecisionNumber, Unit, and Quantity value types. The resulting registry path must match the skill's `groupPath` followed by its skill ID.

Every exercise must connect to its containing skill through `metadata.skill` or `metadata.setup`. IDs shared by the examples and regular exercises collections must refer to the same exercise definition.

The central tests in `@step-wise/exercises` verify the registry structure and generate one example and one regular parameter set for every exported exercise.
