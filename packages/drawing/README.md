# @step-wise/drawing

`@step-wise/drawing` provides framework-independent React components and utilities for responsive figures, coordinate-based drawings, and plots. It is being developed as the reusable successor to Step-Wise's frontend-specific drawing toolbox.


## Status

The package currently provides the responsive `Figure` wrapper, layered `Drawing` component, coordinate systems, position and target resolution, HTML and SVG primitives, and a Plot extension. The existing frontend drawing implementation remains in use while existing figures are migrated.


## Figure

`Figure` gives arbitrary fixed-size visual contents a responsive place on the page. It reserves the correct aspect ratio and uniformly scales the entire contents, including HTML, SVG, Canvas, text, and pixel-based spacing.

```tsx
import { Figure } from '@step-wise/drawing'

<Figure width={800} height={500} maxWidth={600} alignment="center">
	<div style={{ width: 800, height: 500 }}>Fixed-size contents</div>
</Figure>
```

`width` and `height` define the internal pixel dimensions. A numeric `maxWidth` limits the displayed width and defaults to the internal width, so a Figure shrinks when necessary but does not grow by default. Set `maxWidth="none"` to let it fill the available parent width even when that enlarges it beyond its internal dimensions. `alignment` can be `left`, `center`, or `right` and defaults to `center`. Standard `div` properties, styles, and refs apply to the outer responsive element.


## Drawing

`Drawing` resolves a declarative view, places it inside a responsive `Figure`, and provides synchronized Canvas, SVG, and HTML layers. Canvas is opt-in, SVG is enabled by default, and the HTML layer is always available.

```tsx
import { Drawing, HtmlPortal, SvgPortal } from '@step-wise/drawing'

<Drawing
	view={{ type: 'bounds', bounds: { min: [-2, -1], max: [8, 5] }, width: 800, height: 500 }}
	maxWidth={600}
	useCanvas
>
	<SvgPortal>
		<line x1="0" y1="0" x2="800" y2="500" stroke="currentColor" />
	</SvgPortal>
	<HtmlPortal>
		<div>HTML contents</div>
	</HtmlPortal>
</Drawing>
```

`SvgPortal`, `SvgDefsPortal`, and `HtmlPortal` let conceptual child components render into the appropriate layer. Nested SVG portals reuse the surrounding SVG portal, so an SVG component can safely contain other SVG components. HTML renders in front of SVG by default; use `<HtmlPortal behind>` to render it between Canvas and SVG.

The SVG and HTML overlays use `pointer-events: none`, allowing empty areas to pass interactions through to lower layers. Interactive descendants can opt back in with `pointer-events: auto`.

Drawing contents may overflow their fixed internal bounds by default. Set `clip` to clip every Canvas, SVG, and HTML layer to the Drawing rectangle. `SvgGroup` can selectively clip only its own contents against those same bounds; its untransformed wrapper ensures the clipping rectangle remains fixed when the group is translated, rotated, or scaled.

```tsx
<Drawing clip view={view}>...</Drawing>

<SvgGroup clip position={[2, 3]} rotate={Math.PI / 4}>
	...
</SvgGroup>
```

Drawing hooks expose the current context and coordinate system. A `DrawingHandle` ref additionally provides the Drawing element, SVG, Canvas, 2D Canvas context, dimensions, coordinate system, and drawing/client conversion methods. This supports both custom Canvas rendering and components outside the Drawing that need access to its resolved view.

Pointer tracking is available through `useDrawingPointerState`. It provides client, render, pixel, and drawing positions, the current modifier keys, and whether the pointer lies inside the Drawing. Positions remain available outside the Drawing, allowing dragging interactions to continue after crossing its edge.

```tsx
const { drawingPosition, pixelPosition, isInside, modifierKeys } = useDrawingPointerState()
```

The convenience hooks `useDrawingPointerPosition`, `usePixelPointerPosition`, `useRenderPointerPosition`, and `useClientPointerPosition` return one coordinate form. Pointer listeners are installed lazily while at least one tracking hook is mounted, and updates are coalesced to animation frames.


## Architecture

The package contains three related abstraction levels:

- `Figure` controls responsive page layout and uniformly scales fixed-size visual contents.
- `Drawing` provides coordinate transformations and layered SVG, Canvas, and HTML rendering.
- `Plot` extends Drawing with plot bounds, ticks, axes, grids, and other plot-specific data.

Drawing supports four coordinate systems:

- drawing coordinates describe the logical or mathematical drawing;
- pixel coordinates describe fixed internal Drawing pixels and follow the configured y-direction;
- render coordinates match SVG, Canvas, and CSS positioning, with the origin at the top left;
- client coordinates describe browser viewport positions.

