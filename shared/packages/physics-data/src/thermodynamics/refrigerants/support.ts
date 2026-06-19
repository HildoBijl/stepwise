import { rangeInterpolate, getInterpolationPart, getClosestIndices, tableInterpolate, multiOutputTableInterpolate, inverseTableInterpolate, isValidInterpolationPart } from '@step-wise/interpolation'
import { FloatUnit } from '@step-wise/physics-core'

import { type RefrigerantPressureTable, type RefrigerantData } from './utils'

export type RefrigerantPhase = 'liquid' | 'vapor' | 'gas'
export type RefrigerantProperties = {
	pressure: FloatUnit
	temperature: FloatUnit
	enthalpy: FloatUnit
	entropy: FloatUnit
	phase: RefrigerantPhase
	vaporFraction?: number
}

type SubTables = { tables: [RefrigerantPressureTable, RefrigerantPressureTable], part: number }

/*
 * Small functions determining a single value.
 */

// From temperature, get the corresponding boiling pressure.
export function getBoilingPressure(data: RefrigerantData, temperature: FloatUnit): FloatUnit | undefined {
	return tableInterpolate(temperature, data.boilingData, 'pressure')
}

// From pressure, get the corresponding boiling temperature.
export function getBoilingTemperature(data: RefrigerantData, pressure: FloatUnit): FloatUnit | undefined {
	return inverseTableInterpolate(pressure, data.boilingData, 'pressure')
}

// From temperature/pressure and enthalpy, get the phase ('liquid', 'vapor' or 'gas').
export function getPhaseFromTemperature(data: RefrigerantData, temperature: FloatUnit, enthalpy: FloatUnit): RefrigerantPhase | undefined {
	const boiling = multiOutputTableInterpolate(temperature, data.boilingData, ['enthalpyLiquid', 'enthalpyVapor'])
	if (boiling.enthalpyLiquid === undefined || boiling.enthalpyVapor === undefined) return undefined
	if (enthalpy.compare(boiling.enthalpyLiquid) <= 0) return 'liquid'
	if (enthalpy.compare(boiling.enthalpyVapor) >= 0) return 'gas'
	return 'vapor'
}
export function getPhaseFromPressure(data: RefrigerantData, pressure: FloatUnit, enthalpy: FloatUnit): RefrigerantPhase | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getPhaseFromTemperature(data, temperature, enthalpy)
}

// From temperature and enthalpy, check if the point is in the boiling region.
export function isBoiling(data: RefrigerantData, temperature: FloatUnit, enthalpy: FloatUnit): boolean {
	return getPhaseFromTemperature(data, temperature, enthalpy) === 'vapor'
}

/*
 * Functions determining a range of properties, using only the boiling data.
 */

// From temperature and known line, get all properties.
export function getLinePropertiesFromTemperature(data: RefrigerantData, temperature: FloatUnit, liquidLine = true): RefrigerantProperties | undefined {
	const addendum = liquidLine ? 'Liquid' : 'Vapor'
	const enthalpyLabel = `enthalpy${addendum}`
	const entropyLabel = `entropy${addendum}`

	const pointData = multiOutputTableInterpolate(temperature, data.boilingData, ['pressure', enthalpyLabel, entropyLabel])
	const { pressure } = pointData
	const enthalpy = pointData[enthalpyLabel]
	const entropy = pointData[entropyLabel]

	if (pressure === undefined || enthalpy === undefined || entropy === undefined) return undefined
	return { pressure, temperature, enthalpy, entropy, phase: liquidLine ? 'liquid' : 'gas' }
}

// From pressure and known line, get all properties.
export function getLinePropertiesFromPressure(data: RefrigerantData, pressure: FloatUnit, liquidLine = true): RefrigerantProperties | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getLinePropertiesFromTemperature(data, temperature, liquidLine)
}

export function getLiquidLinePropertiesFromTemperature(data: RefrigerantData, temperature: FloatUnit): RefrigerantProperties | undefined {
	return getLinePropertiesFromTemperature(data, temperature, true)
}

export function getLiquidLinePropertiesFromPressure(data: RefrigerantData, pressure: FloatUnit): RefrigerantProperties | undefined {
	return getLinePropertiesFromPressure(data, pressure, true)
}

export function getVaporLinePropertiesFromTemperature(data: RefrigerantData, temperature: FloatUnit): RefrigerantProperties | undefined {
	return getLinePropertiesFromTemperature(data, temperature, false)
}

export function getVaporLinePropertiesFromPressure(data: RefrigerantData, pressure: FloatUnit): RefrigerantProperties | undefined {
	return getLinePropertiesFromPressure(data, pressure, false)
}

