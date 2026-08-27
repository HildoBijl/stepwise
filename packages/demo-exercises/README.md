# @step-wise/demo-exercises

Demo exercise definitions used to showcase and test Step-Wise exercise behavior.


## Installation

```bash
npm install @step-wise/demo-exercises
```


## Exercise registry

The package exports its complete registry as `exercises`:

```ts
import { exercises } from '@step-wise/demo-exercises'

const inputExercises = exercises.inputs
const stepExercises = exercises.stepExercises
```

The registry structure follows the demo section of the Step-Wise skill tree. Each skill-level entry is a bundle containing its examples and regular exercises.

Application code should normally retrieve these definitions by skill ID through [@step-wise/exercises](https://www.npmjs.com/package/@step-wise/exercises).


## Adding an exercise

Place the definition under its corresponding skill directory and export its bundle through the surrounding index files. The registry path must match the skill's `groupPath` followed by its skill ID.

The central tests in `@step-wise/exercises` validate the registry and generate parameters, initial states and optional solutions for every exported demo exercise.
