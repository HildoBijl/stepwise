import { type Dispatch, type SetStateAction, useState } from 'react'

import { useAssertConstant } from './refs.ts'

export type StateHandle<T> = readonly [value: T, setValue: Dispatch<SetStateAction<T>>]

export function useControllableState<T>(handle: StateHandle<T> | undefined, initialState: T | (() => T)): StateHandle<T> {
	const controlled = handle !== undefined
	useAssertConstant(controlled)
	if (controlled && (!Array.isArray(handle) || handle.length !== 2 || typeof handle[1] !== 'function')) throw new TypeError('Invalid state handle: expected a [value, setValue] tuple.')

	const [internalValue, setInternalValue] = useState<T>(() => {
		if (handle !== undefined) return handle[0]
		return typeof initialState === 'function' ? (initialState as () => T)() : initialState
	})

	return handle ?? [internalValue, setInternalValue]
}
