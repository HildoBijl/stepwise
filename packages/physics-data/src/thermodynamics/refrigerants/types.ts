import { type Quantity } from '@step-wise/physics-core'
import { createInterpolationTable } from '@step-wise/interpolation'

import { type QuantityGrid, type QuantityTable } from '../../utils'

export type CriticalPoint = { readonly pressure: Quantity, readonly temperature: Quantity, readonly enthalpy: Quantity, readonly entropy: Quantity }
export type RefrigerantPressureTable = { readonly pressure: Quantity, readonly table: QuantityTable }
export type RefrigerantTable = readonly RefrigerantPressureTable[]
export type RefrigerantData = { readonly criticalPoint: CriticalPoint, readonly boilingData: QuantityTable, readonly tablesByPressure: RefrigerantTable }

export function createRefrigerantTable(pressure: Quantity, temperature: Quantity[], enthalpy: QuantityGrid, entropy: QuantityGrid): RefrigerantPressureTable {
	return Object.freeze({
		pressure,
		table: createInterpolationTable({ inputLabels: ['temperature'], inputAxes: [temperature], outputLabels: ['enthalpy', 'entropy'], outputGrids: [enthalpy, entropy] }),
	})
}
