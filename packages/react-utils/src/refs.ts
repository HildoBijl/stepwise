import { type MutableRefObject, type Ref, useRef } from 'react'

import { preserveRefs } from '@step-wise/js-utils'

import { usePrevious } from './vendorHooks.ts'

export function useConstant<T>(factory: () => T): T {
	const ref = useRef<T | null>(null)
	return ref.current ?? (ref.current = factory())
}

export function useLatest<T>(value: T, initialValue: T = value): MutableRefObject<T> {
	const ref = useRef(initialValue)
	ref.current = value
	return ref
}

export function useCurrentOrPrevious<T>(value: T): T | undefined {
	const previousValue = usePrevious(value)
	return value || previousValue
}

export function useConsistentValue<T>(value: T): T {
	const ref = useRef<T | undefined>(undefined)
	ref.current = preserveRefs(value, ref.current)
	return ref.current as T
}

export function useEqualRefOnEquality<T>(value: T, equalityCheck: (current: T, previous: T | undefined) => unknown = (current, previous) => {
	return !!current && !!previous && typeof current === 'object' && 'equals' in current && typeof current.equals === 'function' && current.equals(previous)
}): T {
	const ref = useRef<T | undefined>(undefined)
	if (value !== ref.current && !equalityCheck(value, ref.current)) ref.current = value
	return ref.current as T
}

export function useImmutableValue<T>(value: T): T {
	const ref = useRef<T | undefined>(undefined)
	if (value === undefined) throw new Error('Invalid property value: undefined is not allowed for this property.')
	if (ref.current === undefined) ref.current = value
	if (value !== ref.current) throw new Error(`Unallowed property change: the given property is not allowed to change value. However, it changed from "${String(ref.current)}" to "${String(value)}".`)
	return value
}

export function useEnsureRef<T>(ref: Ref<T> | undefined | null): Ref<T> {
	const backupRef = useRef<T>(null)
	return ref || backupRef
}

export function useUUID(): string {
	const ref = useRef<string | undefined>(undefined)
	if (ref.current === undefined) ref.current = crypto.randomUUID()
	return ref.current
}
