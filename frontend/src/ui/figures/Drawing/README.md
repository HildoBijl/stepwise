# Creating a dynamic Drawing

Using the `Drawing` component you can dynamically render drawings. Want a line, a circle or a piece of text in a certain position? That's easy to achieve! Just follow the following steps.

## Step 1: define the transformationSettings

A drawing always has a coordinate system. This may be completely different from the pixels on the page. The transformation between them must be manually defined.

Luckily there are a few easy ways to do this. Defining `transformationSettings` is always done by using a hook like

```
transformationSettings = useIdentityTransformationSettings(width, height)
```

These transformation settings must then be applied to the drawing through
```
<Drawing transformationSettings={transformationSettings} ... />
```
See the [transformation](./transformation) directory to see all the available hooks and what options they have. Using the right coordinate system will greatly simply making your drawing, so this is important to do.

## Step 2: add drawing components

Once you have transformation settings, you must position stuff on your drawing. There are three ways to do so. All these three ways can be used together when desired, but usually you only need the first two.

- *SVG components* -- If you need shapes, like lines, paths, circles, etcetera, then check out the [svgComponents](./components/svgComponents/) directory.

- *HTML components* -- If you want anything text-related, like labels or equations, see the [htmlComponents](./components/htmlComponents/) directory.

- *Drawing through a Canvas* -- If you are familiar with the HTML Canvas, you can also use this, completely separate from the components above. To do so, first set the `useCanvas` parameter to `true`. (A canvas is not applied by default.) Then, from the Drawing ref (use `<Drawing useCanvas={true} ref={someDrawingRef} ... />`) you can use the `canvas` parameter (like through `someDrawingRef.current.canvas`) and draw in the usual way with a canvas. Optionally, it is also possible to get the 2D context directly through `someDrawingRef.current.context` and apply it.

Out comes a drawing, which hopefully looks as good as you want it to be!

## Step 3: make it dynamic if desired

There are many ways to make drawings dynamic.

- Want to have responses to user interaction? Then add event handlers to the components.
- Want to have the drawing move by itself? Then use the `useAnimation` hook (from the [util/react file](frontend/src/util/react.js)) to call an update function dozens of times per second.

With some creativity you can achieve amazing results.
