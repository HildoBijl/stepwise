import { fromKeys } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'

type PositionSource = { clientX?: number, clientY?: number }
type PositionEvent = PositionSource & { touches?: ArrayLike<PositionSource>, changedTouches?: ArrayLike<PositionSource> }

export function resetFocus(field: HTMLElement): void {
	field.blur()
	field.focus()
}

export function getEventPosition(event: PositionEvent): Vector | null {
	const source = event.touches?.[0] ?? event.changedTouches?.[0] ?? event
	if (source.clientX === undefined || source.clientY === undefined) return null
	return new Vector(source.clientX, source.clientY)
}

export function getCoordinatesOf(input: Element | MouseEvent, parent: Element | null = null): { x: number, y: number } {
	let x: number, y: number
	if (input instanceof Event) {
		x = input.clientX
		y = input.clientY
	} else {
		const rect = input.getBoundingClientRect()
		x = rect.x
		y = rect.y
	}
	if (parent) {
		const parentRect = parent.getBoundingClientRect()
		x -= parentRect.x
		y -= parentRect.y
	}
	return { x, y }
}

export function getClickSide(event: MouseEvent): 0 | 1 {
	const rect = (event.target as Element).getBoundingClientRect()
	return (event.clientX - rect.x + 1) * 2 >= rect.width ? 1 : 0
}

export function ignoreBackspaceEvent(event: KeyboardEvent): void { preventDefaultOnKeys(event, 'Backspace') }
export function ignoreHomeEndEvent(event: KeyboardEvent): void { preventDefaultOnKeys(event, ['Home', 'End']) }
export function ignoreArrowKeyEvent(event: KeyboardEvent): void { preventDefaultOnKeys(event, ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) }

export function preventDefaultOnKeys(event: KeyboardEvent, keys: string | readonly string[]): void {
	if ((Array.isArray(keys) ? keys : [keys]).includes(event.key)) event.preventDefault()
}

export function getUtilKeys(event: Pick<KeyboardEvent, 'shiftKey' | 'ctrlKey' | 'altKey'>): Record<'shift' | 'ctrl' | 'alt', boolean> {
	return fromKeys(['shift', 'ctrl', 'alt'] as const, key => {
		const eventKey = `${key}Key` as 'shiftKey' | 'ctrlKey' | 'altKey'
		return event[eventKey]
	})
}

export function getHTMLElement(value: unknown): HTMLElement | null {
	if (value instanceof HTMLElement) return value
	if (value && typeof value === 'object' && 'current' in value && value.current instanceof HTMLElement) return value.current
	return null
}

export function ensureHTMLElement(value: unknown): HTMLElement {
	const element = getHTMLElement(value)
	if (!element) throw new Error(`Invalid HTML Element: could not find an HTML element in the given object. Its type was "${typeof value}".`)
	return element
}
