import { type Ref, type RefObject, useEffect } from 'react'

import { shallowEqualArrays, shallowEqualObjects } from '@step-wise/js-utils'

import { useForwardedRef, useLatestRef, useReferencePreservingValue, useStableValue } from './refs.ts'

type EventHandler = (event: Event) => void
type EventTargetReference = EventTarget | RefObject<EventTarget | null> | null | undefined
type ListenerRegistration = { readonly target: EventTarget, readonly eventName: string, readonly listener: EventListener }

function areListenerOptionsEqual(current: AddEventListenerOptions | boolean | undefined, previous: AddEventListenerOptions | boolean | undefined): boolean {
	if (typeof current === 'boolean' || typeof previous === 'boolean') return Object.is(current, previous)
	if (!current || !previous) return current === previous
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
	eventNames: string | readonly string[],
	handler: EventHandler,
	targets?: EventTargetReference | readonly EventTargetReference[],
	options?: AddEventListenerOptions | boolean,
): void {
	const handlers = Object.fromEntries((typeof eventNames === 'string' ? [eventNames] : eventNames).map(eventName => [eventName, handler]))
	useEventListeners(handlers, targets, options)
}

export function useEventListeners(handlers: Readonly<Record<string, EventHandler>>, targets?: EventTargetReference | readonly EventTargetReference[], options?: AddEventListenerOptions | boolean): void {
	const eventNames = useReferencePreservingValue(Object.keys(handlers))
	const handlersRef = useLatestRef(handlers)
	const stableOptions = useStableValue(options, areListenerOptionsEqual)
	const inputTargets = targets === undefined
		? (typeof window === 'undefined' ? [] : [window])
		: (Array.isArray(targets) ? targets : [targets])
	const stableTargets = useStableValue(inputTargets, shallowEqualArrays)

	useEffect(() => {
		const resolvedTargets = resolveEventTargets(stableTargets)
		const registrations: ListenerRegistration[] = eventNames.flatMap(eventName => resolvedTargets.map(target => ({
			target,
			eventName,
			listener: event => handlersRef.current[eventName]?.(event),
		})))
		registrations.forEach(({ target, eventName, listener }) => target.addEventListener(eventName, listener, stableOptions))
		return () => registrations.forEach(({ target, eventName, listener }) => target.removeEventListener(eventName, listener, stableOptions))
	}, [eventNames, handlersRef, stableOptions, stableTargets])
}

export function useRefWithEventListeners<T extends EventTarget>(handlers: Readonly<Record<string, EventHandler>>, forwardedRef?: Ref<T>, options?: AddEventListenerOptions | boolean): RefObject<T | null> {
	const ref = useForwardedRef(forwardedRef)
	useEventListeners(handlers, ref, options)
	return ref
}
