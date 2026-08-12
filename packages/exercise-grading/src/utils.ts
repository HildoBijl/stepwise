import type { InputValue } from '@step-wise/input-interpretation'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputKey, CompareSetting } from './types'

function getCompareSettings(data: CheckInputData): Record<string, CompareSetting> | undefined {
	return data.metaData.compare as Record<string, CompareSetting> | undefined
}
export function getCompareSetting<TData extends CheckInputData>(key: InputKey<TData>, type: InputValue['type'], data: TData): CompareSetting | undefined {
	const compareSettings = getCompareSettings(data)
	return compareSettings?.[key] ?? compareSettings?.[type]
}
