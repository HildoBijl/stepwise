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

Mechanics exercise definitions use the private `#valueTypes` import to select only the domain adapters they need:

```ts
import { mechanicsValueTypes } from '#valueTypes'
```

Three ready-made registries are available:

- `mechanicsValueTypes` supports free-body-diagram input and equality, plus Vector serialization for load parameters.
- `mechanicsWithPhysicsValueTypes` additionally supports PrecisionNumber, Unit and Quantity values.
- `mechanicsWithPhysicsAndMathematicsValueTypes` also supports Expression and Equation values.

The same private module exports the individual value types, adapters, and their discriminator constants (`FreeBodyDiagramType`, `VectorType`, `PrecisionNumberType`, `UnitType`, `QuantityType`, `ExpressionType`, and `EquationType`) for exercises that need a custom combination. Use `combineValueTypes` to assemble such a registry; duplicate discriminators are rejected.

## Adding an exercise

Place the definition under its corresponding skill directory and export its bundle through the surrounding index files. The registry path must match the skill's `groupPath` followed by its skill ID.

The central tests in `@step-wise/exercises` validate the registry and generate parameters, initial states and optional solutions for every exported mechanics exercise.
