import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useEventListener } from './react'

describe('useEventListener', () => {
	it('compares DOM elements by identity when the target changes', () => {
		const firstElement = document.createElement('div')
		const secondElement = document.createElement('div')
		const firstAdd = vi.spyOn(firstElement, 'addEventListener')
		const firstRemove = vi.spyOn(firstElement, 'removeEventListener')
		const secondAdd = vi.spyOn(secondElement, 'addEventListener')
		const handler = vi.fn()

		const { rerender, unmount } = renderHook(
			({ element }) => useEventListener('mousedown', handler, element),
			{ initialProps: { element: firstElement } },
		)

		expect(firstAdd).toHaveBeenCalledTimes(1)
		expect(() => rerender({ element: secondElement })).not.toThrow()
		expect(firstRemove).toHaveBeenCalledTimes(1)
		expect(secondAdd).toHaveBeenCalledTimes(1)

		unmount()
	})

	it('keeps listeners registered when equivalent arrays and options are recreated', () => {
		const element = document.createElement('div')
		const add = vi.spyOn(element, 'addEventListener')
		const remove = vi.spyOn(element, 'removeEventListener')
		const handler = vi.fn()

		const { rerender, unmount } = renderHook(
			({ elements, options }) => useEventListener('click', handler, elements, options),
			{ initialProps: { elements: [element], options: { capture: true } } },
		)

		rerender({ elements: [element], options: { capture: true } })
		expect(add).toHaveBeenCalledTimes(1)
		expect(remove).not.toHaveBeenCalled()

		unmount()
		expect(remove).toHaveBeenCalledTimes(1)
	})
})
