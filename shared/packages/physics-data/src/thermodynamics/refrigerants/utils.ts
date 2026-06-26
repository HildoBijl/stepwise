import { rangeInterpolate, getInterpolationPart, getClosestIndices, tableInterpolate, multiOutputTableInterpolate, inverseTableInterpolate, isValidInterpolationPart } from '@step-wise/interpolation'
import { FloatUnit } from '@step-wise/physics-core'

import { type RefrigerantPressureTable, type RefrigerantData } from './types'

export type RefrigerantPhase = 'liquid' | 'vapor' | 'gas'
export type RefrigerantProperties = {
	pressure: FloatUnit
	temperature: FloatUnit
	enthalpy: FloatUnit
	entropy: FloatUnit
	phase: RefrigerantPhase
	vaporFraction?: FloatUnit
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

// From temperature/pressure and enthalpy/entropy, get the vapor fraction.
export function getVaporFractionFromTemperatureAndEnthalpy(data: RefrigerantData, temperature: FloatUnit, enthalpy: FloatUnit): FloatUnit | undefined {
	const { enthalpyLiquid, enthalpyVapor } = multiOutputTableInterpolate(temperature, data.boilingData, ['enthalpyLiquid', 'enthalpyVapor'])
	if (enthalpyLiquid === undefined || enthalpyVapor === undefined) return undefined
	return enthalpy.subtract(enthalpyLiquid).divide(enthalpyVapor.subtract(enthalpyLiquid))
}
export function getVaporFractionFromPressureAndEnthalpy(data: RefrigerantData, pressure: FloatUnit, enthalpy: FloatUnit): FloatUnit | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getVaporFractionFromTemperatureAndEnthalpy(data, temperature, enthalpy)
}
export function getVaporFractionFromTemperatureAndEntropy(data: RefrigerantData, temperature: FloatUnit, entropy: FloatUnit): FloatUnit | undefined {
	const { entropyLiquid, entropyVapor } = multiOutputTableInterpolate(temperature, data.boilingData, ['entropyLiquid', 'entropyVapor'])
	if (entropyLiquid === undefined || entropyVapor === undefined) return undefined
	return entropy.subtract(entropyLiquid).divide(entropyVapor.subtract(entropyLiquid))
}
export function getVaporFractionFromPressureAndEntropy(data: RefrigerantData, pressure: FloatUnit, entropy: FloatUnit): FloatUnit | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getVaporFractionFromTemperatureAndEntropy(data, temperature, entropy)
}

// From temperature/pressure and enthalpy/entropy, get the phase ('liquid', 'vapor' or 'gas').
export function getPhaseFromTemperatureAndEnthalpy(data: RefrigerantData, temperature: FloatUnit, enthalpy: FloatUnit): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromTemperatureAndEnthalpy(data, temperature, enthalpy))
}
export function getPhaseFromPressureAndEnthalpy(data: RefrigerantData, pressure: FloatUnit, enthalpy: FloatUnit): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromPressureAndEnthalpy(data, pressure, enthalpy))
}
export function getPhaseFromTemperatureAndEntropy(data: RefrigerantData, temperature: FloatUnit, entropy: FloatUnit): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromTemperatureAndEntropy(data, temperature, entropy))
}
export function getPhaseFromPressureAndEntropy(data: RefrigerantData, pressure: FloatUnit, entropy: FloatUnit): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromPressureAndEntropy(data, pressure, entropy))
}

