# @step-wise/engineering-mechanics

`@step-wise/engineering-mechanics` provides immutable representations of two-dimensional forces and moments, together with utilities for creation, validation, serialization, reversal, force decomposition, configurable comparison and deterministic load naming. It is intended for visual free-body diagrams and other educational engineering-mechanics tools.


## Installation

```bash
npm install @step-wise/engineering-mechanics
```


## Quick start

```ts
import { createForce, createMoment, decomposeForceIntoAxisComponents, loadsEqual } from '@step-wise/engineering-mechanics'

const force = createForce({
	position: [2, 1],
	angle: Math.PI / 4,
})

const moment = createMoment({
	position: [0, 0],
	clockwise: true,
})

force.position.coordinates // [2, 1]
force.relativeMagnitude // 1
moment.openingDirection // 0

decomposeForceIntoAxisComponents(force) // One horizontal and one vertical force
loadsEqual(force, createForce({ position: [2, 1], angle: Math.PI / 4 })) // true
```

Created loads and names are immutable and frozen. Operations return new canonical objects when they change a value and preserve an existing canonical object when no reconstruction is needed.


## Loads

The package represents two load types: `Force` and `Moment`. Their public discriminators are `ForceType` and `MomentType`, and their union is `Load`.

### Forces

A force has a two-dimensional application position, a direction angle, the arrow endpoint at which the application point lies and a relative graphical magnitude.

```ts
import { createForce } from '@step-wise/engineering-mechanics'

const force = createForce({
	position: [1, 2],
	angle: -Math.PI / 2,
	applicationPointAt: 'start',
	relativeMagnitude: 1.5,
})

force.angle // 3 * Math.PI / 2
force.applicationPointAt // 'start'
```

`angle` is measured counterclockwise in radians from the positive x-axis and is normalized to the interval from zero inclusive to `2 * Math.PI` exclusive. `applicationPointAt` is either `'start'` or `'end'` and defaults to `'end'`. `relativeMagnitude` must be positive and defaults to `1`; it controls relative graphical or decomposed size rather than representing a dimensioned physical magnitude.

### Moments

A moment has a two-dimensional position, a clockwise direction and an opening direction for rendering its circular arrow.

```ts
import { createMoment } from '@step-wise/engineering-mechanics'

const moment = createMoment({
	position: [3, 1],
	clockwise: false,
	openingDirection: Math.PI,
})
```

`openingDirection` specifies the angular position of the gap in the moment arrow. It is measured in radians, normalized like force angles and defaults to zero. It does not describe the angular width of the gap.

### Creation and validation

Use `createForce`, `createMoment` and `createLoad` to validate convenient input values and produce canonical loads. Positions must be two-dimensional. Invalid booleans, non-finite angles, unknown load discriminators, unsupported application-point positions and non-positive relative magnitudes throw.

`isForce`, `isMoment` and `isLoad` are runtime type guards for already canonical objects. The package exports the corresponding `ForceInput`, `MomentInput` and `LoadInput` types for creation boundaries.


## Load relationships and manipulation

`isLoadAtPoint(load, point)` checks the load position using the geometry package's tolerant vector equality.

`reverseForce` rotates a force direction by half a turn, while `reverseMoment` changes its clockwise direction. `reverseLoad` dispatches to the appropriate operation for a general load. Position and other representational properties are preserved.

```ts
import { reverseLoad } from '@step-wise/engineering-mechanics'

const reversed = reverseLoad(force)
reversed.angle // force.angle shifted by Math.PI and normalized
```

`decomposeForceIntoAxisComponents(force)` resolves a force into its horizontal and vertical components. The component directions retain the appropriate signs, and their `relativeMagnitude` values are scaled by the absolute cosine and sine of the original direction.

```ts
const components = decomposeForceIntoAxisComponents(createForce({
	position: [0, 0],
	angle: Math.PI / 4,
	relativeMagnitude: 2,
}))

components.map(component => component.relativeMagnitude) // approximately [Math.SQRT2, Math.SQRT2]
```

Zero components, including values that are zero within floating-point tolerance, are omitted. Consequently, an axis-aligned force returns one component rather than a zero-magnitude second force.


## Comparing loads

`compareForces`, `compareMoments` and `compareLoads` return a `LoadComparisonReport` containing `equal` and a list of structured differences. `loadsEqual` returns only the resulting boolean.

```ts
import { compareLoads, loadsEqual } from '@step-wise/engineering-mechanics'

const input = createForce({ position: [2, 0], angle: Math.PI })
const solution = createForce({ position: [0, 0], angle: 0 })

loadsEqual(input, solution, {
	force: {
		position: 'sameLine',
		direction: 'parallel',
		applicationPointAt: 'ignore',
	},
}) // true

compareLoads(input, solution).differences
```

Force position comparison supports `'equal'`, `'sameLine'` and `'ignore'`. Direction supports `'equal'`, `'parallel'` and `'ignore'`, while application-point placement supports `'equal'` and `'ignore'`. Requiring the same line while ignoring direction is rejected because a force line cannot be established without its direction.

Moment position, clockwise direction and opening direction each support `'equal'` and `'ignore'`. Angle comparisons account for wrapping and ordinary floating-point noise.

