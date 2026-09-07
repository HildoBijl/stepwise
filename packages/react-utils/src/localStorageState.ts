import { type Dispatch, type SetStateAction, useCallback, useMemo, useSyncExternalStore } from 'react'

import { readLocalStorageValue, writeLocalStorageValue } from '@step-wise/browser-utils'

const localStorageChangeEvent = 'react-utils:local-storage-change'

export interface LocalStorageStateOptions<T> {
	parse?: (value: unknown) => T
}

function subscribeToLocalStorageKey(key: string, notify: () => void): () => void {
	if (typeof window === 'undefined') return () => undefined
	const handleStorageChange = (event: StorageEvent) => {
		if (event.storageArea === localStorage && event.key === key) notify()
	}
	const handleLocalChange = (event: Event) => {
		if ((event as CustomEvent<string>).detail === key) notify()
	}
	window.addEventListener('storage', handleStorageChange)
	window.addEventListener(localStorageChangeEvent, handleLocalChange)
	return () => {
		window.removeEventListener('storage', handleStorageChange)
		window.removeEventListener(localStorageChangeEvent, handleLocalChange)
	}
}

function getStoredValue(key: string): string | null {
	return typeof window === 'undefined' ? null : localStorage.getItem(key)
}

export function useLocalStorageState<T>(key: string, initialState?: T, options: LocalStorageStateOptions<T> = {}): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
	const subscribe = useCallback((notify: () => void) => subscribeToLocalStorageKey(key, notify), [key])
	const getSnapshot = useCallback(() => getStoredValue(key), [key])
	const storedValue = useSyncExternalStore(subscribe, getSnapshot, () => null)
	const state = useMemo(() => {
		if (storedValue === null) return initialState
		const value = readLocalStorageValue(key)
		return options.parse ? options.parse(value) : value as T
	}, [initialState, key, options.parse, storedValue])
	const setState = useCallback<Dispatch<SetStateAction<T | undefined>>>(newState => {
		if (typeof window === 'undefined') return
		const storedState = readLocalStorageValue(key, initialState) as T | undefined
		const parsedState = options.parse ? options.parse(storedState) : storedState
		const resolvedState = typeof newState === 'function' ? (newState as (previous: T | undefined) => T | undefined)(parsedState) : newState
		writeLocalStorageValue(key, resolvedState)
		window.dispatchEvent(new CustomEvent(localStorageChangeEvent, { detail: key }))
	}, [initialState, key, options.parse])
	return [state, setState]
}
