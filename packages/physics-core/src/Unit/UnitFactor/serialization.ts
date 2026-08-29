import { hasOnlyKeys, isInteger, isPlainObject, isString } from '@step-wise/js-utils'

export type UnitFactorStorageValue = {
	prefix?: string
	unit: string
	power?: number
}

export function isUnitFactorStorageValue(value: unknown): value is UnitFactorStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['prefix', 'unit', 'power']) || !isString(value.unit) || value.unit === '') return false
	return (value.prefix === undefined || isString(value.prefix)) && (value.power === undefined || isInteger(value.power) && value.power > 0)
}
