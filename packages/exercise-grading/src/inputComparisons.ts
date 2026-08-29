import { isPlainObject } from '@step-wise/js-utils'
import type { InputValue } from '@step-wise/input-interpretation'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputComparisonSetting, InputKey } from './types.ts'

export function isInputComparisonSetting(value: unknown): value is InputComparisonSetting {
	return typeof value === 'function' || isPlainObject(value)
}

function isInputComparisons(value: unknown): value is Record<string, InputComparisonSetting> {
	return isPlainObject(value) && Object.values(value).every(isInputComparisonSetting)
}

function getInputComparisons(data: CheckInputData): Record<string, InputComparisonSetting> | undefined {
	const comparisons = data.metadata.comparisons
	if (comparisons === undefined) return undefined
	if (!isInputComparisons(comparisons)) throw new TypeError(`Invalid comparison settings: expected a plain object containing only functions or plain objects.`)
	return comparisons
}

export function resolveInputComparison<TData extends CheckInputData>(key: InputKey<TData>, type: InputValue['type'], data: TData): InputComparisonSetting | undefined {
	const comparisons = getInputComparisons(data)
	return comparisons?.[key] ?? comparisons?.[type]
}