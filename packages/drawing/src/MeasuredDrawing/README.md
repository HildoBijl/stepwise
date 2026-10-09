# MeasuredDrawing

`MeasuredDrawing` extends `Drawing` with a view derived from named HTML or SVG targets after they render. The bounds passed to `calculateView` are indexed by the unique names in `targets` and use pixel coordinates. Consequently, `top` is the largest y-coordinate when `yDirection` is `up` and the smallest y-coordinate when it is `down`.

```tsx
<MeasuredDrawing
	initialView={{ type: 'identity', width: 1000, height: 600 }}
	targets={['contents']}
	calculateView={({ contents }) => ({
		type: 'identity',
		width: 1000,
		height: contents.bottom + 20,
	})}
>
	<DrawingTarget as="div" target="contents">Measured contents</DrawingTarget>
</MeasuredDrawing>
```

The default initial view is an identity view of `800` by `600` pixels. The drawing is hidden until every requested target has been measured, but remains rendered so measurement can take place. Set `pendingVisibility="visible"` to show the provisional layout.

`calculateView` receives the current coordinate system as its second argument. This is useful when the measured pixel coordinates need to be converted to drawing coordinates.


## Staged target resolution

Targets can resolve in stages. Here the second table waits for the first table's measured bottom, after which the Drawing waits for the second table before setting its final height.

```tsx
<MeasuredDrawing
	initialView={{ type: 'identity', width: 1000, height: 600 }}
	targets={['second-table']}
	calculateView={({ 'second-table': secondTable }) => ({ type: 'identity', width: 1000, height: secondTable.bottom + 20 })}
>
	<HtmlElement anchor={anchors.topLeft} position={{ pixelPosition: [20, 20] }}>
		<DrawingTarget as="div" target="first-table"><FirstTable /></DrawingTarget>
	</HtmlElement>
	<HtmlElement
		anchor={anchors.topRight}
		position={{
			positions: [{ target: 'first-table', anchor: anchors.bottom }],
			calculate: ([firstTableBottom]) => [980, firstTableBottom.y + 20],
		}}>
		<DrawingTarget as="div" target="second-table"><SecondTable /></DrawingTarget>
	</HtmlElement>
</MeasuredDrawing>
```


## TargetBoundsDrawing

`TargetBoundsDrawing` provides the common case where the view should encompass one or more targets with a margin.

```tsx
<TargetBoundsDrawing targets={['title', 'table']} margin={20}>
	<HtmlElement anchor={anchors.topLeft} position={[0, 0]} target="title">Results</HtmlElement>
	<HtmlElement
		anchor={anchors.topLeft}
		position={{ target: 'title', anchor: anchors.bottomLeft, pixelOffset: [0, 20] }}
		target="table"
	>
		<ResultsTable />
	</HtmlElement>
</TargetBoundsDrawing>
```
