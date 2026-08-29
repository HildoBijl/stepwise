# @step-wise/serialization

Convert nested application data containing Step-Wise domain objects into JSON-safe data, and restore those objects after storage or transport.

Ordinary JSON data passes through unchanged. Registered values such as expressions, vectors, and physical quantities are converted to plain objects containing a stable `type` and `value`.


## Installation

```bash
npm install @step-wise/serialization
```


## Serializing data

Use `serializeData` for complete data structures. It recursively processes arrays and plain objects and serializes any registered domain objects it encounters:

```ts
import { Quantity } from '@step-wise/physics-core'
import { serializeData } from '@step-wise/serialization'

const data = {
	acceleration: new Quantity('9.81 m/s^2'),
	attempts: [3, 4],
	complete: true,
}

const serialized = serializeData(data)
```

The result contains only JSON-safe data:

```ts
{
	acceleration: {
		type: 'Quantity',
		value: {
			value: {
				number: 9.81,
				significantDigits: 3,
				power: 0,
			},
			unit: {
				numerator: [{ unit: 'm' }],
				denominator: [{ unit: 's', power: 2 }],
			},
		},
	},
	attempts: [3, 4],
	complete: true,
}
```

It can consequently be passed to `JSON.stringify`, stored, and transported normally:

```ts
const json = JSON.stringify(serializeData(data))
```


## Deserializing data

Use `deserializeData` to recursively restore registered domain objects:

```ts
import { deserializeData } from '@step-wise/serialization'

const restored = deserializeData(JSON.parse(json)) as typeof data

restored.acceleration instanceof Quantity // true
```

An object with an unknown `type` remains an ordinary plain object. Its nested contents are still processed. An object with a recognized `type`, however, is treated as a serialized domain object. Malformed data for that type throws an error instead of silently remaining a plain object.


## Supported data

`serializeData` and `deserializeData` support:

- `null`, strings, booleans, and finite numbers.
- Dense arrays of supported values.
- Plain objects whose properties contain supported values.
- Registered Step-Wise domain objects.

Values that cannot safely make a predictable JSON round trip are rejected. This includes `undefined`, functions, symbols, bigints, `NaN`, positive or negative infinity as ordinary numbers, sparse arrays, unsupported class instances, and circular structures.

Repeated references are allowed when they are not circular. Serialization reproduces their data but does not preserve shared object identity.


## Registered domain objects

The package currently recognizes domain objects from:

- [@step-wise/cas](https://www.npmjs.com/package/@step-wise/cas): expressions and equations.
- [@step-wise/geometry](https://www.npmjs.com/package/@step-wise/geometry): vectors, lines, line segments, and rectangles.
- [@step-wise/physics-core](https://www.npmjs.com/package/@step-wise/physics-core): precision numbers, units, and quantities.

The relevant domain package remains responsible for the precise storage representation and validation of each value.


## Serializing one domain object

Most consumers should use `serializeData` and `deserializeData`. When the value is known to be exactly one registered domain object, the lower-level functions are also available:

```ts
import { deserializeDomainObject, serializeDomainObject } from '@step-wise/serialization'

const serializedAcceleration = serializeDomainObject(new Quantity('9.81 m/s^2'))
const acceleration = deserializeDomainObject<Quantity>(serializedAcceleration)
```

`serializeDomainObject` requires a registered, non-plain object with a string `type`. `deserializeDomainObject` requires a plain `{ type, value }` object with a registered type. Both functions throw for unknown types or invalid structures.


## TypeScript types

The package exports the following types:

- `SerializedData` represents the recursive JSON-safe result returned by `serializeData`.
- `SerializableDomainObject` describes a domain object with a string `type` discriminator.
- `SerializedDomainObject<Type, SerializedValue>` describes its plain `{ type, value }` storage representation.
- `SerializationAdapter<TDomainValue, TSerialized>` describes the domain and serialized-value guards together with both conversion functions for one domain type.

Because arbitrary nested serialized data cannot statically describe the precise domain types that `deserializeData` will restore, its return type is `unknown`. Consumers should narrow the result at an untrusted boundary or assert the expected type when loading data produced by their own application.