`relativeMagnitude` is deliberately not part of load equality. It describes graphical or decomposition scaling, not a physical load value to grade.

### Comparison options

Comparison settings distinguish partial caller input from complete resolved options:

- `ForceComparisonOptionsInput` resolves to `ForceComparisonOptions`.
- `MomentComparisonOptionsInput` resolves to `MomentComparisonOptions`.
- `LoadComparisonOptionsInput` resolves to `LoadComparisonOptions`.

Use `resolveForceComparisonOptions`, `resolveMomentComparisonOptions` or `resolveLoadComparisonOptions` when a complete frozen configuration is needed. `defaultLoadComparisonOptions` requires ordinary equality for every represented property.

`freeBodyDiagramComparisonOptions` is the standard free-body-diagram preset. It requires the same force application position but accepts either parallel direction and either arrow endpoint placement, and it ignores moment direction and opening direction while retaining moment positions.


## Comparing load lists

`compareLoadLists(input, solution, options)` compares two unordered lists using one-to-one matching. Duplicate loads remain significant, so these are lists rather than mathematical sets.

```ts
import { compareLoadLists, loadListsEqual } from '@step-wise/engineering-mechanics'

const report = compareLoadLists([force, moment], [moment, force])

report.equal // true
report.inputMatching // [1, 0]
report.solutionMatching // [1, 0]
loadListsEqual([force, moment], [moment, force]) // true
```

The returned `LoadListComparisonReport` contains matching indices in both directions. Unmatched entries are represented by `undefined`. Lists are equal only when their lengths match and every input load has a unique match.


## Named points and loads

A `NamedPoint` combines a non-empty name with a two-dimensional position. A `LoadName` contains a required symbol and optional point and suffix components. A `NamedLoad` combines a canonical load with a canonical name.

```ts
import { createLoadName, createNamedLoad, createNamedPoint, getLoadNameSubscript } from '@step-wise/engineering-mechanics'

const point = createNamedPoint({ name: 'A', position: [0, 0] })
const name = createLoadName({ symbol: 'F', point: 'A', suffix: 'x' })
const namedLoad = createNamedLoad({ load: force, name })

getLoadNameSubscript(name) // 'Ax'
```

Suffixes may be non-empty strings or finite numbers. `getLoadNameSubscript` concatenates the point and suffix and returns `undefined` when neither exists. Use `isNamedPoint`, `isLoadName` and `isNamedLoad` as runtime type guards.


## Deriving load names

`deriveLoadNames(loads, points?, predefinedNamedLoads?, options?)` assigns deterministic names to a load list.

```ts
import { deriveLoadNames } from '@step-wise/engineering-mechanics'

const namedLoads = deriveLoadNames(
	[
		createForce({ position: [0, 0], angle: 0 }),
		createForce({ position: [0, 0], angle: Math.PI / 2 }),
		createMoment({ position: [0, 0], clockwise: true }),
	],
	[{ name: 'A', position: [0, 0] }],
)

namedLoads.map(({ name }) => name)
// [
//   { symbol: 'F', point: 'A', suffix: 'x' },
//   { symbol: 'F', point: 'A', suffix: 'y' },
//   { symbol: 'M', point: 'A' },
// ]
```

A single force or moment at a point receives the point name directly. One horizontal and one vertical force receive `x` and `y` suffixes. Other groups are numbered in deterministic direction order. Loads not associated with a named point are named without a point component.

Predefined named loads are matched first and at most once. `predefinedLoadComparison` controls their matching behavior, while `forceSymbol` and `momentSymbol` override the default `F` and `M`. Unmatched predefined loads are ignored. Duplicate point names, duplicate point positions and duplicate rendered load names throw instead of producing ambiguous output.


## Serialization

`serializeForce`, `serializeMoment` and `serializeLoad` produce compact storage objects using the `Force` or `Moment` discriminator. Their matching deserializers accept `unknown`, validate the complete structure and return canonical immutable loads.

```ts
import { deserializeLoad, serializeLoad } from '@step-wise/engineering-mechanics'

const serialized = serializeLoad(force)
// {
//   type: 'Force',
//   position: [2, 1],
//   angle: Math.PI / 4,
//   applicationPointAt: 'end',
//   relativeMagnitude: 1,
// }

deserializeLoad(serialized)
```

Deserialization rejects unknown discriminators, missing or additional properties, malformed coordinates, invalid dimensions, non-finite angles, invalid booleans and non-positive relative magnitudes. The exported storage types are `SerializedForce`, `SerializedMoment` and `SerializedLoad`.


## Errors and constraints

Loads are currently restricted to two dimensions. All angles use radians. Creation and deserialization throw on malformed or inconsistent input rather than silently substituting values, while omitted optional creation properties receive their documented defaults.

Geometric and angular comparisons account for ordinary floating-point noise. This tolerance is intended for calculation artifacts and does not make meaningfully different loads equal.


## TypeScript

The package includes TypeScript declarations for load inputs, canonical loads, serialization values, comparison inputs, resolved comparison options, reports and named-load structures. Canonical domain properties are readonly, and constructed objects are frozen at runtime.
