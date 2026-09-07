// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

import { ensureHTMLElement, getClientPosition, getEventClientPosition, getHorizontalClickSide, getModifierKeyState, resolveHTMLElement } from './dom.ts'

describe('client positions', () => {
	it('reads positions from mouse and touch-like events', () => {
		expect(getEventClientPosition(new MouseEvent('click', { clientX: 12, clientY: 34 }))).toMatchObject({ x: 12, y: 34 })
		expect(getEventClientPosition({ touches: [{ clientX: 56, clientY: 78 }] })).toMatchObject({ x: 56, y: 78 })
		expect(getEventClientPosition({})).toBeUndefined()
	})

	it('measures elements relative to a parent', () => {
		const element = document.createElement('div')
		const parent = document.createElement('div')
		vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ x: 15, y: 27 } as DOMRect)
		vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({ x: 5, y: 7 } as DOMRect)
		expect(getClientPosition(element, parent)).toEqual({ x: 10, y: 20 })
	})

	it('distinguishes the two horizontal halves of an element', () => {
		const element = document.createElement('div')
		vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left: 10, width: 20 } as DOMRect)
		expect(getHorizontalClickSide({ clientX: 19 }, element)).toBe(0)
		expect(getHorizontalClickSide({ clientX: 20 }, element)).toBe(1)
	})
})

describe('DOM values', () => {
	it('reads modifier-key state', () => {
		expect(getModifierKeyState({ shiftKey: true, ctrlKey: false, altKey: true })).toEqual({ shift: true, ctrl: false, alt: true })
	})

	it('resolves elements and element refs', () => {
		const element = document.createElement('div')
		expect(resolveHTMLElement(element)).toBe(element)
		expect(resolveHTMLElement({ current: element })).toBe(element)
		expect(resolveHTMLElement(undefined)).toBeNull()
		expect(ensureHTMLElement(element)).toBe(element)
		expect(() => ensureHTMLElement({ current: null })).toThrow('could not find an HTML element')
	})
})
