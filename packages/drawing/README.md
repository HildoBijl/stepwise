# @step-wise/drawing

`@step-wise/drawing` provides React components for responsive figures, coordinate-based drawings, and mathematical plots. It has no dependency on a component library or application theme.


## Installation

```bash
npm install @step-wise/drawing @step-wise/geometry react react-dom
```


## Figure

`Figure` gives fixed-size visual content a responsive place on the page. It preserves the internal aspect ratio and scales the complete contents uniformly.

```tsx
import { Figure } from '@step-wise/drawing'

<Figure width={800} height={500} maxWidth={600} alignment="center">
	<div style={{ width: 800, height: 500 }}>Fixed-size contents</div>
</Figure>
```

See the [Figure guide](https://github.com/HildoBijl/stepwise/blob/main/packages/drawing/src/Figure/README.md) for sizing, scaling, and alignment details.


## Drawing

`Drawing` adds drawing coordinates and synchronized SVG, HTML, and optional Canvas layers. Its primitives accept logical drawing positions as well as fixed pixel offsets.

```tsx
import { Circle, Drawing, HtmlElement, Line, Rectangle, anchors } from '@step-wise/drawing'

<Drawing
	view={{ type: 'bounds', bounds: { min: [-1, -1], max: [7, 5] }, width: 640, height: 400, margin: 30, yDirection: 'up' }}
	maxWidth={640}
>
	<Rectangle corners={[[0, 0], [6, 4]]} fill="#e3f2fd" />
	<Line positions={[[0, 0], [3, 3], [6, 1]]} stroke="steelblue" />
	<Circle center={[3, 3]} radius={{ pixelDistance: 6 }} fill="crimson" />
	<HtmlElement position={[3, 3]} anchor={anchors.bottom} style={{ paddingBottom: 8 }}>Peak</HtmlElement>
	<HtmlElement position={{ position: [6, 1], pixelOffset: [10, 0] }} anchor={anchors.left}>Endpoint</HtmlElement>
</Drawing>
```

See the [Drawing guide](https://github.com/HildoBijl/stepwise/blob/main/packages/drawing/src/Drawing/README.md) for primitives, views, coordinate systems, positions, targets, layers, pointer tracking, and Canvas access.


## Plot

`Plot` extends `Drawing` with domains, ticks, axes, grids, plot-area clipping, and pointer-aware crosshairs.

```tsx
import { Axes, Curve, Grid, Plot, PlotArea } from '@step-wise/drawing'

const points = [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]]

<Plot
	points={points}
	view={{ type: 'fit', maxWidth: 600, maxHeight: 360, margin: 45 }}
	axes={{ x: { ticks: { step: 1 } }, y: { ticks: { desiredCount: 5 } } }}
>
	<Grid />
	<Axes x={{ label: 'x' }} y={{ label: 'f(x)' }} />
	<Curve positions={points} smoothing={{ mode: 'through', ratio: 0.7 }} stroke="steelblue" />
</Plot>
```

See the [Plot guide](https://github.com/HildoBijl/stepwise/blob/main/packages/drawing/src/Plot/README.md) for domains, axis settings, ticks, labels, grids, clipping, crosshairs, and plot hooks.


## Styling

The package uses ordinary SVG attributes, React styles, and `currentColor`. Applications can supply colors directly, inherit them from surrounding content, or provide a themed wrapper around `Figure`, `Drawing`, or `Plot`.
