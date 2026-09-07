import { useEffect, useReducer } from 'react'

import { useResizeObserver } from './elementSize.ts'
import { useEventListener } from './eventListeners.ts'

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
