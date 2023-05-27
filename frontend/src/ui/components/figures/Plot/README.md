# Creating Plots

A `Plot` is basically a `Drawing` but then with axes and such added to it. Making a `Plot` is hence very similar to making a `Drawing`. For further info there, see the [Drawing](../Drawing/) folder. Or for the short intro, see below.

## Step 1: define transformation settings

Whenever you create a `Drawing` or `Plot` you must always define `transformationSettings`. For plots this must be done through
```
const transformationSettings = usePlotTransformationSettings(points, options)
```
There are two parameters here.

- The `points` parameter must be an array or object containing plot points. The plot will then scale up to these points. (Do you know the bounds of your plot in advance? Just pass in `[[xMin, yMin], [xMax, yMax]]` to give two points that the plot should encompass.)
- The `options` parameter can provide various other options.
	- `includeOrigin` (default `true`): should the plot have the origin (point `[0,0]`) inside it?
	- `extendBoundsToTicks` (default `true`): should the bounds be extended to encompass axis ticks? For instance, if there's a point with `x = 9.8` then the plot will most likely put an axis tick at `x = 10`. Should this point also be a part of the plot?
	- `desiredNumTicks` (default `[9, 8]`): how many ticks should we aim for, for each of the axes? This is not a definite number, but the script will attempt to be close to this number.
	- `uniform` (default `false`): should the axes have uniform scale?

The result is a `transformationSettings` object that contains a lot of important information about the scaling and bounds of the resulting drawing/plot.

## Step 2: set up the Drawing

Once you have the `transformationSettings`, the rest is relatively easy. You can set up a drawing using
```
return <Drawing transformationSettings={transformationSettings}>
  ... Add drawing components here ...
</Drawing>
```
The drawing components will include plot-specific components (axes, mouse lines, etcetera) but also general drawing shapes, like lines, curves, etcetera.

## Step 3: draw the axes

To have axes in your plot, you must add these inside of the drawing. A good start is using
```
return <Drawing transformationSettings={transformationSettings}>
  <Axes />
</Drawing>
```
The axes have a large variety of options.

- `axisLineStyle`: the style of the two axis lines.
- `tickLineStyle`: the style of all the small axis ticks.
- `tickSize`: the length (in pixels) of the ticks in the negative direction.
- `tickSizeOpposite`: the length (in pixels) of the ticks in the positive direction, which is usually not used.
- `showZeroTick` (default `false`): should there also be a tick at the origin?
- `tickToElement`: a function that turns a tick number into an element to be displayed. This can be overwritten to have custom ticks.
- `gridLines` (default `true`): should grid lines be shown?
- `gridLineStyle`: the style of the faint grid lines in the plot.
- `xLabel`: a string or component representing the label of the x-axis.
- `yLabel`: a string or component representing the label of the y-axis.
- `labelStyle`: a style object for the labels.
- `xLabelShift`: an additional shift for the x-axis-label. If the positioning isn't ideal, you can tune it a bit with this.
- `yLabelShift`: an additional shift for the y-axis-label. If the positioning isn't ideal, you can tune it a bit with this.
- `textScale`: the scale used for all text in the axes, including ticks, labels, etcetera.

With these options you can tune the looks of the axes to your liking.

## Step 3: draw the lines/shapes

Once you have axes, you can add shapes. For this, the default components of the `Drawing` are ideal. For instance, you can use something like
```
const points = [[0,2], [2,3], [3,2], [4,0]]
return <Drawing transformationSettings={transformationSettings}>
  <Axes />
	<Curve points={points} style={{ strokeWidth: 2 }} />
	<Line points={[points[0], points[3]]} style={{ stroke: 'red' }} />
	<Circle center={points[1]} graphicalRadius={3} style={{ fill: 'black' }}>
</Drawing>
```
This sets up a basic plot with a curve, a line and a circle. But you can get as creative as you like. Use rectangles to create a box plot? Use animations to have a moving plot? Use event handlers to create reactive plots? It's all possible.

## Step 4: add extra components as desired

Once you have your plot ready, you can also add a few extra convenient components. Below are some of the possibilities.

### MouseLines

The `MouseLines` are the hover lines when you hover with the mouse over the plot. Add them through
```
return <Drawing transformationSettings={transformationSettings}>
	...
	<MouseLines />
</Drawing>
```
The `MouseLines` have the following options.

- `lineStyle`: a style object for the lines.
- `circleStyle`: a style object for the circle.
- `showAxisLabels` (default `true`): should labels with numbers be shown at the axes?
- `labelStyle`: a style object for the axis labels.
- `valueToLabel`: a function that receives a number (for instance the `x`-value) and outputs a formatted string to be displayed in the axis label. 
- `xValueToLabel`: identical as `valueToLabel`. This can be used to have a function specific to the x-axis label.
- `yValueToLabel`: identical as `valueToLabel`. This can be used to have a function specific to the y-axis label.
- `pointToLabel` (default `undefined`): a function that turns a point (a `Vector` object) into a component to be displayed at the hover point. If not given, no point label is shown.

Having these `MouseLines` makes it easy for users to explore the plot and accurately look up its values.
