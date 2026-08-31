# @step-wise/mechanics-exercises

Engineering-mechanics exercise definitions used by Step-Wise.


## Installation

```bash
npm install @step-wise/mechanics-exercises
```


## Exercise registry

The package exports its complete registry as `exercises`:

```ts
import { exercises } from '@step-wise/mechanics-exercises'

const equilibriumExercises = exercises.equilibrium
const supportReactionExercises = exercises.supportReactions
```

The registry structure follows the mechanics section of the Step-Wise skill tree. Each skill-level entry is a bundle containing its examples and regular exercises.

Application code should normally retrieve exercise definitions by skill ID through [@step-wise/exercises](https://www.npmjs.com/package/@step-wise/exercises).


## Load-name variables

`loadNameToVariable` converts an engineering-mechanics load name into the corresponding CAS expression:

```ts
import { loadNameToVariable } from '@step-wise/mechanics-exercises'

loadNameToVariable({ symbol: 'F', point: 'A', suffix: 'x' }).toString()
// 'F_(Ax)'
```


## Exercise value types

Mechanics exercise definitions select their adapters through private exercise-building entry points. Current exercises use:

- `#exerciseBuilding/freeBodyDiagram` for FreeBodyDiagram input and equality.
- `#exerciseBuilding/freeBodyDiagramPhysics` when the diagram exercise also uses PrecisionNumber, Unit or Quantity values.
- `#exerciseBuilding/vectorPhysics` when Vector parameters and physics values are needed without FreeBodyDiagram input.

Each entry point exposes the usual builder names and applies its registry before the exercise reducers capture their adapters. The general `#exerciseBuilding` entry point exports `createExerciseBuilders` for future combinations.

The private `#valueTypes` module exposes atomic `freeBodyDiagramValueTypes` and `vectorValueTypes` registries, the physics and mathematics subject registries, and useful existing combinations. Subpath imports such as `#valueTypes/physicsValueTypes` load only the selected internal module. The respective modules also reexport their discriminator constants.

Use `combineValueTypes` to assemble an unusual combination; duplicate discriminators are rejected.


## Adding an exercise

Place the definition under its corresponding skill directory and export its bundle through the surrounding index files. The registry path must match the skill's `groupPath` followed by its skill ID.

The central tests in `@step-wise/exercises` validate the registry and generate parameters, initial states and optional solutions for every exported mechanics exercise.
