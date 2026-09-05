import { type DependencyList, useCallback, useEffect, useState } from 'react'

import { preserveRefs } from '@step-wise/js-utils'
import { readLocalStorageValue, writeLocalStorageValue } from '@step-wise/browser-utils'

import { useEventListener } from './eventListeners.ts'
import { useLatestRef, useReferencePreservingValue } from './refs.ts'

type AnyFunction = (...args: any[]) => any

export function useUpdater(effect: () => void, dependencies: DependencyList): void {
	const consistentDependencies = useReferencePreservingValue(dependencies)
	const effectRef = useLatestRef(effect)
	useEffect(() => effectRef.current(), [effectRef, consistentDependencies])
}

export function useStableCallback<FunctionType extends AnyFunction>(callback: FunctionType, dependencies?: DependencyList): FunctionType {
	const consistentDependencies = useReferencePreservingValue(dependencies)
	const callbackRef = useLatestRef(callback)
	return useCallback(((...args: Parameters<FunctionType>) => callbackRef.current(...args)) as FunctionType, [callbackRef, consistentDependencies])
}

export function useLocalStorageState<T>(key: string, initialState: T): [T, (value: T | ((previous: T) => T)) => void] {
	const [state, setState] = useState<T>(() => (readLocalStorageValue(key) ?? initialState) as T)
	const setLocalStorageState = useCallback((newState: T | ((previous: T) => T)) => {
		setState(previousState => {
			const resolvedState = typeof newState === 'function' ? (newState as (previous: T) => T)(previousState) : newState
			writeLocalStorageValue(key, resolvedState)
			return preserveRefs(resolvedState, previousState)
		})
	}, [key, setState])
	useEventListener('storage', () => setLocalStorageState(readLocalStorageValue(key) as T), typeof window === 'undefined' ? null : window)
	return [state, setLocalStorageState]
}
