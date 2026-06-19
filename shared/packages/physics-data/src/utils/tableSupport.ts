import { FloatUnit } from '@step-wise/physics-core'
import { type InterpolationGrid, type InterpolationTable } from '@step-wise/interpolation'

export type RawFloatUnitGrid = readonly (string | number | undefined | RawFloatUnitGrid)[]
export type FloatUnitGrid = InterpolationGrid<FloatUnit>
export type FloatUnitTable = InterpolationTable<FloatUnit, FloatUnit>

export function exactFloatUnits(values: readonly number[], unit: string): FloatUnit[] {
	return values.map(float => new FloatUnit({ float, unit }).makeExact())
}

export function floatUnitGrid(values: RawFloatUnitGrid, unit: string): FloatUnitGrid {
	return values.map(value => Array.isArray(value) ? floatUnitGrid(value, unit) : value === undefined ? undefined : new FloatUnit({ float: value as string | number, unit })) as FloatUnitGrid
}

export function createTable(inputLabels: string[], inputValues: FloatUnit[][], outputLabels: string[], grids: FloatUnitGrid[]): FloatUnitTable {
	return { inputLabels, inputValues, outputLabels, grids }
}
