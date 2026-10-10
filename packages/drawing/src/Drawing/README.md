# Drawing

`Drawing` combines a logical coordinate system with synchronized SVG, HTML, and optional Canvas layers. It is responsive through `Figure`: the Drawing keeps fixed internal pixel dimensions while the complete result can scale to fit the page.


## Basic example

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

The rectangle and line use drawing coordinates. The circle has a fixed internal-pixel radius, and the endpoint label combines a drawing position with a pixel offset. All of them scale together when the complete Drawing is displayed responsively.


## Primitives

Primitives accept their normal SVG or HTML properties, styles, class names, event handlers, and refs unless their component API reserves a property.

### HTML primitives

- `HtmlElement` positions arbitrary React content.
- `Label` offsets content from a position by an angle and distance.
- `LineLabel` places content alongside a line.
- `CornerLabel` places content inside a corner while accounting for its angle.

```tsx
<HtmlElement position={[2, 3]} anchor={anchors.topLeft}>Contents</HtmlElement>
<Label position={[2, 3]} distance={{ pixelDistance: 8 }} angle={Math.PI / 4}>A</Label>
<LineLabel positions={[[0, 0], [4, 2]]} oppositeTo={[2, 4]}>Length</LineLabel>
<CornerLabel positions={[[4, 0], [0, 0], [0, 4]]} size={{ pixelDistance: 30 }}>α</CornerLabel>
```

`HtmlElement` contents do not wrap by default. Set a width and `whiteSpace` through `style` when wrapping is desired. Mouse interaction is ignored by default; set `ignoreMouse={false}` for interactive contents. Use `behind` to place an element below the SVG layer.

### SVG primitives

- `Line`, `Polygon`, `Curve`, `Circle`, `Rectangle`, `Square`, and `Arc` draw common shapes.
- `SvgText` renders SVG text.
- `SvgGroup` positions, transforms, and optionally clips a group.
- `ArrowHead` renders a standalone arrowhead.
- `BoundedLine` clips an infinite line through two positions to the Drawing bounds.
- `RightAngle` draws a right-angle marker inside three positions.
- `DistanceMarker` draws a double-ended dimension arrow.

```tsx
<Line positions={[[0, 0], [2, 3], [5, 1]]} />
<Polygon positions={[[0, 0], [4, 0], [2, 3]]} fill="currentColor" />
<Circle center={[2, 3]} radius={1} />
<Rectangle corners={[[0, 0], [4, 3]]} cornerRadius={{ pixelDistance: 4 }} />
<Arc center={[0, 0]} radius={2} startAngle={0} endAngle={Math.PI / 2} />
```

`Curve` supports paths that pass through their positions or round around them. Ratio and distance smoothing are mutually exclusive. A smoothing ratio normally ranges from `0` (no smoothing) to `1` (the highest normally sensible smoothing); values above `1` are accepted but may overshoot or self-intersect. Both through-curves and around-curves default to a ratio of `0.8`. For open around-curves, control points next to the endpoints use their full adjacent section as the ratio basis, while interior control points use half of each adjacent section. Open through-curves keep their endpoint control points at the endpoints themselves.

```tsx
<Curve positions={points} smoothing={{ mode: 'through', ratio: 0.7 }} />
<Curve positions={points} smoothing={{ mode: 'around', distance: { pixelDistance: 20 } }} />
```

`Line`, `Curve`, and `Arc` support arrowheads at either end. Their shafts are shortened underneath the heads.

```tsx
<Line positions={points} endArrow />
<Curve positions={points} startArrow endArrow={{ fill: 'red', size: { pixelDistance: 16 } }} />
<Arc center={[0, 0]} radius={2} startAngle={0} endAngle={Math.PI * 1.5} endArrow />
```

Line-based primitives default to a one-pixel `currentColor` stroke and no fill.


## Coordinate systems

Drawing distinguishes four coordinate systems because logical geometry, responsive layout, browser rendering, and pointer events have different requirements.

