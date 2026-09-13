# @step-wise/math-display

`@step-wise/math-display` provides concise React components for displaying inline and block mathematics with KaTeX. It is intended for readable mathematical prose and builds on `@step-wise/react-components` for horizontally scrollable block content.


## Installation

```bash
npm install @step-wise/math-display @mui/material @emotion/react @emotion/styled react react-dom
```

React, React DOM, Material UI, and Emotion are peer dependencies. KaTeX is installed by this package. Import its stylesheet once in the consuming application's browser entry point.

KaTeX is intentionally pinned to version 0.12 because the current Step-Wise mathematics input inspects its generated DOM. Upgrade KaTeX only together with that input implementation and its character-matching tests.


## Usage

The short component names form a compact authoring vocabulary for theory and exercise content.

```tsx
import { BM, BMList, BMPart, M } from '@step-wise/math-display'
import 'katex/dist/katex.min.css'

export function QuadraticSolutions() {
	return <>
		<p>The solutions of <M>x^2 - 5x + 6 = 0</M> are:</p>
		<BMList>
			<BMPart>x = 2,</BMPart>
			<BMPart>x = 3.</BMPart>
		</BMList>
		<p>Equivalently:</p>
		<BM>x \in \left\{2, 3\right\}.</BM>
	</>
}
```


## Components

| Export | Behavior |
| --- | --- |
| `M` | Displays inline mathematics. |
| `BM` | Displays one block equation inside a horizontal scroller. |
| `BMList` | Groups several block equations inside one horizontal scroller. |
| `BMPart` | Displays one equation within a `BMList`. |
| `MathContent` | Low-level renderer supporting explicit inline or display mode without a scroller. |

The authoring components retain `tag` and `translation` metadata used by translation tooling.


## LaTeX content

Components accept strings, numbers, nested arrays, and objects with a string `tex` property or `toString()` representation. Non-string values are grouped with braces when inserted into surrounding LaTeX.

`prepareLatex` exposes the preprocessing used before rendering. It escapes percentage signs and converts ordinary parentheses into grouping braces while preserving `\left(` and `\right)` delimiters.

The package also exports `latexMinus`, `zeroWidthSpace`, and `zeroWidthSpaceRegExp` for consumers that must coordinate generated content with KaTeX output.


## Related packages

- `@step-wise/react-components` provides the `HorizontalScroller` used for block content.
- A future mathematics-input package can render through `MathContent` while retaining its editing and cursor logic separately.
