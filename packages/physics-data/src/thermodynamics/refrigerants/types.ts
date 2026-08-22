import { type FloatUnit } from '@step-wise/physics-core'
import { createInterpolationTable } from '@step-wise/interpolation'

import { type FloatUnitGrid, type FloatUnitTable } from '../../utils'

export type CriticalPoint = { pressure: FloatUnit, temperature: FloatUnit, enthalpy: FloatUnit, entropy: FloatUnit }
export type RefrigerantPressureTable = { pressure: FloatUnit, table: FloatUnitTable }
export type RefrigerantTable = readonly RefrigerantPressureTable[]
export type RefrigerantData = { criticalPoint: CriticalPoint, boilingData: FloatUnitTable, tablesByPressure: RefrigerantTable }

export function createRefrigerantTable(pressure: FloatUnit, temperature: FloatUnit[], enthalpy: FloatUnitGrid, entropy: FloatUnitGrid): RefrigerantPressureTable {
	return {
		pressure,
		table: createInterpolationTable({ inputLabels: ['temperature'], inputAxes: [temperature], outputLabels: ['enthalpy', 'entropy'], outputGrids: [enthalpy, entropy] }),
	}
}
