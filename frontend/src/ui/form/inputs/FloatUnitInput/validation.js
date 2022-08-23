import { nonEmpty } from '../UnitInput'

export function any() { }
export function nonEmptyUnit(floatUnit) {
	return nonEmpty(floatUnit.unit)
}