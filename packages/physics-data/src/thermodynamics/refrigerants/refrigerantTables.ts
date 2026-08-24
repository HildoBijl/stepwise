import { type Quantity } from '@step-wise/physics-core'
import { createInterpolationTable } from '@step-wise/interpolation'

import { type QuantityInterpolationGrid, type QuantityInterpolationTable } from '../../utils'

export type CriticalPoint = { readonly pressure: Quantity, readonly temperature: Quantity, readonly enthalpy: Quantity, readonly entropy: Quantity }
export type RefrigerantPressureTable = { readonly pressure: Quantity, readonly table: QuantityInterpolationTable }
export type RefrigerantPressureTables = readonly RefrigerantPressureTable[]
export type RefrigerantDataset = { readonly criticalPoint: CriticalPoint, readonly saturationTable: QuantityInterpolationTable, readonly tablesByPressure: RefrigerantPressureTables }

export function createRefrigerantPressureTable(pressure: Quantity, temperature: Quantity[], enthalpy: QuantityInterpolationGrid, entropy: QuantityInterpolationGrid): RefrigerantPressureTable {
	return Object.freeze({
		pressure,
		table: createInterpolationTable({ inputLabels: ['temperature'], inputAxes: [temperature], outputLabels: ['enthalpy', 'entropy'], outputGrids: [enthalpy, entropy] }),
	})
}
