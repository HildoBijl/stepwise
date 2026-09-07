import { type RefObject, useLayoutEffect, useState } from 'react'

import { shallowEqualObjects } from '@step-wise/js-utils'

import { useLatestRef, useStableCallback, useStableValue } from './refs.ts'
import { useEventListener } from './eventListeners.ts'
import { useCoalescedCallback } from './scheduling.ts'

export type ElementReference<T extends Element = HTMLElement> = T | RefObject<T | null> | null | undefined
export type ResizeEntryCallback = (entry: ResizeObserverEntry, observer: ResizeObserver) => void

export interface ElementSize {
	readonly width: number
	readonly height: number
}

function resolveElement<T extends Element>(target: ElementReference<T>): T | null {
	if (!target) return null
	return 'current' in target ? target.current : target
}

function areResizeObserverOptionsEqual(current: ResizeObserverOptions | undefined, previous: ResizeObserverOptions | undefined): boolean {
	if (!current || !previous) return current === previous
	return shallowEqualObjects(current, previous)
}

export function useResizeObserver<T extends Element>(target: ElementReference<T>, callback: ResizeEntryCallback, options?: ResizeObserverOptions): void {
	const callbackRef = useLatestRef(callback)
	const stableOptions = useStableValue(options, areResizeObserverOptionsEqual)
	useLayoutEffect(() => {
		const element = resolveElement(target)
		if (!element || typeof ResizeObserver === 'undefined') return

		const observer = new ResizeObserver(entries => { entries.forEach(entry => callbackRef.current(entry, observer)) })
		observer.observe(element, stableOptions)
		return () => observer.disconnect()
	}, [target, callbackRef, stableOptions])
}

export function useElementSize<T extends HTMLElement>(target: ElementReference<T>, options?: ResizeObserverOptions): ElementSize | undefined {
	const [size, setSize] = useState<ElementSize>()
	const updateSize = (element: T | null) => {
		if (!element) {
			setSize(undefined)
			return
		}
		const newSize = { width: element.offsetWidth, height: element.offsetHeight }
		setSize(previousSize => previousSize?.width === newSize.width && previousSize.height === newSize.height ? previousSize : newSize)
	}

	useLayoutEffect(() => {
		updateSize(resolveElement(target))
	}, [target])
	useResizeObserver(target, entry => updateSize(entry.target as T), options)
	return size
}

function areBoundsEqual(current: DOMRect, previous: DOMRect): boolean {
	return current.x === previous.x && current.y === previous.y && current.width === previous.width && current.height === previous.height
}

export function useElementBounds<T extends Element>(target: ElementReference<T>): DOMRect | undefined {
	const [bounds, setBounds] = useState<DOMRect>()

	const updateBounds = useStableCallback(() => {
		const element = resolveElement(target)
		if (!element) {
			setBounds(undefined)
			return
		}
		const newBounds = element.getBoundingClientRect()
		setBounds(previousBounds => previousBounds && areBoundsEqual(newBounds, previousBounds) ? previousBounds : newBounds)
	})
	useLayoutEffect(() => { updateBounds() }, [target, updateBounds])

	const scheduleBoundsUpdate = useCoalescedCallback(updateBounds)
	useResizeObserver(target, scheduleBoundsUpdate)
	useEventListener(['resize', 'scroll'], scheduleBoundsUpdate, typeof window === 'undefined' ? null : window, { capture: true, passive: true })
	return bounds
}
