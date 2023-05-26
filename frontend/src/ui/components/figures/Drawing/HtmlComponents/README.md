# HTML Components in figures

It is possible to position HTML components inside of Figures. Think of a math symbol like `<M>x</M>` in the right place. There are various components to do so. We'll walk through them one by one.

## Element

You can use an `Element` to position an HTML component, for instance through
```
<Element position={[2,4]}>[Any HTML component]</Element>
```
There are various properties you can define.

- `position`: a `Vector` in drawing coordinates to indicate the position of the element.
- `graphicalPosition`: a `Vector` in graphical coordinates (pixels, with `(0,0)` on the top left of the drawing) to indicate the graphical position of the element. If both the `position` and the `graphicalPosition` are given, they are added together. This allows you to use the `graphicalPosition` as a graphical shift.
- `rotate`: an angle (in radians) to rotate the element.
- `scale`: a scaling factor for the element.
- `anchor`: a `Vector` indicating the anchor point of the element -- which exact point is positioned. Here `Vector(0,0)` denotes top-left and `Vector(1,1)` denotes bottom-right. Default is `Vector(0.5, 0.5)`.
- `ignoreMouse`: should mouse events be ignored? Default is `true`.
- `style`: an extra style object to pass to the containing element.
- `className`: an extra className to pass to the containing element.

## Label (extends Element)

A `Label` attaches a label to a given point, shifted by a given distance. Use it like
```
<Label position={[2,4]} graphicalDistance={6} angle={-Math.PI * 3 / 4}><M>A</M></Label>
```
The `Label` is like an `Element`, but an extra addition is that it is easy to shift it a given distance by a given angle. So *extra* properties are the following.

- `angle`: the direction in which the label should be moved. If the `anchor` is not specified, this angle is also used to automatically position the anchor appropriately.
- `distance`: the distance in drawing coordinates which the label should be moved.
- `graphicalDistance`: the distance in graphical coordinates which the label should be moved. If both distances are given, they are added together (after the distance is scaled to graphical coordinates).

## CornerLabel (extends Element)

A `CornerLabel` is a label that is placed in the corner between two lines. To define it, we need three points defining the angle, where the middle of the three points denotes the corner point. (And since the point is described this way, no `position` or `graphicalPosition` parameter is needed.) So usage is according to
```
<CornerLabel points={[[1,4],[0,0],[4,1]]} graphicalSize={30}><M>\alpha</M></CornerLabel>
```
The available parameters (on top of those of the `Element` are the following.

- `points`: an array of three `Vector` objects in drawing coordinates to indicate the points that form the corner.
- `graphicalPoints`: an array of three `Vector` objects in graphical coordinates. If both sets of points are given, they are added together.
- `size`: a size parameter in drawing metrics.
- `graphicalSize`: a size parameter in graphical metrics. If both size parameters are given, they are added together.

The size parameter has an influence on how far removed the label is from the corner. The larger the size, the further the label is away from the corner to make it fit. More detailed: it is assumed that the label has a circular form with the `size` as the diameter, and given the size of the angle, this circle is then positioned so that it fits inside the corner.

## LineLabel (extends Label)

A `LineLabel` is a label that is placed along a line, between two points. To define it, we need two points defining the line. We also need a third point "oppositeTo" which the label should be placed opposite to. Usage is according to
```
<LineLabel points={[[2,2], [2,8]]} oppositeTo={[0,0]}><M>L</M></LineLabel>
```
Extra properties that can be provided are the following.

- `points`: an array of two `Vector` objects in drawing coordinates, indicating the points through which the line is going. The label is positioned midway between the two points.
- `graphicalPoints`: an array of two `Vector` objects in graphical coordinates, indicating the points through which the line is going. When both points are given, they are added together.
- `oppositeTo`: a `Vector` that denotes a point (in drawing coordinates) on either side of the line. The label is then put on the *other* side of the line.
- `graphicalOppositeTo`: a `Vector` that denotes a point (in graphical coordinates) working the same way as the above parameter. If both are given, they are added together.
