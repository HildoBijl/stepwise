import { type Ref, type RefObject, useEffect } from 'react'

import { shallowEqualArrays, shallowEqualObjects } from '@step-wise/js-utils'

import { useForwardedRef, useLatestRef, useReferencePreservingValue, useStableValue } from './refs.ts'

type EventHandler = (event: Event) => void
type EventTargetReference = EventTarget | RefObject<EventTarget | null> | null | undefined

function areListenerOptionsEqual(current: AddEventListenerOptions | boolean, previous: AddEventListenerOptions | boolean | undefined): boolean {
	if (typeof current === 'boolean' || typeof previous === 'boolean') return Object.is(current, previous)
	if (previous === undefined) return false
	return shallowEqualObjects(current, previous)
}

function resolveEventTargets(references: readonly EventTargetReference[]): EventTarget[] {
	return references.map(reference => {
		if (!reference) return undefined
		if ('addEventListener' in reference) return reference
		return reference.current ?? undefined
	}).filter((target): target is EventTarget => target !== undefined)
}

export function useEventListener(
	eventName: string | string[],
	handler: EventHandler | EventHandler[],
	elements?: EventTargetReference | EventTargetReference[],
	options: AddEventListenerOptions | boolean = {},
): void {
	if (Array.isArray(eventName) && Array.isArray(handler) && eventName.length !== handler.length)
		throw new Error(`Invalid event listeners: received ${eventName.length} event names but ${handler.length} handlers.`)

	const consistentEventName = useReferencePreservingValue(eventName)
	const handlerRef = useLatestRef(handler)
	const consistentOptions = useStableValue(options, areListenerOptionsEqual)
	const inputElements = elements === undefined
		? (typeof window === 'undefined' ? [] : [window])
		: (Array.isArray(elements) ? elements : [elements])
	const targetsDuringRender = resolveEventTargets(inputElements)
	const consistentTargets = useStableValue(targetsDuringRender, shallowEqualArrays)

	useEffect(() => {
		const eventNames = Array.isArray(consistentEventName) ? consistentEventName : [consistentEventName]
		const targets = resolveEventTargets(inputElements)
		const redirectingHandlers = eventNames.map((_, index) => (event: Event) => {
			const currentHandler = Array.isArray(handlerRef.current) ? handlerRef.current[index] : handlerRef.current
			currentHandler?.(event)
		})
		eventNames.forEach((name, index) => targets.forEach(target => target.addEventListener(name, redirectingHandlers[index]!, consistentOptions)))
		return () => eventNames.forEach((name, index) => targets.forEach(target => target.removeEventListener(name, redirectingHandlers[index]!)))
	}, [consistentEventName, handlerRef, consistentOptions, consistentTargets])
}

export function useEventListeners(handlers: Record<string, EventHandler>, elements?: EventTargetReference | EventTargetReference[], options?: AddEventListenerOptions | boolean): void {
	useEventListener(Object.keys(handlers), Object.values(handlers), elements, options)
}

export function useRefWithEventListeners<T extends EventTarget>(handlers: Record<string, EventHandler>, forwardedRef?: Ref<T>, options?: AddEventListenerOptions | boolean): RefObject<T | null> {
	const ref = useForwardedRef(forwardedRef)
	useEventListeners(handlers, ref, options)
	return ref
}
