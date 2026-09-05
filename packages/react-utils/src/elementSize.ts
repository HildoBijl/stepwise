import { type RefObject, useLayoutEffect, useState } from 'react'

import { useLatest } from './refs.ts'

export type ResizeObserverTarget<T extends Element = HTMLElement> = T | RefObject<T | null> | null | undefined
export type ResizeObserverCallback = (entry: ResizeObserverEntry, observer: ResizeObserver) => void

export interface UseSizeOptions {
	readonly initialWidth: number
	readonly initialHeight: number
}

function resolveTarget<T extends Element>(target: ResizeObserverTarget<T>): T | null {
	if (!target) return null
	return 'current' in target ? target.current : target
}

export function useResizeObserver<T extends Element>(target: ResizeObserverTarget<T>, callback: ResizeObserverCallback): void {
	const callbackRef = useLatest(callback)
	useLayoutEffect(() => {
		const element = resolveTarget(target)
		if (!element || typeof ResizeObserver === 'undefined') return

		const observer = new ResizeObserver(entries => {
			entries.forEach(entry => callbackRef.current(entry, observer))
		})
		observer.observe(element)
		return () => observer.disconnect()
	}, [target, callbackRef])
}

export function useSize<T extends HTMLElement>(target: ResizeObserverTarget<T>, options?: UseSizeOptions): [number, number] {
	const [size, setSize] = useState<[number, number]>(() => {
		const element = resolveTarget(target)
		return element ? [element.offsetWidth, element.offsetHeight] : [options?.initialWidth ?? 0, options?.initialHeight ?? 0]
	})

	useLayoutEffect(() => {
		const element = resolveTarget(target)
		if (element) setSize([element.offsetWidth, element.offsetHeight])
	}, [target])
	useResizeObserver(target, entry => {
		const element = entry.target as T
		setSize([element.offsetWidth, element.offsetHeight])
	})
	return size
}