// From temperature and vapor fraction, get all properties.
export function getVaporPropertiesFromTemperature(data: RefrigerantData, temperature: FloatUnit, vaporFraction: number): RefrigerantProperties | undefined {
	if (vaporFraction < 0 || vaporFraction > 1) throw new Error(`Invalid vapor fraction: it has to be a number between 0 and 1, and not ${vaporFraction}.`)
	const { pressure, enthalpyLiquid, enthalpyVapor, entropyLiquid, entropyVapor } = multiOutputTableInterpolate(temperature, data.boilingData, ['pressure', 'enthalpyLiquid', 'enthalpyVapor', 'entropyLiquid', 'entropyVapor'])
	if (pressure === undefined || enthalpyLiquid === undefined || enthalpyVapor === undefined || entropyLiquid === undefined || entropyVapor === undefined) return undefined

	const enthalpy = rangeInterpolate(vaporFraction, [enthalpyLiquid, enthalpyVapor], [0, 1])
	const entropy = rangeInterpolate(vaporFraction, [entropyLiquid, entropyVapor], [0, 1])
	if (enthalpy === undefined || entropy === undefined) return undefined

	return { temperature, vaporFraction, pressure, enthalpy, entropy, phase: 'vapor' }
}

// From pressure and vapor fraction, get all properties.
export function getVaporPropertiesFromPressure(data: RefrigerantData, pressure: FloatUnit, vaporFraction: number): RefrigerantProperties | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getVaporPropertiesFromTemperature(data, temperature, vaporFraction)
}

/*
 * Functions determining a range of properties, using the full table.
 */

// Find a substance's properties based on the input values: pressure and temperature.
export function getRefrigerantProperties(data: RefrigerantData, pressure: FloatUnit, temperature: FloatUnit): RefrigerantProperties | undefined {
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined

	const enthalpy = getRefrigerantPropertyFromSubTables(subTables, temperature, 'enthalpy')
	const entropy = getRefrigerantPropertyFromSubTables(subTables, temperature, 'entropy')
	if (enthalpy === undefined || entropy === undefined) return undefined

	const phase = getPhaseFromTemperature(data, temperature, enthalpy)
	if (phase === undefined) return undefined

	return { pressure, temperature, enthalpy, entropy, phase }
}

// Find a substance's properties based on pressure and another property.
export function getRefrigerantPropertiesFromParameter(data: RefrigerantData, pressure: FloatUnit, parameter: FloatUnit, parameterLabel: string): RefrigerantProperties | undefined {
	const label = ensureValidParameterLabel(parameterLabel)
	const temperature = label === data.tablesByPressure[0].table.inputLabels[0] ? parameter : getRefrigerantTemperatureFromParameter(data, pressure, parameter, label)
	return temperature && getRefrigerantProperties(data, pressure, temperature)
}

// Given a parameter like enthalpy/entropy, find the corresponding temperature at the given pressure.
function getRefrigerantTemperatureFromParameter(data: RefrigerantData, pressure: FloatUnit, parameter: FloatUnit, parameterLabel: string): FloatUnit | undefined {
	const label = ensureValidParameterLabel(parameterLabel)
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined
	const temperatures = subTables.tables.map(table => inverseTableInterpolate(parameter, table.table, label))
	if (temperatures[0] === undefined || temperatures[1] === undefined) return undefined
	return rangeInterpolate(subTables.part, [temperatures[0], temperatures[1]], [0, 1])
}

function getRefrigerantSubTables(data: RefrigerantData, pressure: FloatUnit): SubTables | undefined {
	const tables = data.tablesByPressure
	const [min, max] = getClosestIndices(pressure, index => tables[index].pressure, tables.length)
	const closestTables = [tables[min], tables[max]] as [RefrigerantPressureTable, RefrigerantPressureTable]
	const pressurePart = getInterpolationPart(pressure, [closestTables[0].pressure, closestTables[1].pressure])
	return isValidInterpolationPart(pressurePart) ? { tables: closestTables, part: pressurePart } : undefined
}

function getRefrigerantPropertyFromSubTables(subTables: SubTables, temperature: FloatUnit, outputLabel: string): FloatUnit | undefined {
	const values = subTables.tables.map(table => tableInterpolate(temperature, table.table, outputLabel))
	if (values[0] === undefined || values[1] === undefined) return undefined
	return rangeInterpolate(subTables.part, [values[0], values[1]], [0, 1])
}

function ensureValidParameterLabel(parameterLabel: string): string {
	if (!['temperature', 'enthalpy', 'entropy'].includes(parameterLabel)) throw new Error(`Interpolate error: invalid parameter label "${parameterLabel}" given. Expected temperature, enthalpy or entropy.`)
	return parameterLabel
}
