# @step-wise/value-types

Combine the independent adapters that let application-specific values participate in input interpretation, serialization, and equality checks. The package contains only adapter composition infrastructure; domain-specific value types live in separate integration packages or private exercise tooling.


## Installation

```bash
npm install @step-wise/value-types
```


## Defining a value type

A value type groups the available capabilities for one type discriminator:

```ts
import type { ValueType } from '@step-wise/value-types'

const expressionValueType = {
	inputValue: expressionInputValueAdapter,
	serialization: expressionSerializationAdapter,
	equality: expressionEqualityAdapter,
} satisfies ValueType
```

All three capabilities are optional. A type used only in stored exercise parameters can provide serialization alone, while a type used only for student input can provide input interpretation and equality:

```ts
const vectorValueType = {
	serialization: vectorSerializationAdapter,
} satisfies ValueType

const freeBodyDiagramValueType = {
	inputValue: freeBodyDiagramInputValueAdapter,
	equality: freeBodyDiagramEqualityAdapter,
} satisfies ValueType
```

The adapter contracts remain owned by their respective packages:

- `InputValueAdapter` comes from [@step-wise/input-interpretation](https://www.npmjs.com/package/@step-wise/input-interpretation).
- `SerializationAdapter` comes from [@step-wise/serialization](https://www.npmjs.com/package/@step-wise/serialization).
- `ValueEqualityAdapter` comes from [@step-wise/value-equality](https://www.npmjs.com/package/@step-wise/value-equality).

This package imports and combines those contracts instead of redefining them.


## Creating a registry

Key value types by the discriminator used for the corresponding input, serialized, and domain values:

```ts
import type { ValueTypes } from '@step-wise/value-types'

const mathematicsValueTypes = {
	Expression: expressionValueType,
	Equation: equationValueType,
} satisfies ValueTypes
```

The registry key is authoritative. The current adapter contracts do not carry a separate type discriminator themselves, so `value-types` cannot independently verify that an adapter was placed under the intended key.

No domain-specific value types are built into this package.


## Combining registries

Use `combineValueTypes` when an exercise needs capabilities from multiple domains:

```ts
import { combineValueTypes } from '@step-wise/value-types'

const valueTypes = combineValueTypes(
	mathematicsValueTypes,
	physicsValueTypes,
	mechanicsValueTypes,
)
```

The helper returns a new registry and preserves the value-type definitions themselves. It throws when two registries contain the same type key, even if both keys reference the same definition. This prevents one domain integration from silently overriding another.

Malformed registries, unknown capability names, and incomplete adapters are also rejected. `isValueType` and `isValueTypes` expose the same validation as type guards. They delegate each supplied adapter to the guard owned by its capability package, so changes to an adapter contract remain defined in one place.


## Extracting adapter registries

The receiving orchestration layer can derive the registry required by each capability package:

```ts
import { extractValueTypeAdapters } from '@step-wise/value-types'

const {
	inputValueAdapters,
	serializationAdapters,
	equalityAdapters,
} = extractValueTypeAdapters(valueTypes)
```

The combined helper validates the complete registry once and includes only value types that provide each requested capability. The individual `extractInputValueAdapters`, `extractSerializationAdapters`, and `extractValueEqualityAdapters` helpers remain available when only one capability is needed. Empty and partial value types are allowed.

These helpers are intended for orchestration packages such as `input-exercises`. Domain packages should generally define adapters, while orchestration packages decide which adapters are active for a particular exercise.


## Dependency direction

`value-types` directly depends only on the three capability packages and generic JavaScript utilities. It does not define or directly import the CAS, physics engine, geometry tools, mechanics engine, exercise grading, or input exercises.

During the migration, the capability packages still contain built-in domain adapters and therefore retain temporary transitive domain dependencies. Once those adapters move into domain integration packages, an exercise bundle will import only the integrations whose value types it actually uses.


## TypeScript types

The main public types are:

- `ValueType`, an optional combination of input-value, serialization, and equality adapters for one discriminator.
- `ValueTypes`, a registry of value types keyed by discriminator.
- `ValueTypeAdapters`, the three extracted capability registries.
- `isValueType` and `isValueTypes`, runtime guards for definitions and registries.

The package also reuses the erased heterogeneous-registry types owned by each capability package. It does not weaken the strongly typed adapter definitions used when creating individual value types.
