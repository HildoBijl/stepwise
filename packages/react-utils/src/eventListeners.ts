import { type Ref, type RefCallback, type RefObject, useCallback, useEffect, useImperativeHandle, useState } from 'react'

import { shallowEqualArrays, shallowEqualObjects } from '@step-wise/js-utils'

import { useLatestRef, useReferencePreservingValue, useStableValue } from './refs.ts'

export type EventHandler<EventType extends Event = Event> = (event: EventType) => void
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

export function useEventListener<EventType extends Event = Event>(
	eventNames: string | readonly string[],
	handler: EventHandler<EventType>,
	targets: EventTargetReference | readonly EventTargetReference[],
	options?: AddEventListenerOptions | boolean,
): void {
	const handlers = Object.fromEntries((typeof eventNames === 'string' ? [eventNames] : eventNames).map(eventName => [eventName, handler]))
	useEventListeners(handlers, targets, options)
}

export function useEventListeners<EventType extends Event = Event>(handlers: Readonly<Record<string, EventHandler<EventType>>>, targets: EventTargetReference | readonly EventTargetReference[], options?: AddEventListenerOptions | boolean): void {
	const eventNames = useReferencePreservingValue(Object.keys(handlers))
	const handlersRef = useLatestRef(handlers)
	const stableOptions = useStableValue(options, areListenerOptionsEqual)
	const inputTargets = Array.isArray(targets) ? targets : [targets]
	const stableTargets = useStableValue(inputTargets, shallowEqualArrays)

	useEffect(() => {
		const resolvedTargets = resolveEventTargets(stableTargets)
		const registrations: ListenerRegistration[] = eventNames.flatMap(eventName => resolvedTargets.map(target => ({
			target,
			eventName,
			listener: event => handlersRef.current[eventName]?.(event as EventType),
		})))
		registrations.forEach(({ target, eventName, listener }) => target.addEventListener(eventName, listener, stableOptions))
		return () => registrations.forEach(({ target, eventName, listener }) => target.removeEventListener(eventName, listener, stableOptions))
	}, [eventNames, handlersRef, stableOptions, stableTargets])
}

export function useEventListenerRef<EventType extends Event = Event, T extends EventTarget = EventTarget>(eventNames: string | readonly string[], handler: EventHandler<EventType>, forwardedRef?: Ref<T>, options?: AddEventListenerOptions | boolean): RefCallback<T> {
	const handlers = Object.fromEntries((typeof eventNames === 'string' ? [eventNames] : eventNames).map(eventName => [eventName, handler]))
	return useEventListenersRef(handlers, forwardedRef, options)
}

export function useEventListenersRef<EventType extends Event = Event, T extends EventTarget = EventTarget>(handlers: Readonly<Record<string, EventHandler<EventType>>>, forwardedRef?: Ref<T>, options?: AddEventListenerOptions | boolean): RefCallback<T> {
	const [target, setTarget] = useState<T | null>(null)
	const ref = useCallback((newTarget: T | null) => setTarget(newTarget), [])
	useImperativeHandle(forwardedRef, () => target!, [forwardedRef, target])
	useEventListeners(handlers, target, options)
	return ref
}
