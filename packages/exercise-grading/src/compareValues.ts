import { ensureBoolean } from '@step-wise/js-utils'

import type { CheckInputData } from '@step-wise/input-exercises'

import type { CompareSetting } from './types'
import { compareFunctions } from './objects'

type CompareValuesOptions = {
	key: string
	type: string
	compare?: CompareSetting
	data: CheckInputData
}

export function compareValues(input: unknown, correct: unknown, options: CompareValuesOptions): boolean {
	const { key, type, compare, data } = options
	if (typeof compare === 'function') return ensureBoolean(compare(input, correct, data.solution, data))
	const compareFunction = compareFunctions[type as keyof typeof compareFunctions]
	if (compareFunction === undefined) throw new Error(`Invalid compare call: no compare function found for input type "${type}" at key "${key}".`)
	return compareFunction(input as never, correct as never, compare ?? {})
}