The SVG, Canvas, and HTML layers share the same positioning system. Canvas remains an optional layer and exposes its element and rendering context for custom drawing code.


## Coordinate system

`DrawingCoordinateSystem` stores the Drawing's fixed internal dimensions and transformations. It converts positions between drawing, pixel, render, and client coordinates.

```ts
import { DrawingCoordinateSystem } from '@step-wise/drawing'

const coordinates = new DrawingCoordinateSystem({
	width: 800,
	height: 500,
	yDirection: 'up',
	drawingToPixelTransformation,
})

const pixelPosition = coordinates.drawingToPixel([2, 3])
const renderPosition = coordinates.pixelToRender(pixelPosition)
const clientPosition = coordinates.pixelToClient(pixelPosition, element.getBoundingClientRect())

coordinates.containsDrawingPosition([2, 3])
const positionInsideDrawing = coordinates.clampDrawingPosition([20, -4])
```

Pixel coordinates follow `yDirection`. With an upward y-direction their origin is at the bottom left. Render and client coordinates always follow browser conventions, with their origin at the top left and positive y pointing downward.

`containsDrawingPosition` checks whether a drawing-coordinate position lies inside the visible Drawing rectangle, including its boundary. `clampDrawingPosition` returns the nearest drawing-coordinate position inside that rectangle. Both operations evaluate the bounds in pixel space, so they also work with rotated, reflected, and otherwise custom drawing transformations.

The coordinate system also exposes its constituent `Transformation` instances. Vector conversion methods such as `drawingVectorToPixel` and `pixelVectorToRender` apply scaling and orientation without applying positional translations. These support pixel offsets and distance resolution.


## Drawing views

A declarative view specification resolves into a `DrawingCoordinateSystem` through `resolveDrawingView`.

```ts
import { resolveDrawingView } from '@step-wise/drawing'

const coordinates = resolveDrawingView({
	type: 'fit',
	points: [[-2, 0], [4, 3]],
	maxWidth: 600,
	maxHeight: 400,
	margin: 20,
	yDirection: 'up',
})
```

The available views are:

- `identity`, where drawing and pixel coordinates are equal within fixed dimensions;
- `bounds`, which maps explicit drawing bounds into exact pixel dimensions;
- `scale`, which applies a fixed scale and derives tight dimensions around supplied points and margins;
- `fit`, which derives the scale needed to fit supplied points within maximum dimensions or a maximum scale;
- `custom`, which accepts fixed dimensions and a custom drawing-to-pixel transformation.

`scale` and `fit` accept an optional two-dimensional `pretransform`, allowing content to be rotated or reflected before its bounds and final position are calculated. Margins can be a single number, one value per axis, or separate values for the negative and positive side of each axis.

The individual resolver functions are also public for specialized components that build on Drawing. For instance, Plot can calculate its domain and ticks before resolving its resulting Drawing view.


## Position and distance specifications

A bare vector represents a drawing-coordinate position. A structured position can add an offset in internal Drawing pixels or directly specify a pixel position.

```ts
import { resolvePosition, useResolvedPosition } from '@step-wise/drawing'

resolvePosition([2, 3], coordinateSystem)
resolvePosition({ position: [2, 3], pixelOffset: [10, 0] }, coordinateSystem)
resolvePosition({ pixelPosition: [200, 300] }, coordinateSystem)

const renderPosition = useResolvedPosition({ position: [2, 3], pixelOffset: [10, 0] })
```

Pixel coordinates and offsets follow the Drawing's configured y-direction. The resolver subsequently converts them to render coordinates, whose positive y-direction always points downward.

Distances follow the same pattern. A bare number is a drawing-coordinate distance, while a structured specification can add a pixel offset or provide a direct pixel distance.

```ts
resolveDistance(3, coordinateSystem)
resolveDistance({ distance: 3, pixelOffset: 10 }, coordinateSystem)
resolveDistance({ pixelDistance: 200 }, coordinateSystem)

const renderDistance = useResolvedDistance({ distance: 3, pixelOffset: 10 })
```

Because a scalar distance has no direction, non-uniform transformations scale it by the geometric mean of the two axis scales. Use positions or vectors when the direction-specific transformation matters.

A calculated distance derives an internal render/pixel distance from one or more resolved positions. Like calculated positions, it waits until every input position is available and supports target positions and nested calculated positions.

