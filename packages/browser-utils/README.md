# @step-wise/browser-utils

`@step-wise/browser-utils` provides small browser-specific utilities for colors, DOM coordinates and elements, environment detection, and local storage. It does not depend on React. React components and hooks belong in `@step-wise/react-utils`, which may build on this package.


## Installation

```bash
npm install @step-wise/browser-utils
```


## Usage

Import public utilities and types from the package root.

```ts
import { colorToCss, getEventClientPosition, type RgbaColor } from '@step-wise/browser-utils'

const color: RgbaColor = [0.05, 0.5, 0.26, 1]
colorToCss(color) // 'rgba(13, 128, 66, 1)'

document.addEventListener('pointerdown', event => {
	const position = getEventClientPosition(event)
	if (position) console.log(position.x, position.y)
})
```

The package requires a browser environment for APIs such as `window`, `HTMLElement`, and `localStorage`. `getEventClientPosition` returns a `Vector` from `@step-wise/geometry`.


## Colors

Colors use normalized channel values between `0` and `1`. `RgbColor` contains red, green, and blue channels; `RgbaColor` additionally contains alpha. Functions accepting `ColorInput` support either tuple and treat omitted alpha as `1`.

| Export | Behavior |
| --- | --- |
| `RgbColor` | Type for a normalized `[red, green, blue]` tuple. |
| `RgbaColor` | Type for a normalized `[red, green, blue, alpha]` tuple. |
| `ColorInput` | Accepts either `RgbColor` or `RgbaColor`. |
| `colorToCss(color)` | Converts a normalized color to an `rgba(...)` CSS string. |
| `colorToHex(color)` | Converts the RGB channels to six hexadecimal digits without a leading `#`. |
| `mixColors(color1, color2, part?)` | Linearly interpolates all four channels. `part` defaults to `0.5`. |
| `shiftColorBrightness(color, part?)` | Lightens positive shifts and darkens negative shifts while preserving alpha. The shift must be between `-1` and `1`. |


## DOM utilities

| Function | Behavior |
| --- | --- |
| `getEventClientPosition(event)` | Returns pointer client coordinates as a `Vector`, or `undefined` when coordinates are unavailable. |
| `getClientPosition(input, parent?)` | Returns the client position of an element or event-like value. With a parent, the result is relative to the parent's client rectangle. |
| `getHorizontalClickSide(event)` | Returns `0` for the left side of the event target and `1` for the right side. |
| `ModifierKeyState` | Represents the Shift, Control, and Alt state returned for an event. |
| `ModifierKeyEvent` | Structural event type containing Shift, Control, and Alt properties. |
| `getModifierKeyState(event)` | Returns the event's `ModifierKeyState`. |
| `resolveHTMLElement(value)` | Resolves an `HTMLElement` or an object whose `current` property contains one; otherwise returns `null`. |
| `ensureHTMLElement(value)` | Resolves an `HTMLElement` and throws when none is available. |


## Environment

`isLocalhost()` checks whether the current browser hostname is `localhost`, the IPv6 loopback address, or an IPv4 loopback address in the `127.0.0.0/8` range.


## Local storage

| Function | Behavior |
| --- | --- |
| `readLocalStorageValue(key, backup?)` | Reads a value and parses JSON when possible. It returns the original string when parsing fails and the backup when the key is absent. |
| `writeLocalStorageValue(key, value)` | Serializes a value as JSON. Passing `null` or `undefined` removes the stored entry. |

Local-storage values cross an untyped persistence boundary. Consumers should validate values before relying on their shape.

React applications can use `useLocalStorageState` from `@step-wise/react-utils` to subscribe to these values and synchronize updates between components and browser documents.
