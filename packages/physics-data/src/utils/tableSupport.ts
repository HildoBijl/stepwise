import { Quantity } from '@step-wise/physics-core'
import { type InterpolationGrid, type InterpolationTable } from '@step-wise/interpolation'

export type QuantityGridInput = readonly (string | number | undefined | QuantityGridInput)[]
export type QuantityInterpolationGrid = InterpolationGrid<Quantity>
export type QuantityInterpolationTable = InterpolationTable<Quantity, Quantity>

export function createExactQuantities(values: readonly number[], unit: string): Quantity[] {
	return values.map(precisionNumber => new Quantity({ value: precisionNumber, unit }).makeExact())
}

export function createQuantityGrid(values: QuantityGridInput, unit: string): QuantityInterpolationGrid {
	return values.map(value => Array.isArray(value) ? createQuantityGrid(value, unit) : value === undefined ? undefined : new Quantity({ value: value as string | number, unit })) as QuantityInterpolationGrid
}
