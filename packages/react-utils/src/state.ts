import { type DependencyList, useCallback, useEffect, useState } from 'react'

import { preserveRefs } from '@step-wise/js-utils'
import { readLocalStorageValue, writeLocalStorageValue } from '@step-wise/browser-utils'

import { useEventListener } from './events.ts'
import { useConsistentValue, useLatest } from './refs.ts'

type AnyFunction = (...args: any[]) => any

export function useCounter(initialValue = 0): [number, () => void] {
	const [counter, setCounter] = useState(initialValue)
	return [counter, () => setCounter(counter + 1)]
}

export function useUpdater(effect: () => void, dependencies: DependencyList): void {
	const consistentDependencies = useConsistentValue(dependencies)
	const effectRef = useLatest(effect)
	useEffect(() => effectRef.current(), [effectRef, consistentDependencies])
}

export function useStableCallback<FunctionType extends AnyFunction>(callback: FunctionType, dependencies?: DependencyList): FunctionType {
	const consistentDependencies = useConsistentValue(dependencies)
	const callbackRef = useLatest(callback)
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
	useEventListener('storage', () => setLocalStorageState(readLocalStorageValue(key) as T))
	return [state, setLocalStorageState]
}
