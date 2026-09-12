import { readLocalStorageValue, writeLocalStorageValue } from '@step-wise/browser-utils'

import { type StorageStateOptions, useStorageState } from './storageState.ts'

export type LocalStorageStateOptions<T> = StorageStateOptions<T>

const configuration = {
	changeEventName: 'react-utils:local-storage-change',
	getStorage: () => typeof window === 'undefined' ? undefined : localStorage,
	read: readLocalStorageValue,
	write: writeLocalStorageValue,
}

export function useLocalStorageState<T>(key: string, initialState?: T, options: LocalStorageStateOptions<T> = {}) {
	return useStorageState(configuration, key, initialState, options)
}
