# @step-wise/engineering-diagrams

`@step-wise/engineering-diagrams` provides reusable React components for structural and engineering-mechanics diagrams. It extends `@step-wise/drawing` and consumes the React-agnostic load models from `@step-wise/engineering-mechanics`.


## Installation

```bash
npm install @step-wise/engineering-diagrams @step-wise/drawing @step-wise/engineering-mechanics react react-dom
```


## Architecture

The package deliberately contains presentation only. `@step-wise/engineering-mechanics` remains independent of React and this package depends on it, never the reverse. Diagram components use ordinary Drawing positions and distances, so drawing coordinates, pixel offsets, target positions, and responsive scaling remain available.

Use the components inside a `Drawing` from `@step-wise/drawing`:

```tsx
import { Drawing } from '@step-wise/drawing'
import { Beam, FixedSupport, Force } from '@step-wise/engineering-diagrams'

<Drawing view={{ type: 'bounds', bounds: { min: [-1, -1], max: [11, 5] }, width: 600, height: 300, yDirection: 'up' }}>
	<Beam positions={[[0, 0], [10, 0]]} />
	<FixedSupport position={[0, 0]} angle={Math.PI} />
	<Force position={[7, 0]} angle={-Math.PI / 2} color="crimson" />
</Drawing>
```


## Components

Structural components include `Beam`, `Hinge`, and `HalfHinge`. Support parts include `Ground`, `SupportBlock`, `SupportTriangle`, and `Wheels`. Complete supports include:

- `FixedSupport` and `AdjacentFixedSupport`;
- `HingeSupport` and `HalfHingeSupport`;
- `RollerSupport` and `AdjacentRollerSupport`;
- `RollerHingeSupport` and `RollerHalfHingeSupport`.

Symbol dimensions are internal Drawing pixels by default. They therefore scale together with the surrounding Drawing when its responsive Figure shrinks.


## Loads and labels

`Force` and `Moment` use the arrow-capable primitives from `@step-wise/drawing`. They accept the properties of their matching engineering-mechanics models together with visual options such as color, stroke width, force length, moment radius, and arrow styling.

```tsx
<Force position={[4, 2]} angle={Math.PI} applicationPointAt="end" relativeMagnitude={1.2} />
<Moment position={[7, 2]} clockwise radius={{ pixelDistance: 30 }} />
```

`LoadLabel` only positions caller-provided React content. It intentionally has no CAS, KaTeX, Material UI, or application-theme dependency.

```tsx
<LoadLabel load={force}><MyMathRenderer value="F_A" /></LoadLabel>
```


## Colors

`defaultEngineeringDiagramColors` contains neutral package defaults matching Step-Wise's current input, external, reaction, section, feedback, and selection colors. Direct components accept ordinary color properties. The compatibility renderer can override semantic load-source colors through its options.


## Compatibility renderer

`renderEngineeringDiagram` temporarily supports the existing data-object representation while applications migrate to explicit React components. `render` and `EngineeringDiagramElement` are deprecated compatibility aliases.

```tsx
renderEngineeringDiagram(
	{ type: 'Force', position: [2, 3], angle: 0, source: 'reaction' },
	{ colors: { reaction: '#175ea8' } },
)
```

The renderer recognizes both engineering components and the common Drawing primitives used by existing diagrams. New code should normally use explicit components, which provide clearer TypeScript contracts and remove the runtime registry.


## Scope

Interactive free-body-diagram input behavior is intentionally outside this package for now. It belongs in a future exercise-components layer that can combine the framework-neutral mechanics model, these visual primitives, and the frontend form infrastructure.
