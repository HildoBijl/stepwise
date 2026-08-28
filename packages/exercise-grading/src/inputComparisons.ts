import { isPlainObject } from '@step-wise/js-utils'
import type { InputValue } from '@step-wise/input-interpretation'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputComparisonSetting, InputKey } from './types.ts'

function getInputComparisons(data: CheckInputData): Record<string, InputComparisonSetting> | undefined {
	const comparisons = data.metadata.comparisons
	if (comparisons === undefined) return undefined
	if (!isPlainObject(comparisons)) throw new TypeError(`Invalid comparison settings: expected a plain object.`)
	return comparisons as Record<string, InputComparisonSetting>
}

export function resolveInputComparison<TData extends CheckInputData>(key: InputKey<TData>, type: InputValue['type'], data: TData): InputComparisonSetting | undefined {
	const comparisons = getInputComparisons(data)
	const comparison = comparisons?.[key] ?? comparisons?.[type]
	if (comparison !== undefined && typeof comparison !== 'function' && !isPlainObject(comparison)) throw new TypeError(`Invalid comparison setting for key "${key}": expected a function or plain object.`)
	return comparison
}
