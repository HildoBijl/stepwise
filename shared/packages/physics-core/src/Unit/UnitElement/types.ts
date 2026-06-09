import { type Prefix } from '../Prefix'
import { type BaseUnit } from '../BaseUnit'

export const UnitElementType = 'UnitElement'
export type UnitElementType = typeof UnitElementType

export type UnitElementStorageValue = {
	prefix?: string
	unit: string
	power?: number
}

export type UnitElementParameters = {
	prefix?: Prefix
	unit: BaseUnit
	power: number
}

export type UnitElementInput = string | UnitElementStorageValue | UnitElementParameters
