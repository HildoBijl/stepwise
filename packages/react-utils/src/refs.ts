import { type Ref, type RefObject, useEffect, useRef } from 'react'

import { preserveRefs } from '@step-wise/js-utils'

export function usePrevious<T>(value: T, initialValue: T): T
export function usePrevious<T>(value: T): T | undefined
export function usePrevious<T>(value: T, initialValue?: T): T | undefined {
	const ref = useRef(initialValue)
	useEffect(() => {
		ref.current = value
	}, [value])
	return ref.current
}

export function useConstant<T>(factory: () => T): T {
	const ref = useRef<{ value: T } | undefined>(undefined)
	if (ref.current === undefined) ref.current = { value: factory() }
	return ref.current.value
}

export function useLatestRef<T>(value: T): RefObject<T> {
	const ref = useRef(value)
	ref.current = value
	return ref
}

export function useLastDefinedValue<T>(value: T | null | undefined): T | undefined {
	const ref = useRef<T | undefined>(undefined)
	if (value !== null && value !== undefined) ref.current = value
	return ref.current
}

export function useReferencePreservingValue<T>(value: T): T {
	const ref = useRef<T | undefined>(undefined)
	ref.current = preserveRefs(value, ref.current)
	return ref.current as T
}

export function useStableValue<T>(value: T, areEqual: (current: T, previous: T) => boolean): T {
	const ref = useRef<{ value: T } | undefined>(undefined)
	if (ref.current === undefined || (!Object.is(value, ref.current.value) && !areEqual(value, ref.current.value))) ref.current = { value }
	return ref.current.value
}

export function useAssertConstant<T>(value: T): T {
	const ref = useRef<{ value: T } | undefined>(undefined)
	if (ref.current === undefined) ref.current = { value }
	if (!Object.is(value, ref.current.value)) throw new Error(`Unexpected value change: expected the value to remain constant, but it changed from "${String(ref.current.value)}" to "${String(value)}".`)
	return value
}

export function useEnsureRef<T>(ref: Ref<T> | undefined | null): Ref<T> {
	const backupRef = useRef<T>(null)
	return ref || backupRef
}
