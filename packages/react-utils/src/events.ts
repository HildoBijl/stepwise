import { type RefObject, useEffect, useRef, useState } from 'react'

import { shallowEqualArrays, shallowEqualObjects } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'
import { getEventClientPosition, getModifierKeyState } from '@step-wise/browser-utils'

import { useConsistentValue, useEqualRefOnEquality, useLatest } from './refs.ts'

type EventHandler = (event: Event) => void
type EventTargetReference = EventTarget | RefObject<EventTarget | null> | null | undefined

function areListenerOptionsEqual(current: AddEventListenerOptions | boolean, previous: AddEventListenerOptions | boolean | undefined): boolean {
	if (typeof current === 'boolean' || typeof previous === 'boolean') return Object.is(current, previous)
	if (previous === undefined) return false
	return shallowEqualObjects(current, previous)
}

export function useEventListener(
	eventName: string | string[],
	handler: EventHandler | EventHandler[],
	elements: EventTargetReference | EventTargetReference[] = window,
	options: AddEventListenerOptions | boolean = {},
): void {
	const consistentEventName = useConsistentValue(eventName)
	const handlerRef = useLatest(handler)
	const consistentOptions = useEqualRefOnEquality(options, areListenerOptionsEqual)
	const inputElements = Array.isArray(elements) ? elements : [elements]
	const resolvedElements = inputElements.map(element => {
		if (!element) return false
		if ('addEventListener' in element) return element
		if (element.current && 'addEventListener' in element.current) return element.current
		return false
	}).filter((element): element is EventTarget => !!element)
	const consistentElements = useEqualRefOnEquality(resolvedElements, (current, previous) => Array.isArray(previous) && shallowEqualArrays(current, previous))

	useEffect(() => {
		const eventNames = Array.isArray(consistentEventName) ? consistentEventName : [consistentEventName]
		const redirectingHandlers = eventNames.map((_, index) => (event: Event) => {
			const currentHandler = Array.isArray(handlerRef.current) ? handlerRef.current[index] : handlerRef.current
			currentHandler?.(event)
		})
		eventNames.forEach((name, index) => consistentElements.forEach(element => element.addEventListener(name, redirectingHandlers[index]!, consistentOptions)))
		return () => eventNames.forEach((name, index) => consistentElements.forEach(element => element.removeEventListener(name, redirectingHandlers[index]!)))
	}, [consistentEventName, handlerRef, consistentElements, consistentOptions])
}

export function useEventListeners(handlers: Record<string, EventHandler>, elements?: EventTargetReference | EventTargetReference[], options?: AddEventListenerOptions | boolean): void {
	useEventListener(Object.keys(handlers), Object.values(handlers), elements, options)
}

export function useRefWithEventListeners<T extends EventTarget>(handlers: Record<string, EventHandler>, options?: AddEventListenerOptions | boolean): RefObject<T | null> {
	const ref = useRef<T>(null)
	useEventListeners(handlers, ref, options)
	return ref
}

export function useMouseData(): { position?: Vector | null, keys?: Record<'shift' | 'ctrl' | 'alt', boolean> } {
	const [data, setData] = useState<{ position?: Vector | null, keys?: Record<'shift' | 'ctrl' | 'alt', boolean> }>({})
	const storeData = (event: Event) => setData({
		position: getEventClientPosition(event as MouseEvent | TouchEvent),
		keys: getModifierKeyState(event as KeyboardEvent),
	})
	useEventListener(['mousemove', 'touchstart', 'touchmove'], storeData)
	const processKeyPress = (event: Event) => setData(currentData => ({ ...currentData, keys: getModifierKeyState(event as KeyboardEvent) }))
	useEventListener(['keydown', 'keyup'], processKeyPress)
	return data
}

export function useMousePosition(): Vector | null | undefined {
	return useMouseData().position
}
