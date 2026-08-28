import type { InterpolationValue, InterpolationGrid, InterpolationTable, InterpolationTableDefinition } from './types.ts'
import { isInterpolationTable } from './checks.ts'

export function createInterpolationTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(definition: InterpolationTableDefinition<InputType, OutputType>): InterpolationTable<InputType, OutputType> {
	return ensureInterpolationTable<InputType, OutputType>(definition)
}

export function ensureInterpolationTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(table: unknown): InterpolationTable<InputType, OutputType> {
	if (!isInterpolationTable<InputType, OutputType>(table)) throw new TypeError(`Interpolation error: invalid table received.`)
	return freezeInterpolationTable(table)
}

function freezeInterpolationTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(definition: InterpolationTableDefinition<InputType, OutputType>): InterpolationTable<InputType, OutputType> {
	const table = {
		inputLabels: Object.freeze([...definition.inputLabels]),
		inputAxes: Object.freeze(definition.inputAxes.map(axis => Object.freeze([...axis]))),
		outputLabels: Object.freeze([...definition.outputLabels]),
		outputGrids: Object.freeze(definition.outputGrids.map(grid => cloneAndFreezeGrid(grid))),
	}
	return Object.freeze(table) as InterpolationTable<InputType, OutputType>
}

function cloneAndFreezeGrid<OutputType extends InterpolationValue<OutputType>>(grid: InterpolationGrid<OutputType>): InterpolationGrid<OutputType> {
	return Object.freeze(grid.map(value => Array.isArray(value) ? cloneAndFreezeGrid(value as InterpolationGrid<OutputType>) : value))
}
