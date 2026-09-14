import type { AnyValueEqualityAdapter, ValueEqualityAdapters } from './types.ts'

export function getValueEqualityAdapter(type: string, valueEqualityAdapters?: ValueEqualityAdapters): AnyValueEqualityAdapter | undefined {
	if (valueEqualityAdapters === undefined || !Object.hasOwn(valueEqualityAdapters, type)) return undefined
	return valueEqualityAdapters[type]
}
