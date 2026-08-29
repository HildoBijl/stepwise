import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputKey } from './types.ts'
import { compareInputEntry } from './compareInputEntry.ts'

export function compareInputs<TData extends CheckInputData>(key: InputKey<TData>, data: TData): boolean
export function compareInputs<TData extends CheckInputData>(keys: InputKey<TData>[], data: TData): boolean
export function compareInputs<TData extends CheckInputData>(keys: InputKey<TData> | InputKey<TData>[], data: TData): boolean {
	const keyList = Array.isArray(keys) ? keys : [keys]
	if (keyList.length === 0) throw new RangeError(`Invalid compareInputs call: expected at least one key.`)
	return keyList.map(key => compareInputEntry(key, key, data)).every(result => result)
}
