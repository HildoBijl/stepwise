import { Quantity } from '@step-wise/physics-core'
import { type InterpolationGrid, type InterpolationTable } from '@step-wise/interpolation'

export type RawQuantityGrid = readonly (string | number | undefined | RawQuantityGrid)[]
export type QuantityGrid = InterpolationGrid<Quantity>
export type QuantityTable = InterpolationTable<Quantity, Quantity>

export function exactQuantitys(values: readonly number[], unit: string): Quantity[] {
	return values.map(precisionNumber => new Quantity({ value: precisionNumber, unit }).makeExact())
}

export function quantityGrid(values: RawQuantityGrid, unit: string): QuantityGrid {
	return values.map(value => Array.isArray(value) ? quantityGrid(value, unit) : value === undefined ? undefined : new Quantity({ value: value as string | number, unit })) as QuantityGrid
}
