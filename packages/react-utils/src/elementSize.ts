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

interface ElementMeasurementController<Measurement> {
	readonly measurement: Measurement | undefined
	readonly updateMeasurement: () => void
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

function useElementMeasurementController<T extends Element, Measurement>(
	target: ElementReference<T>,
	measure: (element: T) => Measurement,
	areEqual: (current: Measurement, previous: Measurement) => boolean,
	resizeObserverOptions?: ResizeObserverOptions,
): ElementMeasurementController<Measurement> {
	const [measurement, setMeasurement] = useState<Measurement>()
	const measureRef = useLatestRef(measure)
	const areEqualRef = useLatestRef(areEqual)

	const updateMeasurement = useStableCallback(() => {
		const element = resolveElement(target)
		if (!element) {
			setMeasurement(undefined)
			return
		}
		const newMeasurement = measureRef.current(element)
		setMeasurement(previousMeasurement => previousMeasurement !== undefined && areEqualRef.current(newMeasurement, previousMeasurement) ? previousMeasurement : newMeasurement)
	})

	useLayoutEffect(() => { updateMeasurement() })
	useResizeObserver(target, updateMeasurement, resizeObserverOptions)
	return { measurement, updateMeasurement }
}

export function useElementMeasurement<T extends Element, Measurement>(
	target: ElementReference<T>,
	measure: (element: T) => Measurement,
	areEqual: (current: Measurement, previous: Measurement) => boolean = Object.is,
	resizeObserverOptions?: ResizeObserverOptions,
): Measurement | undefined {
	return useElementMeasurementController(target, measure, areEqual, resizeObserverOptions).measurement
}

function areElementSizesEqual(current: ElementSize, previous: ElementSize): boolean {
	return current.width === previous.width && current.height === previous.height
}

export function useElementSize<T extends HTMLElement>(target: ElementReference<T>, options?: ResizeObserverOptions): ElementSize | undefined {
	return useElementMeasurement(target, element => ({ width: element.offsetWidth, height: element.offsetHeight }), areElementSizesEqual, options)
}

function areBoundsEqual(current: DOMRect, previous: DOMRect): boolean {
	return current.x === previous.x && current.y === previous.y && current.width === previous.width && current.height === previous.height
}

export function useElementBounds<T extends Element>(target: ElementReference<T>): DOMRect | undefined {
	const { measurement: bounds, updateMeasurement } = useElementMeasurementController(target, element => element.getBoundingClientRect(), areBoundsEqual)
	const scheduleBoundsUpdate = useCoalescedCallback(updateMeasurement)
	useEventListener(['resize', 'scroll'], scheduleBoundsUpdate, typeof window === 'undefined' ? null : window, { capture: true, passive: true })
	return bounds
}
