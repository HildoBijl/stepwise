import { isPlainObject } from '@step-wise/js-utils'
import type { InputValue } from '@step-wise/input-interpretation'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputKey, CompareSetting } from './types'

function getCompareSettings(data: CheckInputData): Record<string, CompareSetting> | undefined {
	const compareSettings = data.metadata.compare
	if (compareSettings === undefined) return undefined
	if (!isPlainObject(compareSettings)) throw new TypeError(`Invalid comparison settings: expected a plain object.`)
	return compareSettings as Record<string, CompareSetting>
}
export function getCompareSetting<TData extends CheckInputData>(key: InputKey<TData>, type: InputValue['type'], data: TData): CompareSetting | undefined {
	const compareSettings = getCompareSettings(data)
	const compareSetting = compareSettings?.[key] ?? compareSettings?.[type]
	if (compareSetting !== undefined && typeof compareSetting !== 'function' && !isPlainObject(compareSetting)) throw new TypeError(`Invalid comparison setting for key "${key}": expected a function or plain object.`)
	return compareSetting
}
