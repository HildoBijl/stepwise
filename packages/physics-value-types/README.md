# @step-wise/physics-value-types

Connect [@step-wise/physics-core](https://www.npmjs.com/package/@step-wise/physics-core) to input interpretation, serialization, and value equality. The integration stays outside the physics engine so applications only load these exercise-facing adapters when they explicitly need them.


## Installation

```bash
npm install @step-wise/physics-value-types
```


## Available value types

The package provides complete value types for the three physics-core domain objects:

| Export | Discriminator | Domain value |
| --- | --- | --- |
| `precisionNumberValueType` | `PrecisionNumber` | `PrecisionNumber` |
| `unitValueType` | `Unit` | `Unit` |
| `quantityValueType` | `Quantity` | `Quantity` |

Each value type contains:

- An input-value adapter for converting between domain objects and editable input values.
- A serialization adapter for storing and restoring domain objects without losing precision or unit structure.
- An equality adapter that validates and applies the corresponding physics-core equality options.

The individual input-value, serialization, and equality adapters are also exported for consumers that need one capability directly. `PrecisionNumberType`, `UnitType`, and `QuantityType` are re-exported as well.


## Using all physics value types

Most physics exercises can supply the combined registry:

```ts
import { buildMonoExercise } from '@step-wise/input-exercises'
import { physicsValueTypes } from '@step-wise/physics-value-types'

export default buildMonoExercise({
	metadata: {},
	valueTypes: physicsValueTypes,
	generateParameters: () => ({ /* ... */ }),
	checkInput: data => { /* ... */ },
})
```

`physicsValueTypes` contains PrecisionNumber, Unit, and Quantity. Input exercises extract and pass its adapters to input interpretation, serialization, and equality checking.


## Using one value type

Consumers that only need one domain type can create a smaller registry without importing its discriminator separately:

```ts
import { QuantityType, quantityValueType } from '@step-wise/physics-value-types'

const valueTypes = {
	[QuantityType]: quantityValueType,
}
```

Registries can be combined with mathematics or private mechanics integrations through `combineValueTypes` from [@step-wise/value-types](https://www.npmjs.com/package/@step-wise/value-types).


## Dependency direction

This package depends on physics-core and the generic adapter-contract packages. Physics-core does not depend on this package or on the exercise infrastructure.

That separation lets physics tools use quantities, units, and precision numbers independently, while exercises opt into their interpretation, serialization, and comparison adapters explicitly.
