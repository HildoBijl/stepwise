import { type BaseUnit } from './BaseUnit'
import { baseUnits, baseUnitList } from './baseUnits'

export function findBaseUnit(str: string): BaseUnit | undefined {
	return baseUnits[str] ?? baseUnitList.find(unit => unit.equalsString(str))
}
