import { type RefObject, useEffect, useReducer, useState } from 'react'

import { useEventListener } from './eventListeners.ts'
import { useLatest } from './refs.ts'
import { useStaggeredFunction } from './scheduling.ts'
import { useResizeObserver } from './vendorHooks.ts'

export function useBoundingClientRect(element: Element | null | undefined): DOMRect | null {
	const [rect, setRect] = useState<DOMRect | null>(null)
	const updateElementPosition = useStaggeredFunction(() => {
		if (element) setRect(element.getBoundingClientRect())
	})
	useEffect(() => updateElementPosition(), [element, updateElementPosition])
	useResizeObserver(document.body, updateElementPosition)
	useResizeObserver(element as HTMLElement | null | undefined, updateElementPosition)
	useEventListener('scroll', updateElementPosition)
	if (element && !rect) {
		const actualRect = element.getBoundingClientRect()
		setRect(actualRect)
		return actualRect
	}
	return rect
}

export function useForceUpdate(): () => void {
	return useReducer(() => ({}), {})[1]
}

export function useForceUpdateEffect(): void {
	const forceUpdate = useForceUpdate()
	useEffect(() => forceUpdate(), [forceUpdate])
}

export function useResizeListener(callback: () => void, element: Element | null = document.querySelector('#appInner')): void {
	useResizeObserver(element as HTMLElement | null, callback)
	useEventListener('resize', callback)
}

export function useDimension(
	fieldRef: RefObject<HTMLElement | null>,
	dimensionFunction: ((element: HTMLElement) => unknown) | keyof HTMLElement,
	useUpdateCallback: (update: () => void) => void = () => {},
): unknown {
	const [dimension, setDimension] = useState<unknown>()
	const resolvedDimensionFunction = typeof dimensionFunction === 'string'
		? (element: HTMLElement) => element[dimensionFunction]
		: dimensionFunction
	const update = () => fieldRef.current && setDimension(resolvedDimensionFunction(fieldRef.current))
	const field = fieldRef.current
	const updateRef = useLatest(update)
	useEffect(() => {
		if (field) updateRef.current()
	}, [field, updateRef])
	useResizeObserver(fieldRef as unknown as HTMLElement, update)
	useUpdateCallback(update)
	return dimension
}
