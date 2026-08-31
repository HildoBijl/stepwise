# @step-wise/serialization

Convert nested application data containing domain objects into JSON-safe data, and restore those objects after storage or transport.

The package is domain-independent. Applications supply adapters for the domain types they use; ordinary JSON data passes through unchanged.


## Installation

```bash
npm install @step-wise/serialization
```


## Defining and using an adapter

```ts
import { hasOnlyKeys, isPlainObject, isString } from '@step-wise/js-utils'
import { type SerializationAdapter, deserializeData, serializeData } from '@step-wise/serialization'

const LabelType = 'Label'

class Label {
	readonly type = LabelType
	constructor(readonly text: string) {}
}

type SerializedLabel = { type: typeof LabelType, value: string }

const labelAdapter = {
	isDomainValue: (value: unknown): value is Label => value instanceof Label,
	isSerializedValue: (value: unknown): value is SerializedLabel =>
		isPlainObject(value) &&
		hasOnlyKeys(value, ['type', 'value']) &&
		value.type === LabelType &&
		isString(value.value),
	serialize: label => ({ type: LabelType, value: label.text }),
	deserialize: value => new Label(value.value),
} satisfies SerializationAdapter<Label, SerializedLabel>

const adapters = { [LabelType]: labelAdapter }
const data = { labels: [new Label('Important')], complete: true }
const serialized = serializeData(data, adapters)
const restored = deserializeData(serialized, adapters) as typeof data
```

The same registry is used throughout nested arrays and objects. Adapters are checked in both directions: invalid serialized output and invalid deserialized domain output throw.

Domain packages commonly bundle adapter registries through [@step-wise/value-types](https://www.npmjs.com/package/@step-wise/value-types).


## Supported data

`serializeData` and `deserializeData` support:

- `null`, strings, booleans, and finite numbers.
- Dense arrays of supported values.
- Plain objects whose properties contain supported values.
- Domain objects registered in the supplied adapter registry.

Values without a predictable JSON round trip are rejected, including `undefined`, functions, symbols, bigints, `NaN`, infinities, sparse arrays, unsupported class instances, and circular structures.

Repeated non-circular references are allowed, but shared identity is not preserved. During deserialization, objects with unknown type names remain ordinary data and their nested contents are still processed.


## Serializing one domain object

Use `serializeDomainObject(value, adapters)` and `deserializeDomainObject(value, adapters)` when the value is known to be exactly one registered domain object. Unknown types, malformed envelopes, and values rejected by the selected adapter throw.

Public deserialization functions accept `unknown`, validate the envelope and adapter-specific storage form, and only then call the adapter's strongly typed conversion function.


## TypeScript types

The package exports:

- `SerializedData` for recursive JSON-safe output.
- `SerializableDomainObject` for a domain object with a string discriminator.
- `SerializedDomainObject<Type, SerializedValue>` for a plain storage envelope.
- `SerializationAdapter<TDomainValue, TSerialized>` for one domain type's guards and conversions.
- `SerializationAdapters` for a registry keyed by discriminator.
- `isSerializationAdapter` for runtime adapter validation.

Because arbitrary serialized data cannot statically describe the restored domain values, `deserializeData` returns `unknown`. Narrow untrusted data or assert the expected type when loading data produced by your own application.
