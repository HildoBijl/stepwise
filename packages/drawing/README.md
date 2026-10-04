# @step-wise/drawing

`@step-wise/drawing` will provide framework-independent React components and utilities for responsive figures, coordinate-based drawings, and plots. It is being developed as the reusable successor to Step-Wise's frontend-specific drawing toolbox.


## Status

The package currently provides the responsive `Figure` wrapper, the layered `Drawing` component, and their coordinate-system fundamentals. Plot, positioning, measurement, and drawing primitives will be added incrementally before existing Step-Wise figures are migrated. The existing frontend drawing implementation remains in use during this process.


## Figure

`Figure` gives arbitrary fixed-size visual contents a responsive place on the page. It reserves the correct aspect ratio and uniformly scales the entire contents, including HTML, SVG, Canvas, text, and pixel-based spacing.

```tsx
import { Figure } from '@step-wise/drawing'

<Figure width={800} height={500} maxWidth={600} alignment="center">
	<div style={{ width: 800, height: 500 }}>Fixed-size contents</div>
</Figure>
```

`width` and `height` define the internal pixel dimensions. `maxWidth` limits the displayed width and defaults to the internal width, so a Figure shrinks when necessary but does not grow unless explicitly allowed. `alignment` can be `left`, `center`, or `right` and defaults to `center`. Standard `div` properties, styles, and refs apply to the outer responsive element.


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

`SvgPortal`, `SvgDefsPortal`, and `HtmlPortal` let conceptual child components render into the appropriate layer. Nested SVG portals reuse the surrounding SVG portal, so an SVG component can safely contain other SVG components.

The SVG and HTML overlays use `pointer-events: none`, allowing empty areas to pass interactions through to lower layers. Interactive descendants can opt back in with `pointer-events: auto`.

Drawing hooks expose the current context and coordinate system. A `DrawingHandle` ref additionally provides the Drawing element, SVG, Canvas, 2D Canvas context, dimensions, coordinate system, and drawing/client conversion methods. This supports both custom Canvas rendering and components outside the Drawing that need access to its resolved view.


## Planned architecture

The package contains three related abstraction levels:

- `Figure` controls responsive page layout and uniformly scales fixed-size visual contents.
- `Drawing` provides coordinate transformations and layered SVG, Canvas, and HTML rendering.
- `Plot` extends Drawing with plot bounds, ticks, axes, grids, and other plot-specific data.

Drawing will support four coordinate systems:

- drawing coordinates describe the logical or mathematical drawing;
- pixel coordinates describe fixed internal Drawing pixels and follow the configured y-direction;
- render coordinates match SVG, Canvas, and CSS positioning, with the origin at the top left;
- client coordinates describe browser viewport positions.

The SVG, Canvas, and HTML layers will share the same positioning system. Canvas remains an optional layer and will expose its element and rendering context for custom drawing code.


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
```

Pixel coordinates follow `yDirection`. With an upward y-direction their origin is at the bottom left. Render and client coordinates always follow browser conventions, with their origin at the top left and positive y pointing downward.

The coordinate system also exposes its constituent `Transformation` instances. Vector conversion methods such as `drawingVectorToPixel` and `pixelVectorToRender` apply scaling and orientation without applying positional translations. These will support pixel offsets and distance resolution.


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

Measured targets, anchors, and calculated positions will extend this position model during the measurement implementation.


## Styling

The package will not depend on Material UI or another application theme system. Drawing primitives will use normal CSS conventions such as `currentColor`, allowing applications to connect their own theme through a small wrapper component.
