import { type RefObject, useEffect, useReducer, useState } from 'react'

import { useLatestRef } from './refs.ts'
import { useResizeObserver } from './elementSize.ts'
import { useEventListener } from './eventListeners.ts'
import { useStaggeredFunction } from './scheduling.ts'

export function useBoundingClientRect(element: Element | null | undefined): DOMRect | null {
	const [rect, setRect] = useState<DOMRect | null>(null)
	const updateElementPosition = useStaggeredFunction(() => {
		if (element) setRect(element.getBoundingClientRect())
	})
	useEffect(() => updateElementPosition(), [element, updateElementPosition])
	useResizeObserver(document.body, updateElementPosition)
	useResizeObserver(element, updateElementPosition)
	useEventListener('scroll', updateElementPosition, typeof window === 'undefined' ? null : window)
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
	useResizeObserver(element, callback)
	useEventListener('resize', callback, typeof window === 'undefined' ? null : window)
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
	const updateRef = useLatestRef(update)
	useEffect(() => {
		if (field) updateRef.current()
	}, [field, updateRef])
	useResizeObserver(fieldRef, update)
	useUpdateCallback(update)
	return dimension
}