```ts
const targetDistance = useResolvedDistance({
	positions: [
		{ target: 'first', anchor: anchors.center },
		{ target: 'second', anchor: anchors.center },
	],
	calculate: ([first, second]) => second.subtract(first).magnitude,
})
```


## Drawing targets

Any HTML or SVG element can be registered as a measurable target with `useDrawingTarget`. `DrawingTarget` provides a convenient `span` or `div` wrapper for the common case.

```tsx
import { DrawingTarget, anchors, useResolvedPosition } from '@step-wise/drawing'

<DrawingTarget target="table-heading">Heading</DrawingTarget>

const arrowEnd = useResolvedPosition({
	target: 'table-heading',
	anchor: anchors.bottomRight,
	pixelOffset: [10, -5],
})
```

The hook form can be attached directly to an existing element without introducing a wrapper:

```tsx
const targetRef = useDrawingTarget<HTMLTableCellElement>('population-heading')

<th ref={targetRef}>Population</th>
```

`useDrawingTarget<Text>` can also register a text node when its precise text bounds are needed. Drawing coordinates and direct pixel positions resolve immediately; a target-relative position remains `undefined` until its target has rendered and been measured.

`useDrawingTextTarget` finds and registers text within an existing DOM subtree. Its matcher can be a contained string or a predicate. The options select a later matching text node or move from the text node to one of its parent elements, which is useful for targeting table cells around matching text.

```tsx
const tableRef = useRef<HTMLTableElement>(null)
useDrawingTextTarget('population-heading', tableRef, 'Population', { parentDepth: 1 })
```

Targets are observed lazily. Merely registering a target does not create a `ResizeObserver`; observation starts when a position actually references that target and stops when the final reference disappears.

Named anchors such as `anchors.top`, `anchors.left`, and `anchors.bottomRight` retain their visual meaning for either y-direction. Custom vector anchors use normalized coordinates from `-1` to `1` and follow the configured pixel-coordinate y-direction.

Calculated positions derive a render-coordinate position from one or more ordinary positions. Inputs can themselves be calculated positions.

```ts
const midpoint = useResolvedPosition({
	positions: [
		{ target: 'first', anchor: anchors.right },
		{ target: 'second', anchor: anchors.left },
	],
	calculate: ([first, second]) => first.add(second).multiply(0.5),
})
```

Target references are collected recursively and deduplicated, so every required target is observed. The calculation is only called after all input positions have resolved; until then the complete calculated position is `undefined`.

The first implementation deliberately does not track which target owns a position calculation. It therefore does not attempt dependency-cycle detection. A target-layout cycle remains unresolved and consequently does not render.


## HTML primitives

`HtmlElement` positions arbitrary HTML contents in a Drawing. It accepts every position form described above, including target and calculated positions. The anchor identifies which point of the element is placed at that position.

```tsx
<HtmlElement position={[2, 3]} anchor={anchors.topLeft}>Contents</HtmlElement>
<HtmlElement position={{ target: 'heading', anchor: anchors.bottom }}>Target label</HtmlElement>
<HtmlElement position={[4, 1]} target="measurable-label">Measurable label</HtmlElement>
<HtmlElement behind position={[1, 2]}>Behind the SVG contents</HtmlElement>
```

The optional `target` prop registers the complete rendered element as a drawing target without requiring a separate ref or wrapper. Set `behind` to place the element below SVG rather than above it. Contents do not wrap by default; set a width and `whiteSpace` through `style` when wrapping is desired. Mouse interaction is ignored by default. Set `ignoreMouse={false}` for controls or other interactive contents. `rotate` is expressed in radians and follows the configured pixel-coordinate direction; `scale`, standard `div` attributes, styles, class names, and refs are also supported.

`Label` offsets an element from a position by a distance and angle. If no anchor is supplied, it selects the edge facing back toward the original position.

```tsx
<Label position={[2, 3]} distance={{ pixelDistance: 8 }} angle={Math.PI / 4}>A</Label>
```

`LineLabel` places a label halfway along a line, on the side opposite a reference position. `CornerLabel` places one inside a corner while accounting for the corner angle and an approximate label size.

```tsx
<LineLabel positions={[[0, 0], [4, 2]]} oppositeTo={[2, 4]}>Length</LineLabel>
<CornerLabel positions={[[4, 0], [0, 0], [0, 4]]} size={{ pixelDistance: 30 }}>α</CornerLabel>
```


## SVG primitives

SVG primitives use the same position and distance specifications as HTML primitives and render through the Drawing's SVG portal. Their normal SVG attributes, event handlers, styles, class names, and refs remain available.

