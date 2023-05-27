# Transformation settings

When creating a `Drawing`, you always need a transformation. This is to translate between the various coordinate systems. Remember, there are three coordinate systems.

 - Drawing coordinates: the coordinates used to define points in the drawing with. For instance, when making a plot, these are the actual plot values.
 - Graphical coordinates: the actual pixels. Usually an image is like 600 pixels wide or so, and this also is in relation to stroke widths of lines, etcetera.
 - Client coordinates: the position with respect to the page. If the drawing is scaled to 50% its original size, then graphical coordinates are made smaller too, but client coordinates are what actually appears on the screen.

Points/locations are always defined in drawing coordinates, while graphical matters (line thickness, font sizes) are defined in graphical coordinates. (The transformations here do not concern client coordinates.)

In this ReadMe, we first look at what information `transformationSettings` contain. Then we look at how to easily define it using various hooks.


## Format

When you obtain a `transformationSettings` object, it will contain the following parameters.

- `transformation`: a `Transformation` object (see the [Geometry toolbox](shared/geometry/)) denoting the transformation from drawing coordinates to graphical coordinates. You can always call `transformation.inverse` to get the inverse transformation, from graphical coordinates to drawing coordinates.
- `bounds`: a `Rectangle` object indicating the bounds of the graphical coordinates. It always has its top at `(0,0)`. You can request for instance the `height` or `width`.
- `scale`: an array `[scaleX, scaleY]` of scale values that are applied in the x- and y-directions.
- `points` (optional): when you initially give an array of `Vector` objects (points) then these are put in drawing coordinates. The resulting array of drawing coordinate points is stored here: your points already put in drawing coordinates for easy use.

Once you have these `transformationSettings`, you then pass them to your `Drawing` so it can properly position its children.


## Types of transformations

To define your own `transformationSettings`, there are various functions available, all depending on how you want to define your drawing coordinates. Pick your favorite function from the options below.

### Identity transformation

If you want to use graphical coordinates as drawing coordinates, then simply pick the identity transformation. Use it through
```
const transformationSettings = useIdentityTransformationSettings(width, height, points)
```
Here the `points` are optional: if provided they are immediately transformed. Important are the `width` and `height` parameter, which define the bounds of the `Drawing`.

### Scale-based transformation

If you know which scale you want to apply (for instance `0.2` for a factor five smaller) then use the scale-and-shift transformation. Set it up through
```
const transformationSettings = useScaleBasedTransformationSettings(points, options)
```
The `points` parameter is an array of `Vector` objects: all points where something happens in your `Drawing`. They are used to determine the `Drawing` bounds after applying the given scales.

Options that can be given are the following.

- `scale` (default `1`): the scaling factor that should be applied. This can be a single factor (a number) or an array of the form `[scaleX, scaleY]` when different scales per direction are needed.
- `margin` (default `0`): the margin (in pixels) that should be added around the points, for display purposes. This can be a single number or a number per direction in the form `[marginX, marginY]`, or even `[[marginLeft, marginRight], [marginTop, marginBottom]]`.
- `pretransformation` (default unused/identity): a `Transformation` object that transforms the points prior to processing them. For instance, maybe you want to rotate a drawing first before displaying it, and rotating a shape generally affects its width and height.

This function first applies the pretransformation, then applies scaling, and then shifts all points such that they fit within the required box.

### Bounds-based transformation

If you already know the desired bounds of your `Drawing` (in pixels/graphical coordinates) then you can use the scale-to-bounds transformation. Set it up through
```
const transformationSettings = useBoundsBasedTransformationSettings(points, options)
```
The `points` parameter is an array of `Vector` objects: all points where something happens in your `Drawing`. They are used to determine the scaling needed to make all points fit within the desired bounds.

Options that can be given are the following.

- `margin` (default `0`): the margin (number of pixels) that will be applied around the points. This can be a number (when equal for `x` and `y`), an array of two numbers `[marginX, marginY]`, or even an array of arrays `[[marginLeft, marginRight], [marginTop, marginBottom]]`.
- `maxWidth` (default `Infinity`): the maximum width that will be applied (including margins).
- `maxHeight` (default `Infinity`): the maximum height that will be applied (including margins).
- `maxScale` (default `Infinity`): the maximum scale that will be applied. This is a number (when equal for `x` and `y`) or an array of two numbers `[maxScaleX, maxScaleY]`.
- `uniform` (default `true`): should uniform scaling be applied?
- `pretransformation` (default unused/identity): a transformation to be applied to each point before anything happens.

This function ensures that, at the end, the `bounds` parameter (a `Rectangle`) has either its `width` equal to the given `maxWidth` or its `height` equal to the given `maxHeight`; whichever limit is reached first.
