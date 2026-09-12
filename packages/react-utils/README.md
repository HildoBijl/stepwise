# @step-wise/react-utils

`@step-wise/react-utils` provides reusable React hooks and small components for references, lifecycle state, browser events, element measurement, pointer tracking, animation scheduling, portals, and synchronized web-storage state. Browser-only functionality builds on `@step-wise/browser-utils`; general data manipulation remains in `@step-wise/js-utils`.


## Installation

```bash
npm install @step-wise/react-utils react react-dom
```

React and React DOM are peer dependencies. The package currently supports React 19.


## Usage

Import all public utilities and types from the package root.

```tsx
import { useState } from 'react'

import { useElementSize, useEventListener } from '@step-wise/react-utils'

export function MeasuredButton() {
	const [button, setButton] = useState<HTMLButtonElement | null>(null)
	const size = useElementSize(button)
	useEventListener('click', () => console.log('Clicked'), button)

	return <button ref={setButton}>{size ? `${size.width} × ${size.height}` : 'Measuring…'}</button>
}
```

Hooks that access DOM or storage APIs require a browser environment. They avoid accessing `window` during server rendering where possible and return an unavailable or initial value until the browser resource exists.


## React content

| Export | Behavior |
| --- | --- |
| `ensureReactContent(content, options?)` | Requires a React element, string, or number. Strings and numbers can be disabled separately. |
| `EnsureReactContentOptions` | Configures whether strings and numbers are accepted. |
| `Portal` | Renders children into an element or document fragment and renders nothing while its target is unavailable. |


## Lifecycle

| Hook | Behavior |
| --- | --- |
| `useIsMountedRef()` | Returns a stable ref whose value is true while the component is mounted. Reading it does not trigger rendering. |
| `useHasMounted()` | Returns false during the initial render and triggers a render with true after mounting. |


## References and stable values

| Hook | Behavior |
| --- | --- |
| `useConstant(factory)` | Creates a value once for the lifetime of a component instance. |
| `useAssertConstant(value)` | Throws if a value changes after its initial render. |
| `useLatestRef(value)` | Returns a stable ref that always contains the latest rendered value. |
| `usePrevious(value, initialValue?)` | Returns the value from the preceding committed render. |
| `useLastDefinedValue(value)` | Retains the latest value that was neither null nor undefined. |
| `useReferencePreservingValue(value)` | Reuses deeply equal references through `preserveRefs` from `@step-wise/js-utils`. |
| `useStableValue(value, areEqual)` | Retains the previous reference while a supplied equality function considers the values equal. |
| `useStableCallback(callback)` | Returns a stable function that invokes the latest callback implementation. |
| `useForwardedRef(forwardedRef?)` | Provides an internal object ref and exposes its current target through an optional forwarded ref. |

`useStableCallback` is intended for callbacks passed to subscriptions or other APIs that require stable identity. It is not a substitute for React's `useEffectEvent` inside effects where effect-event semantics are appropriate.


## Event listeners

| Export | Behavior |
| --- | --- |
| `useEventListener(eventNames, handler, targets, options?)` | Attaches one handler to one or more event names and targets. |
| `useEventListeners(handlers, targets, options?)` | Attaches handlers selected by event name to one or more targets. |
| `useEventListenerRef(eventNames, handler, forwardedRef?, options?)` | Returns a callback ref and attaches the listener whenever its target is present. |
| `useEventListenersRef(handlers, forwardedRef?, options?)` | Callback-ref counterpart supporting separate handlers by event name. |
| `EventHandler` | Generic event-handler function type. |

Pass `window` explicitly when listening globally. A missing target means that no listener is installed; it does not implicitly mean `window`.

Object refs are resolved when the listener effect runs. Use a callback-ref hook when a target may appear or be replaced without another relevant render.


## Pointer tracking

| Export | Behavior |
| --- | --- |
| `usePointerState()` | Returns the latest client position and Shift, Control, and Alt state. |
| `usePointerPosition()` | Returns only the latest client position. |
| `PointerState` | Readonly pointer position and modifier-key state. |

Pointer tracking is shared across all consumers. Global listeners exist only while at least one hook is subscribed, and repeated pointer updates are coalesced to animation frames. The position is undefined before the first pointer event and after the pointer leaves or the window loses focus.


## Element measurement

| Export | Behavior |
| --- | --- |
| `useResizeObserver(target, callback, options?)` | Observes element resizing and disconnects automatically. |
| `useElementMeasurement(target, measure, areEqual?, options?)` | Measures a custom element property initially and after observed resizes. |
| `useElementSize(target, options?)` | Returns the element's offset width and height. |
| `useElementBounds(target)` | Returns its client bounds and refreshes after resize and captured scroll events. |
| `ElementReference` | An element, an object ref containing one, or an unavailable target. |
| `ElementSize` | Readonly width and height result. |
| `ResizeEntryCallback` | Callback type used by `useResizeObserver`. |

Measurement hooks return undefined while no element is available. Keep object-ref identities stable, as with ordinary `<div ref={elementRef}>` usage. For conditionally mounted or replaceable elements, store the element in state through a callback ref so its appearance triggers rendering.


## Scheduling

| Export | Behavior |
| --- | --- |
| `useAnimation(callback, options?)` | Calls back every animation frame with elapsed active time and the latest frame duration. |
| `AnimationOptions` | Supports an `active` flag for pausing and continuing an animation. |
| `useCoalescedCallback(callback)` | Combines calls before the next animation frame and invokes the callback with the latest arguments. |

The first animation callback after starting or continuing receives an undefined delta. Elapsed time is retained while inactive, so paused time is not included.


## Web-storage state

| Export | Behavior |
| --- | --- |
| `useLocalStorageState(key, initialState?, options?)` | Reads, updates, and subscribes to a JSON-compatible local-storage value. |
| `LocalStorageStateOptions` | Provides an optional parser for validating or converting stored data. |
| `useSessionStorageState(key, initialState?, options?)` | Reads, updates, and subscribes to a JSON-compatible session-storage value. |
| `SessionStorageStateOptions` | Provides an optional parser for validating or converting stored data. |

Updates are synchronized between hook instances in the same document through an internal event and between applicable documents through the browser's `storage` event. Changing the key switches the subscription and reads the new entry. Externally received values are not written back automatically. Session storage is scoped to the current top-level browser tab, making it suitable for state that should survive refreshes without being shared between tabs.

Web storage is an untyped persistence boundary. Supply a parser when the stored value's shape matters.


## Related packages

- `@step-wise/browser-utils` contains the non-React browser, DOM, color, and storage primitives used here.
- `@step-wise/js-utils` contains framework-independent equality and reference-preservation utilities.
- `@step-wise/geometry` supplies the `Vector` returned for pointer positions.
