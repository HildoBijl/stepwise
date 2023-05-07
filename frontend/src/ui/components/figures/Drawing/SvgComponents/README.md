# SVG Components

There is a variety of SVG components, also known as shapes. These can be included into any Drawing, rendering the required SVG code. Each of them has a variety of properties.

There are a few important things to consider.

- The components make heavy use of the [Step-Wise Geometry](shared/geometry/) toolbox. Think of Vector components to indicate positions, Line components for lines and Rectangle components for rectangles.
- There are multiple coordinate systems. There are drawing coordinates (the coordinate system in which everything is provided) and graphical coordinates (effectively pixels, with top left being `(0,0)`). Whenever a parameter (a distance/point/object) like `radius`, `center` or `Rectangle` is used, this is always in drawing coordinates. Often there is a parallel property `graphicalRadius` or `graphicalCenter` which is in graphical coordinates. You can use either one, and if you use both, then they are added together. (Of course after the drawing-parameter is converted to graphical coordinates.) This is useful if you for instane want to put an element on a position, but want to shift it by a few pixels.

Given that, let's introduce the components and which properties they have.

## All SVG components

All SVG components allow for the following properties.

- `className`: the class given to the SVG object.
- `style`: an extra style object to be applied. This is useful to indicate for instance a stroke through `{ stroke: blue, strokeWidth: 2 }`.
- Event listeners: add a `mouseenter`, `mouseleave`, `click`, `mousedown` or `mouseup` parameter to listen to said event.

On top of that, each component of course also has its own properties.

## Group

In SVG the `<g>` tag is common. Such a `Group` can shift/rotate an entire group of elements. Parameters are:

- `position` and `graphicalPosition`: a `Vector` to indicate where the `Group` should be.
- `scale` (default `1`): a scale factor.
- `rotate` (default `0`): a rotation in radians.
- `overflow` (default `true`): should elements be visible outside of the drawing? Or should they be clipped off at the edge?

## Line

A `Line` is a straight line through multiple points. Parameters are:

- `points` and `graphicalPoints`: an array of `Vectors` to indicate where the line should go.
- `close` (default `false`): whether or not the line should at the end return to the start, creating a closed shape.

## Polygon

A `Polygon` is simply a `Line` but then that automatically has `close` set to `true`, creating a closed shape.

## Curve

A `Curve` is like a `Line`, but then with smooth corners. It has the same options as a `Line` but then additionally the following parameters:

- `through` (default `true`): should the curve go through each given point? Or simply go close to it and bend off before it. This affects the way the curve is drawn.
- `part` (default `1`): how much should the corners be smoothed, as factor? When set to `0` the `Curve` functions as a `Line`. With `1` the corners are maximally curved. In-between values transition gradually.
- `spread` and `graphicalSpread`: how much should the corners be smoothed, as distance? When either of these parameters is set, the `part` is ignored.

The distinction between `part` and `spread` might be confusing. The main difference is in scale. Suppose you have one right corner made up of two very long lines, and one right corner made up of two short lines. Should both corners have the same curve radius? If so, use `spread`. But if the corners should be scaled versions of each other - longer lines should give larger curve radii - then use `part`.

## Circle

The `Circle` is a basic circle component.

- `center` and `graphicalCenter`: a `Vector` indicating the center of the circle.
- `radius` and `graphicalRadius`: a number indicating the radius.

## Rectangle

The `Rectangle` draws a rectangle SVG component. Parameters are:

- `dimensions` and `graphicalDimensions`: a `Rectangle` component from the [Geometry](shared/geometry/) toolbox.
- `cornerRadius` and `graphicalCornerRadius`: a number indicating how much the the corners should be rounded when drawn.

## Square

The `Square` draws a rectangle SVG component with equal sides. Parameters are:

- `center` and `graphicalCenter`: a `Vector` indicating the center of the square.
- `side` and `graphicalSide`: a number indicating the length of the side of a square.

## Arc

The `Arc` is part of a circle. Parameters are:

- `center` and `graphicalCenter`: a `Vector` indicating the center of the circle.
- `radius` and `graphicalRadius`: a number indicating the radius.
- `startAngle` and `endAngle`: both numbers in radians indicating where the circle part should start and end.

## Distance

A `Distance` is a set of arrows indicating a distance in a drawing. Parameters are:

- `span` and `graphicalSpan`: a `Span` object from the [Geometry](shared/geometry/) toolbox indicating the position of the distance.
- `shift` and `graphicalShift`: a `Vector` moving the distance arrow a certain amount to the side. This is useful since distance arrows are often next to an object, not on top of an object.

## BoundedLine

A `BoundedLine` draws a straight line but then it is only drawn within the confines of the drawing. Parameters are:

- `Line` and `graphicalLine`: a `Line` object from the [Geometry](shared/geometry/) toolbox. Note that such a `Line` is always infinitely long. It is cut off by the drawing bounds: only the part within the bounds is drawn.

## RightAngle

A `RightAngle` draws a symbol to indicate that an angle is a right angle. Parameters are:

- `points` and `graphicalPoints`: an array of three points forming the angle. Note that these points are the points on the actual lines: like points `ABC` where `B` is the point actually forming the angle.
- `size` and `graphicalSize`: a number indicating how large the angle should be drawn. A recommendation is to set `graphicalSize` to `10`.
