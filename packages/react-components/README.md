# @step-wise/react-components

`@step-wise/react-components` provides reusable foundational components for React applications using Material UI. It builds on `@step-wise/react-utils` and contains themed presentation components that are independent of any particular Step-Wise feature or application.


## Installation

```bash
npm install @step-wise/react-components @mui/material @emotion/react @emotion/styled react react-dom
```

React, React DOM, Material UI, and Emotion are peer dependencies. The package currently supports React 19 and Material UI 9.

The package deliberately uses the consuming application's Material UI theme for consistent colors, transitions, dark-mode behavior, and future design-system settings. Applications that do not use Material UI can still reuse the framework-independent `@step-wise/browser-utils` package and the MUI-independent hooks from `@step-wise/react-utils`.


## Usage

Import public components and their types from the package root.

```tsx
import { HorizontalScroller } from '@step-wise/react-components'

export function WideTable() {
	return <HorizontalScroller>
		<table>{/* Wide contents */}</table>
	</HorizontalScroller>
}
```


## HorizontalScroller

`HorizontalScroller` displays contents that may be wider than their container. When overflow is present, it adds a custom horizontal scrollbar and supports touch and pen dragging over the contents. The scrollbar is keyboard-accessible through the arrow, Page Up, Page Down, Home, and End keys.

| Prop | Behavior |
| --- | --- |
| `children` | Contents placed inside the horizontally movable area. |
| `edgePadding` | Empty space in pixels retained at either horizontal edge while scrolling. Defaults to `0`. |
| `scrollbarOverlay` | Places the scrollbar over the contents instead of reserving external space. Defaults to `false`. |

The component observes both its container and contents, so the scrollbar automatically appears, disappears, and resizes when their dimensions change.


## Related packages

- `@step-wise/browser-utils` contains framework-independent browser and DOM primitives.
- `@step-wise/react-utils` contains the hooks used to observe dimensions and browser events.
- `@step-wise/math-display` builds on this package to display scrollable block mathematics.
