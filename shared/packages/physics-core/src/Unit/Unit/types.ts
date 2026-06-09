import { type UnitElementStorageValue, type UnitElement, type UnitElementLike, asUnitElement } from '../UnitElement'

export const UnitType = 'Unit'
export type UnitType = typeof UnitType

export type UnitElementArrayStorageValue = UnitElementStorageValue[]
export type UnitElementArrayInput = string | UnitElementLike[]
export type UnitElementArray = UnitElement[]

export type UnitStorageValue = {
	numerator?: UnitElementArrayStorageValue
	denominator?: UnitElementArrayStorageValue
}

export type UnitInput = string | {
	numerator?: UnitElementArrayInput
	denominator?: UnitElementArrayInput
}