- **Drawing coordinates** describe the logical or mathematical content.
- **Pixel coordinates** describe fixed internal Drawing pixels and follow `yDirection`.
- **Render coordinates** match SVG, Canvas, and CSS: the origin is at the top left and positive y points downward.
- **Client coordinates** describe positions in the browser viewport.

With `yDirection: 'up'`, drawing and pixel y-values increase upward. Render and client y-values always increase downward. Pixel offsets remain part of the Drawing and therefore scale with the complete responsive figure; they are not client-pixel offsets.

`DrawingCoordinateSystem` converts positions and vectors between these systems.

```ts
const pixelPosition = coordinateSystem.drawingToPixel([2, 3])
const renderPosition = coordinateSystem.pixelToRender(pixelPosition)
const clientPosition = coordinateSystem.pixelToClient(pixelPosition, element.getBoundingClientRect())

coordinateSystem.containsDrawingPosition([2, 3])
coordinateSystem.clampDrawingPosition([20, -4])
```

Vector methods such as `drawingVectorToPixel` omit translations.


## Positions and distances

A bare vector is a drawing-coordinate position. A structured position can combine drawing coordinates with a pixel offset or specify a direct pixel position.

```ts
[2, 3]
{ position: [2, 3], pixelOffset: [10, 0] }
{ pixelPosition: [200, 300] }
```

Positions may also refer to measured targets or calculate a result from other positions.

```ts
{ target: 'heading', anchor: anchors.bottomRight, pixelOffset: [10, -5] }

{
	positions: [[0, 0], [4, 2]],
	calculate: ([first, second]) => first.add(second).multiply(0.5),
}
```

`resolvePosition` resolves a specification with an explicit coordinate system. `useResolvedPosition` resolves one in the current Drawing and returns a pixel position, or `undefined` while a required target is unavailable. This keeps the public positioning API independent of SVG's render-coordinate conventions, including when `yDirection` is `up`.

Distances follow the same pattern:

```ts
3
{ distance: 3, pixelOffset: 10 }
{ pixelDistance: 200 }
```

`resolveDistance` and `useResolvedDistance` resolve them. A calculated distance can derive a value from multiple positions.

```ts
const distance = useResolvedDistance({
	positions: [{ target: 'first' }, { target: 'second' }],
	calculate: ([first, second]) => second.subtract(first).magnitude,
})
```

For non-uniform transformations, scalar drawing distances use the geometric mean of both axis scales. Use positions or vectors when direction-specific scaling matters.


## Drawing targets

Targets let primitives position themselves relative to measured HTML, SVG, or text-node bounds. `DrawingTarget` is a convenient wrapper.

```tsx
<DrawingTarget target="table-heading">Heading</DrawingTarget>

<Line positions={[
	[0, 0],
	{ target: 'table-heading', anchor: anchors.bottomLeft },
]} />
```

`useDrawingTarget` attaches registration directly to an existing element without adding a wrapper.

```tsx
const targetRef = useDrawingTarget<HTMLTableCellElement>('population-heading')

<th ref={targetRef}>Population</th>
```

`useDrawingElementTarget` resolves an element inside a container and keeps the registration synchronized as the container's DOM changes. Containers can be nodes, refs, or the name of another registered target.

```tsx
useDrawingElementTarget(
	'population-cell',
	'table',
	table => table.querySelector('[data-column="population"]'),
)
```

`useDrawingTextTarget` uses the same observed lifecycle to search an existing DOM subtree for matching text and optionally target one of its parent elements.

```tsx
const tableRef = useRef<HTMLTableElement>(null)
useDrawingTextTarget('population-heading', tableRef, 'Population', { parentDepth: 1 })
```

Named anchors such as `anchors.top`, `anchors.left`, and `anchors.bottomRight` retain their visual meaning for either y-direction. Custom anchors use normalized coordinates from `-1` to `1` and follow the pixel-coordinate y-direction.

