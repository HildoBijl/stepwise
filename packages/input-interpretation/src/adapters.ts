import type { AnyInputValueAdapter, InputValueAdapters } from './types.ts'

export function getInputValueAdapter(type: string, inputValueAdapters?: InputValueAdapters): AnyInputValueAdapter | undefined {
	if (inputValueAdapters === undefined || !Object.hasOwn(inputValueAdapters, type)) return undefined
	return inputValueAdapters[type]
}
