import { useSyncExternalStore } from 'react'

import type { FormStoreSnapshot } from '../store/index.ts'

import { useFormStore } from './context.tsx'

// The hook to access the form store snapshot from the context.
export function useFormSnapshot(): FormStoreSnapshot {
	const store = useFormStore()
	return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
