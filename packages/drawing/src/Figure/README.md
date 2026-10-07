# Figure

`Figure` provides responsive page layout for content designed at fixed internal pixel dimensions. It preserves the aspect ratio and scales the complete contents uniformly, including HTML, SVG, Canvas, text, and pixel spacing.


## Basic usage

```tsx
import { Figure } from '@step-wise/drawing'

<Figure width={800} height={500} maxWidth={600} alignment="center">
	<div style={{ width: 800, height: 500 }}>Fixed-size contents</div>
</Figure>
```

`width` and `height` define the internal dimensions. This example is designed at `800 × 500` pixels but displays at no more than 600 CSS pixels wide. It shrinks further when its parent is narrower.


## Maximum width

A numeric `maxWidth` limits the displayed width. If omitted, it defaults to the internal `width`, so the figure may shrink but does not grow beyond its designed size.

Use `maxWidth="none"` to let the figure fill its available parent width even when that enlarges it beyond its internal dimensions.

```tsx
<Figure width={400} height={250} maxWidth="none">
	{/* May display wider than 400 CSS pixels. */}
</Figure>
```

Scaling remains uniform in both directions. The internal coordinate system and layout dimensions do not change.


## Alignment

`alignment` controls the figure within the available horizontal space. It can be `left`, `center`, or `right`, and defaults to `center`.

```tsx
<Figure width={500} height={300} alignment="left">...</Figure>
```


## HTML properties and refs

Standard `div` properties apply to the outer responsive element, including `className`, `style`, event handlers, and refs.