Targets are observed only while a position refers to them. A target-dependent position remains unresolved until the target has rendered and been measured. Dependency-cycle detection is deliberately not included; a layout cycle remains unresolved and does not render.

During a view transition, ordinary target-dependent positions keep using the last measured bounds until fresh bounds become available. This keeps positioned content mounted while the Drawing settles. Measurements are considered settled only after a complete follow-up pass finds no meaningful changes, allowing chains of target-dependent elements to update before they affect a measured view. The lower-level `useDrawingTargetBounds` and `useDrawingTargetBoundsMap` hooks accept `{ allowStale: false }` when a calculation specifically requires settled bounds measured in the current coordinate system; measured drawings use this strict mode internally.


## Views

The `view` prop determines the Drawing dimensions and drawing-to-pixel transformation.

- `identity` uses equal drawing and pixel coordinates within fixed dimensions.
- `bounds` maps explicit drawing bounds into exact dimensions.
- `scale` applies a fixed scale and derives dimensions from points and margins.
- `fit` fits points within maximum dimensions or scale.
- `custom` accepts dimensions and a custom drawing-to-pixel transformation.

```tsx
<Drawing view={{
	type: 'fit',
	points: [[-2, 0], [4, 3]],
	maxWidth: 600,
	maxHeight: 400,
	margin: 20,
	yDirection: 'up',
}}>
	...
</Drawing>
```

`scale` and `fit` accept an optional `pretransform`. Margins can be one number, one value per axis, or separate negative- and positive-side values for each axis. `resolveDrawingView` and the individual view resolvers are public when another component needs to resolve a view itself.

### Views based on measured targets

Use `MeasuredDrawing` to derive a view from named HTML or SVG targets after they render. See the [MeasuredDrawing guide](../MeasuredDrawing/README.md) for custom view calculations, staged target resolution, and `TargetBoundsDrawing`.


## Layers, portals, and clipping

Drawing provides an optional Canvas layer, an SVG layer enabled by default, and HTML layers behind and in front of SVG.

- `SvgPortal` renders into SVG.
- `SvgDefsPortal` renders reusable definitions into SVG `defs`.
- `HtmlPortal` renders HTML; use `behind` for the lower HTML layer.

Package primitives select the correct portal automatically. Nested SVG portals reuse their surrounding SVG portal.

Set `clip` on `Drawing` to clip every layer to its internal rectangle. Set `clip` on `SvgGroup` to clip only that group.

```tsx
<Drawing clip view={view}>...</Drawing>

<SvgGroup clip position={[2, 3]} rotate={Math.PI / 4}>...</SvgGroup>
```

The SVG and HTML overlays ignore pointer events in empty areas. Interactive descendants can opt back in with `pointer-events: auto`; `HtmlElement` exposes this through `ignoreMouse={false}`.


## Pointer tracking

`useDrawingPointerState` returns client, render, pixel, and drawing positions, modifier keys, and whether the pointer is inside the Drawing.

```tsx
const { drawingPosition, pixelPosition, isInside, modifierKeys } = useDrawingPointerState()
```

Convenience hooks expose one coordinate form:

- `useDrawingPointerPosition`
- `usePixelPointerPosition`
- `useRenderPointerPosition`
- `useClientPointerPosition`

Listeners are installed lazily and updates are coalesced to animation frames. Local positions remain unresolved while the Drawing has zero measurable client dimensions.


## Canvas and imperative access

Enable Canvas with `useCanvas`. A `DrawingHandle` ref exposes the Drawing element, SVG, Canvas, 2D context, fixed dimensions, coordinate system, and drawing/client conversion methods.

```tsx
const drawingRef = useRef<DrawingHandle>(null)

<Drawing ref={drawingRef} useCanvas view={view}>...</Drawing>
```

This supports custom Canvas renderers and components outside the Drawing that need its resolved transformation.

