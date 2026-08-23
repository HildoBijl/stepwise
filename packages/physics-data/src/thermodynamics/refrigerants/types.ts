import { type Quantity } from '@step-wise/physics-core'
import { createInterpolationTable } from '@step-wise/interpolation'

import { type QuantityGrid, type QuantityTable } from '../../utils'

export type CriticalPoint = { pressure: Quantity, temperature: Quantity, enthalpy: Quantity, entropy: Quantity }
export type RefrigerantPressureTable = { pressure: Quantity, table: QuantityTable }
export type RefrigerantTable = readonly RefrigerantPressureTable[]
export type RefrigerantData = { criticalPoint: CriticalPoint, boilingData: QuantityTable, tablesByPressure: RefrigerantTable }

export function createRefrigerantTable(pressure: Quantity, temperature: Quantity[], enthalpy: QuantityGrid, entropy: QuantityGrid): RefrigerantPressureTable {
	return {
		pressure,
		table: createInterpolationTable({ inputLabels: ['temperature'], inputAxes: [temperature], outputLabels: ['enthalpy', 'entropy'], outputGrids: [enthalpy, entropy] }),
	}
}
