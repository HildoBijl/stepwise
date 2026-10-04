# @step-wise/drawing

`@step-wise/drawing` will provide framework-independent React components and utilities for responsive figures, coordinate-based drawings, and plots. It is being developed as the reusable successor to Step-Wise's frontend-specific drawing toolbox.


## Status

The package currently provides its coordinate-system fundamentals. Figure, Drawing, Plot, positioning, measurement, and rendering components will be added incrementally before existing Step-Wise figures are migrated. The existing frontend drawing implementation remains in use during this process.


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


## Planned position and distance specifications

A bare vector represents a drawing-coordinate position. More detailed specifications will support drawing positions with pixel offsets, direct pixel positions, measured targets, anchors, and calculated positions.

Distances will follow the same principle. A bare number represents a drawing-coordinate distance, while structured specifications can combine drawing distances and pixel offsets or provide a direct pixel distance.

The exact TypeScript API will be introduced together with the coordinate and positioning implementations.


## Styling

The package will not depend on Material UI or another application theme system. Drawing primitives will use normal CSS conventions such as `currentColor`, allowing applications to connect their own theme through a small wrapper component.
