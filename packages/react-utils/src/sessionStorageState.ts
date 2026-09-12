import { readSessionStorageValue, writeSessionStorageValue } from '@step-wise/browser-utils'

import { type StorageStateOptions, useStorageState } from './storageState.ts'

export type SessionStorageStateOptions<T> = StorageStateOptions<T>

const configuration = {
	changeEventName: 'react-utils:session-storage-change',
	getStorage: () => typeof window === 'undefined' ? undefined : sessionStorage,
	read: readSessionStorageValue,
	write: writeSessionStorageValue,
}

export function useSessionStorageState<T>(key: string, initialState?: T, options: SessionStorageStateOptions<T> = {}) {
	return useStorageState(configuration, key, initialState, options)
}
