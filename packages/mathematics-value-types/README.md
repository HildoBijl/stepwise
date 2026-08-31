# @step-wise/mathematics-value-types

Connect the [Step-Wise CAS](https://www.npmjs.com/package/@step-wise/cas) to input interpretation, serialization, and value equality. The package keeps these application-facing adapters outside the CAS itself, so the CAS remains independent of the exercise infrastructure.


## Installation

```bash
npm install @step-wise/mathematics-value-types
```


## Available value types

The package provides complete value types for both mathematical domain objects:

| Export | Discriminator | Domain value |
| --- | --- | --- |
| `expressionValueType` | `Expression` | `Expression` |
| `equationValueType` | `Equation` | `Equation` |

Each value type contains:

- An input-value adapter for converting between CAS objects and editable input values.
- A serialization adapter for storing and restoring CAS objects with their settings.
- An equality adapter that validates and applies the corresponding CAS equality options.

The individual `expressionInputValueAdapter`, `expressionSerializationAdapter`, `expressionEqualityAdapter`, and Equation equivalents are also exported for consumers that need one capability directly.


## Using all mathematics value types

Most mathematics exercises can supply the combined registry:

```ts
import { mathematicsValueTypes } from '@step-wise/mathematics-value-types'
import { buildMonoExercise } from '@step-wise/input-exercises'

export default buildMonoExercise({
	metadata: {},
	valueTypes: mathematicsValueTypes,
	generateParameters: () => ({ /* ... */ }),
	checkInput: data => { /* ... */ },
})
```

`mathematicsValueTypes` contains both Expression and Equation. Input-exercise builders capture its adapters behind the built exercise's parameter deserialization, input interpretation, input-value conversion, and equality operations.


## Using one value type

Consumers that only need one CAS domain type can create a smaller registry:

```ts
import { ExpressionType, expressionValueType } from '@step-wise/mathematics-value-types'

const valueTypes = {
	[ExpressionType]: expressionValueType,
}
```

Registries can also be combined with other subjects through `combineValueTypes` from [@step-wise/value-types](https://www.npmjs.com/package/@step-wise/value-types).


## Dependency direction

This package depends on the CAS and the generic adapter-contract packages. The CAS does not depend on this package, input exercises, serialization, interpretation, or grading.

That separation lets non-exercise CAS consumers use algebra functionality without loading exercise infrastructure, while exercises opt into mathematical adapters explicitly.
