import { type FloatUnit } from '@step-wise/physics-core'

import { type FloatUnitGrid, type FloatUnitTable, createTable } from '../../utils'

export type CriticalPoint = { pressure: FloatUnit, temperature: FloatUnit, enthalpy: FloatUnit, entropy: FloatUnit }
export type RefrigerantPressureTable = { pressure: FloatUnit, table: FloatUnitTable }
export type RefrigerantTable = readonly RefrigerantPressureTable[]
export type RefrigerantData = { criticalPoint: CriticalPoint, boilingData: FloatUnitTable, tablesByPressure: RefrigerantTable }

export function createRefrigerantTable(pressure: FloatUnit, temperature: FloatUnit[], enthalpy: FloatUnitGrid, entropy: FloatUnitGrid): RefrigerantPressureTable {
	return {
		pressure,
		table: createTable(['temperature'], [temperature], ['enthalpy', 'entropy'], [enthalpy, entropy]),
	}
}
