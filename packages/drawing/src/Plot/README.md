# Plot

`Plot` extends `Drawing` with an upward mathematical coordinate system, x/y domains, axis positions, and tick values. Axes, grids, clipping, and crosshairs are explicit child components, so a plot can include only the features it needs.


## Basic example

```tsx
import { Axes, Curve, Grid, Plot, PlotArea } from '@step-wise/drawing'

const points = [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]]

<Plot
	points={points}
	view={{ type: 'fit', maxWidth: 600, maxHeight: 360, margin: 45 }}
	axes={{ x: { ticks: { step: 1 } }, y: { ticks: { desiredCount: 5 } } }}
>
	<Grid />
	<PlotArea>
		<Curve positions={points} smoothing={{ mode: 'through', ratio: 0.7 }} stroke="steelblue" />
	</PlotArea>
	<Axes x={{ label: 'x' }} y={{ label: 'f(x)' }} />
</Plot>
```

`Plot` supplies the Drawing context as well as a Plot context. Ordinary Drawing primitives can therefore be used directly inside it.


## Domain and view

Define the plotted data range with either explicit `bounds` or a collection of `points`.

```tsx
<Plot bounds={{ min: [-3, -2], max: [3, 8] }} view={view}>...</Plot>

<Plot points={samplePoints} view={view}>...</Plot>
```

The Plot resolves that range together with its axis settings before constructing its internal Drawing view. Plot supports constrained versions of three Drawing views:

- `bounds` uses exact internal `width` and `height`.
- `scale` uses a fixed scale and derives dimensions.
- `fit` fits the domain within maximum dimensions or scale.

```tsx
<Plot
	bounds={{ min: [0, -10], max: [35, 35] }}
	view={{ type: 'bounds', width: 700, height: 430, margin: [[55, 20], [45, 35]] }}
>
	...
</Plot>
```

The internal Drawing always uses `yDirection: 'up'`.


## Axis data and ticks

The `axes` prop controls domain resolution, tick generation, and axis positions. It does not render axes by itself.

```tsx
<Plot
	points={points}
	view={view}
	axes={{
		x: { includeZero: false, position: 'min', ticks: { step: 0.5 } },
		y: { domain: [-2, 10], position: 'zero', ticks: { desiredCount: 6 } },
	}}
>
	...
</Plot>
```

Linear axes are currently supported. An axis can:

- override its `domain`;
- include or exclude zero;
- place itself at `zero`, `min`, `max`, or a numeric coordinate;
- use explicit tick `values`;
- use a fixed tick `step`;
- request an approximate `desiredCount`.

Domains include zero and extend to complete ticks by default. Use `includeZero: false` or `ticks: { ..., extendDomain: false }` to disable those behaviors.


## Rendering axes

Axes are explicit components rather than automatic Plot decorations.

```tsx
<Axes
	x={{ label: 'Time [s]' }}
	y={{ label: 'Velocity [m/s]', formatTick: value => value.toFixed(1) }}
/>
```

`Axes` composes `XAxis` and `YAxis`. Pass `false` to omit one axis, or render `XAxis` and `YAxis` separately.

```tsx
<Axes x={{ label: 'x' }} y={false} />

<XAxis label="x" />
<YAxis label="f(x)" />
```

Each axis can independently configure:

- line, tick, tick-label, and zero-tick visibility;
- axis and tick labels;
- tick formatting;
- tick lengths and label offsets;
- props for the underlying line, ticks, label, and tick labels.

Labels use HTML primitives and may contain arbitrary React content, including a KaTeX component supplied by the application.


## Grid and plot-area clipping

`Grid` draws lines at resolved x and y ticks. Its directions and underlying line props can be customized independently.

```tsx
<Grid xLineProps={{ opacity: 0.15 }} yLineProps={{ opacity: 0.25 }} />
```

`PlotArea` groups SVG content and clips it to the mathematical domain while leaving axes and labels in the surrounding margins visible.

```tsx
<PlotArea>
	<Curve positions={points} />
</PlotArea>
```

Set `clip={false}` when content should be allowed outside the domain.


## Crosshair

`Crosshair` follows the Drawing pointer while it is inside the Plot domain. It can render guide lines, a point marker, axis values, and an application-provided point label.

```tsx
<Crosshair
	formatXValue={value => value.toFixed(1)}
	formatYValue={value => value.toFixed(1)}
	getPointLabel={([x, y]) => `(${x.toFixed(1)}, ${y.toFixed(1)})`}
/>
```

Axis-value formatters affect their respective x and y labels. `getPointLabel` controls the label attached to the tracked point. By default, that label is placed away from the axes' intersection; `pointLabelAngle` can force a direction and `pointLabelDistance` adjusts its spacing.


## Plot hooks and custom components

Custom Plot extensions can consume the resolved context:

- `usePlot` returns the resolved domain and both axes.
- `usePlotDomain` returns the domain rectangle.
- `usePlotAxis('x' | 'y')` returns one resolved axis.
- `usePlotTicks('x' | 'y')` returns its tick values.

```tsx
function TickMarkers() {
	const ticks = usePlotTicks('x')
	const yAxis = usePlotAxis('y')
	return ticks.map(value => <Circle key={value} center={[value, yAxis.position]} radius={{ pixelDistance: 2 }} />)
}
```

Because Plot also supplies Drawing context, custom components can combine these hooks with Drawing positions, targets, pointer state, SVG primitives, HTML primitives, and portals.