```tsx
<Line positions={[[0, 0], [2, 3], [5, 1]]} />
<Polygon positions={[[0, 0], [4, 0], [2, 3]]} fill="currentColor" />
<Circle center={[2, 3]} radius={1} />
<Rectangle corners={[[0, 0], [4, 3]]} cornerRadius={{ pixelDistance: 4 }} />
<Square center={[2, 2]} side={2} />
<Arc center={[0, 0]} radius={2} startAngle={0} endAngle={Math.PI / 2} />
```

`Curve` supports curves that pass through their positions or round around them. Its `smoothing` object selects the mode and either a proportional ratio or a fixed drawing/pixel distance. Ratio and distance smoothing are mutually exclusive.

```tsx
<Curve positions={points} smoothing={{ mode: 'through', ratio: 0.7 }} />
<Curve positions={points} smoothing={{ mode: 'around', distance: { pixelDistance: 20 } }} />
```

The smoothing mode defaults to `around`, while its magnitude defaults to `ratio: 1`. `SvgText` and `SvgGroup` provide positioned text and transformed SVG groups.

`Line`, `Curve`, and `Arc` support independently configurable arrowheads at either endpoint. Their shafts are shortened underneath the arrowheads. By default, path arrowheads scale with the shaft's numeric `strokeWidth`; an explicit arrowhead size uses the same drawing/pixel `Distance` specifications as other primitives. `ArrowHead` is also available directly; its direction is a drawing-coordinate vector.

```tsx
<Line positions={points} endArrow />
<Curve positions={points} startArrow endArrow={{ fill: 'red', size: { pixelDistance: 16 } }} />
<Arc center={[0, 0]} radius={2} startAngle={0} endAngle={Math.PI * 1.5} endArrow />
<ArrowHead position={[2, 3]} direction={[1, 0]} size={{ pixelDistance: 12 }} />
```

Higher-level helpers include:

- `BoundedLine`, which clips an infinite line through two positions to the Drawing bounds;
- `RightAngle`, which draws a right-angle marker inside three positions;
- `DistanceMarker`, which draws a double-ended dimension arrow with an optional pixel offset.

All line-based primitives default to a one-pixel `currentColor` stroke and no fill, matching the neutral SVG default while allowing applications to emphasize arrows and other prominent elements explicitly.


## Plot

`Plot` extends `Drawing` with an upward mathematical coordinate system, resolved x/y domains, and tick values. Give it either explicit `bounds` or a collection of `points`. Its constrained view specification uses the resulting domain automatically.

```tsx
import { Axes, Crosshair, Curve, Grid, Plot, PlotArea } from '@step-wise/drawing'

<Plot
	bounds={{ min: [-3, -2], max: [3, 8] }}
	view={{ type: 'fit', maxWidth: 600, maxHeight: 360, margin: 40 }}
	axes={{
		x: { ticks: { step: 1 } },
		y: { ticks: { desiredCount: 6 } },
	}}
>
	<Grid />
	<PlotArea>
		<Curve positions={points} smoothing={{ mode: 'through', ratio: 0.7 }} />
	</PlotArea>
	<Axes x={{ label: 'x' }} y={{ label: 'f(x)' }} />
	<Crosshair />
</Plot>
```

Plot axes use linear scales in the initial implementation. Their settings can override the `domain`, include zero, set the axis `position`, and use explicit tick `values`, a fixed `step`, or an approximate `desiredCount`. Zero is included and the domain is extended to complete ticks by default; set `includeZero: false` or `extendDomain: false` where that is undesirable.

Axes are explicit rather than automatic. `Axes` composes the separately exported `XAxis` and `YAxis`, and their position, line, tick, label, formatting, and visibility options can be customized independently. Tick labels and axis labels use HTML primitives, so they can contain arbitrary React content such as KaTeX expressions.

`Grid` renders independently customizable x/y grid lines. `PlotArea` supplies an SVG group clipped to the mathematical domain, leaving axes and labels in the Drawing margins visible. Its clipping can be disabled with `clip={false}`.

`Crosshair` tracks the Drawing pointer while it lies inside the Plot domain. It can render lines to the axes, a point marker, formatted axis values, and an optional point label through `getPointLabel`. `formatXValue` and `formatYValue` only format their respective axis values.

Plot hooks expose the resolved data for custom extensions: `usePlot`, `usePlotDomain`, `usePlotAxis`, and `usePlotTicks`.


## Styling

The package will not depend on Material UI or another application theme system. Drawing primitives will use normal CSS conventions such as `currentColor`, allowing applications to connect their own theme through a small wrapper component.
