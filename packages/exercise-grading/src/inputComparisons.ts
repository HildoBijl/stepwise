import { isPlainObject } from '@step-wise/js-utils'
import type { InputValue } from '@step-wise/input-interpretation'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputComparisonSetting, InputKey } from './types'

function getInputComparisons(data: CheckInputData): Record<string, InputComparisonSetting> | undefined {
	const compareSettings = data.metadata.compare
	if (compareSettings === undefined) return undefined
	if (!isPlainObject(compareSettings)) throw new TypeError(`Invalid comparison settings: expected a plain object.`)
	return compareSettings as Record<string, InputComparisonSetting>
}
export function resolveInputComparison<TData extends CheckInputData>(key: InputKey<TData>, type: InputValue['type'], data: TData): InputComparisonSetting | undefined {
	const compareSettings = getInputComparisons(data)
	const compareSetting = compareSettings?.[key] ?? compareSettings?.[type]
	if (compareSetting !== undefined && typeof compareSetting !== 'function' && !isPlainObject(compareSetting)) throw new TypeError(`Invalid comparison setting for key "${key}": expected a function or plain object.`)
	return compareSetting
}
