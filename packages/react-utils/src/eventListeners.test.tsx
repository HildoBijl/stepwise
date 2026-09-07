// @vitest-environment jsdom

import { createRef, useState } from 'react'
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import './testSetup.ts'
import { useEventListener, useEventListeners, useEventListenerRef, useEventListenersRef } from './eventListeners.ts'

describe('event listener hooks', () => {
	it('registers listeners and uses the latest handler', () => {
		const target = document.createElement('div')
		const firstHandler = vi.fn()
		const secondHandler = vi.fn()
		const { rerender, unmount } = renderHook(({ handler }) => useEventListener<MouseEvent>('click', handler, target), { initialProps: { handler: firstHandler } })
		fireEvent.click(target)
		rerender({ handler: secondHandler })
		fireEvent.click(target)
		expect(firstHandler).toHaveBeenCalledOnce()
		expect(secondHandler).toHaveBeenCalledOnce()
		unmount()
		fireEvent.click(target)
		expect(secondHandler).toHaveBeenCalledOnce()
	})

	it('supports multiple events and targets', () => {
		const targets = [document.createElement('div'), document.createElement('div')]
		const click = vi.fn()
		const focus = vi.fn()
		renderHook(() => useEventListeners({ click, focus }, targets))
		targets.forEach(target => {
			fireEvent.click(target)
			fireEvent.focus(target)
		})
		expect(click).toHaveBeenCalledTimes(2)
		expect(focus).toHaveBeenCalledTimes(2)
	})
})

describe('event-listener refs', () => {
	it('starts listening when a target is attached later', () => {
		const handler = vi.fn()
		function Component() {
			const [visible, setVisible] = useState(false)
			const ref = useEventListenerRef<MouseEvent, HTMLButtonElement>('click', handler)
			return <><button onClick={() => setVisible(true)}>Show</button>{visible ? <button ref={ref}>Target</button> : null}</>
		}
		const { getByText } = render(<Component />)
		fireEvent.click(getByText('Show'))
		fireEvent.click(getByText('Target'))
		expect(handler).toHaveBeenCalledOnce()
	})

	it('supports multiple handlers and forwards the target', () => {
		const forwardedRef = createRef<HTMLDivElement>()
		const click = vi.fn()
		const ref = renderHook(() => useEventListenersRef({ click }, forwardedRef)).result.current
		const element = document.createElement('div')
		act(() => ref(element))
		fireEvent.click(element)
		expect(forwardedRef.current).toBe(element)
		expect(click).toHaveBeenCalledOnce()
		act(() => ref(null))
		expect(forwardedRef.current).toBeNull()
	})
})
