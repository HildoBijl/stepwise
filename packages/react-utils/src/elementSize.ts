import { type RefObject, useLayoutEffect, useState } from 'react'

import { shallowEqualObjects } from '@step-wise/js-utils'

import { useLatestRef, useStableValue } from './refs.ts'

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

		const observer = new ResizeObserver(entries => {
			entries.forEach(entry => callbackRef.current(entry, observer))
		})
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
