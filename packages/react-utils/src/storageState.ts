import { type Dispatch, type SetStateAction, useCallback, useMemo, useSyncExternalStore } from 'react'

export interface StorageStateOptions<T> {
	readonly parse?: (value: unknown) => T
}

export interface StorageStateConfiguration {
	readonly changeEventName: string
	readonly getStorage: () => Storage | undefined
	readonly read: <T>(key: string, backup?: T) => T | unknown
	readonly write: (key: string, value: unknown) => void
}

function subscribeToStorageKey(configuration: StorageStateConfiguration, key: string, notify: () => void): () => void {
	if (typeof window === 'undefined') return () => undefined
	const storage = configuration.getStorage()
	const handleStorageChange = (event: StorageEvent) => {
		if (event.storageArea === storage && event.key === key) notify()
	}
	const handleLocalChange = (event: Event) => {
		if ((event as CustomEvent<string>).detail === key) notify()
	}
	window.addEventListener('storage', handleStorageChange)
	window.addEventListener(configuration.changeEventName, handleLocalChange)
	return () => {
		window.removeEventListener('storage', handleStorageChange)
		window.removeEventListener(configuration.changeEventName, handleLocalChange)
	}
}

function getStoredValue(configuration: StorageStateConfiguration, key: string): string | null {
	return configuration.getStorage()?.getItem(key) ?? null
}

export function useStorageState<T>(configuration: StorageStateConfiguration, key: string, initialState?: T, options: StorageStateOptions<T> = {}): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
	// Set up the sync to the store.
	const subscribe = useCallback((notify: () => void) => subscribeToStorageKey(configuration, key, notify), [configuration, key])
	const getSnapshot = useCallback(() => getStoredValue(configuration, key), [configuration, key])
	const storedValue = useSyncExternalStore(subscribe, getSnapshot, () => null)

	// Read/determine the state.
	const state = useMemo(() => {
		if (storedValue === null) return initialState
		const value = configuration.read(key)
		return options.parse ? options.parse(value) : value as T
	}, [configuration, initialState, key, options.parse, storedValue])

	// Set up the setter.
	const setState = useCallback<Dispatch<SetStateAction<T | undefined>>>(newState => {
		if (!configuration.getStorage()) return
		const storedState = configuration.read(key, initialState) as T | undefined
		const parsedState = options.parse ? options.parse(storedState) : storedState
		const resolvedState = typeof newState === 'function' ? (newState as (previous: T | undefined) => T | undefined)(parsedState) : newState
		configuration.write(key, resolvedState)
		window.dispatchEvent(new CustomEvent(configuration.changeEventName, { detail: key }))
	}, [configuration, initialState, key, options.parse])

	// Return the state and setter.
	return [state, setState]
}
