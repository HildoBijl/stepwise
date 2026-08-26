# @step-wise/mathematics-exercises

Mathematics exercise definitions used by Step-Wise.


## Installation

```bash
npm install @step-wise/mathematics-exercises
```


## Exercise registry

The package exports its complete registry as `exercises`:

```ts
import { exercises } from '@step-wise/mathematics-exercises'

const algebraExercises = exercises.algebra
const geometryExercises = exercises.geometry
```

The top-level sections are:

- `inputs`
- `calculation`
- `algebra`
- `geometry`
- `derivatives`

The registry structure follows the mathematics section of the Step-Wise skill tree. Each skill-level entry is a bundle containing its examples and regular exercises.

Application code should normally retrieve exercise definitions by skill ID through [@step-wise/exercises](https://www.npmjs.com/package/@step-wise/exercises).


## Adding an exercise

Place the definition under its corresponding skill directory and export its bundle through the surrounding index files. The registry path must match the skill's `groupPath` followed by its skill ID.

The central tests in `@step-wise/exercises` validate the registry and generate parameters, initial states and optional solutions for every exported mathematics exercise.
