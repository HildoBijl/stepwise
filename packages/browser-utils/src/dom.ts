import { Vector } from '@step-wise/geometry'

type PositionSource = { clientX?: number, clientY?: number }
type PositionEvent = PositionSource & { touches?: ArrayLike<PositionSource>, changedTouches?: ArrayLike<PositionSource> }

export interface ModifierKeyState {
	readonly shift: boolean
	readonly ctrl: boolean
	readonly alt: boolean
}

export type ModifierKeyEvent = Pick<KeyboardEvent, 'shiftKey' | 'ctrlKey' | 'altKey'>

export function getEventClientPosition(event: PositionEvent): Vector | undefined {
	const source = event.touches?.[0] ?? event.changedTouches?.[0] ?? event
	if (source.clientX === undefined || source.clientY === undefined) return undefined
	return new Vector(source.clientX, source.clientY)
}

export function getClientPosition(input: Element | PositionSource, parent: Element | null = null): { x: number, y: number } {
	let x: number, y: number
	if ('getBoundingClientRect' in input) {
		const rect = input.getBoundingClientRect()
		x = rect.x
		y = rect.y
	} else {
		if (input.clientX === undefined || input.clientY === undefined) throw new TypeError('Invalid position source: client coordinates are missing.')
		x = input.clientX
		y = input.clientY
	}
	if (parent) {
		const parentRect = parent.getBoundingClientRect()
		x -= parentRect.x
		y -= parentRect.y
	}
	return { x, y }
}

export function getHorizontalClickSide(event: MouseEvent): 0 | 1 {
	const rect = (event.target as Element).getBoundingClientRect()
	return (event.clientX - rect.x + 1) * 2 >= rect.width ? 1 : 0
}

export function getModifierKeyState(event: ModifierKeyEvent): ModifierKeyState {
	return { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey }
}

export function resolveHTMLElement(value: unknown): HTMLElement | null {
	if (value instanceof HTMLElement) return value
	if (value && typeof value === 'object' && 'current' in value && value.current instanceof HTMLElement) return value.current
	return null
}

export function ensureHTMLElement(value: unknown): HTMLElement {
	const element = resolveHTMLElement(value)
	if (!element) throw new Error(`Invalid HTML Element: could not find an HTML element in the given object. Its type was "${typeof value}".`)
	return element
}