// Support function to turn a vapor fraction into a phase.
function vaporFractionToPhase(vaporFraction: FloatUnit | undefined): RefrigerantPhase | undefined {
	if (vaporFraction === undefined) return undefined
	const x = vaporFraction.setUnit('').number
	return x < 0 ? 'liquid' : x > 1 ? 'gas' : 'vapor'
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
export function getVaporPropertiesFromTemperature(data: RefrigerantData, temperature: FloatUnit, vaporFraction: FloatUnit): RefrigerantProperties | undefined {
	vaporFraction = vaporFraction.setUnit('')
	const vaporFractionNumber = vaporFraction.number
	if (vaporFractionNumber < 0 || vaporFractionNumber > 1) throw new Error(`Invalid vapor fraction: it has to be a number between 0 and 1, and not ${vaporFraction}.`)
	const { pressure, enthalpyLiquid, enthalpyVapor, entropyLiquid, entropyVapor } = multiOutputTableInterpolate(temperature, data.boilingData, ['pressure', 'enthalpyLiquid', 'enthalpyVapor', 'entropyLiquid', 'entropyVapor'])
	if (pressure === undefined || enthalpyLiquid === undefined || enthalpyVapor === undefined || entropyLiquid === undefined || entropyVapor === undefined) return undefined

	const enthalpy = rangeInterpolate(vaporFraction, [enthalpyLiquid, enthalpyVapor], [new FloatUnit(0), new FloatUnit(1)])
	const entropy = rangeInterpolate(vaporFraction, [entropyLiquid, entropyVapor], [new FloatUnit(0), new FloatUnit(1)])
	if (enthalpy === undefined || entropy === undefined) return undefined

	return { temperature, pressure, enthalpy, entropy, phase: 'vapor', vaporFraction }
}

// From pressure and vapor fraction, get all properties.
export function getVaporPropertiesFromPressure(data: RefrigerantData, pressure: FloatUnit, vaporFraction: FloatUnit): RefrigerantProperties | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getVaporPropertiesFromTemperature(data, temperature, vaporFraction)
}

/*
 * Functions determining a range of properties, using the full table.
 */

// Find a substance's properties based on the input values: pressure and temperature.
export function getRefrigerantPropertiesFromTemperature(data: RefrigerantData, pressure: FloatUnit, temperature: FloatUnit): RefrigerantProperties | undefined {
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined

	const enthalpy = getRefrigerantPropertyFromSubTables(subTables, temperature, 'enthalpy')
	const entropy = getRefrigerantPropertyFromSubTables(subTables, temperature, 'entropy')
	if (enthalpy === undefined || entropy === undefined) return undefined

	const phase = getPhaseFromTemperatureAndEnthalpy(data, temperature, enthalpy)
	if (phase === undefined) return undefined
	const properties: RefrigerantProperties = { pressure, temperature, enthalpy, entropy, phase }
	if (phase === 'vapor') properties.vaporFraction = getVaporFractionFromTemperatureAndEnthalpy(data, temperature, enthalpy)
	return properties
}

// Find a substance's properties based on pressure and enthalpy/entropy.
export function getRefrigerantPropertiesFromEnthalpy(data: RefrigerantData, pressure: FloatUnit, enthalpy: FloatUnit): RefrigerantProperties | undefined {
	const vaporFraction = getVaporFractionFromPressureAndEnthalpy(data, pressure, enthalpy)
	if (vaporFraction === undefined) return undefined
	if (vaporFractionToPhase(vaporFraction) === 'vapor') return getVaporPropertiesFromPressure(data, pressure, vaporFraction)

	const temperature = getRefrigerantTemperatureFromParameter(data, pressure, enthalpy, 'enthalpy')
	return temperature && getRefrigerantPropertiesFromTemperature(data, pressure, temperature)
}
export function getRefrigerantPropertiesFromEntropy(data: RefrigerantData, pressure: FloatUnit, entropy: FloatUnit): RefrigerantProperties | undefined {
	const vaporFraction = getVaporFractionFromPressureAndEntropy(data, pressure, entropy)
	if (vaporFraction === undefined) return undefined
	if (vaporFractionToPhase(vaporFraction) === 'vapor') return getVaporPropertiesFromPressure(data, pressure, vaporFraction)
		
	const temperature = getRefrigerantTemperatureFromParameter(data, pressure, entropy, 'entropy')
	return temperature && getRefrigerantPropertiesFromTemperature(data, pressure, temperature)
}

// Given a parameter like enthalpy/entropy, find the corresponding temperature at the given pressure.
function getRefrigerantTemperatureFromParameter(data: RefrigerantData, pressure: FloatUnit, parameter: FloatUnit, parameterLabel: string): FloatUnit | undefined {
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined

	const temperatures = subTables.tables.map(table => inverseTableInterpolate(parameter, table.table, parameterLabel))
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
