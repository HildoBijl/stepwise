import { interpolateRange, getInterpolationFraction, getBracketingIndices, interpolateTable, interpolateTableOutputs, interpolateTableInput, isInterpolationFraction } from '@step-wise/interpolation'
import { approximatelyEqual } from '@step-wise/js-utils'
import { Quantity } from '@step-wise/physics-core'

import { type RefrigerantPressureTable, type RefrigerantData } from './types'

export type RefrigerantPhase = 'liquid' | 'vapor' | 'gas'
export type RefrigerantProperties = {
	pressure: Quantity
	temperature: Quantity
	enthalpy: Quantity
	entropy: Quantity
	phase: RefrigerantPhase
	vaporFraction?: Quantity
}

type SubTables = { tables: [RefrigerantPressureTable, RefrigerantPressureTable], part: number }
type SinglePhase = Exclude<RefrigerantPhase, 'vapor'>
type RefrigerantPropertyLabel = 'enthalpy' | 'entropy'

/*
 * Small functions determining a single value.
 */

// From temperature, get the corresponding boiling pressure.
export function getBoilingPressure(data: RefrigerantData, temperature: Quantity): Quantity | undefined {
	return interpolateTable(temperature, data.boilingData, 'pressure')
}

// From pressure, get the corresponding boiling temperature.
export function getBoilingTemperature(data: RefrigerantData, pressure: Quantity): Quantity | undefined {
	return interpolateTableInput(pressure, data.boilingData, 'pressure')
}

// From temperature/pressure and enthalpy/entropy, get the vapor fraction.
export function getVaporFractionFromTemperatureAndEnthalpy(data: RefrigerantData, temperature: Quantity, enthalpy: Quantity): Quantity | undefined {
	const { enthalpyLiquid, enthalpyVapor } = interpolateTableOutputs(temperature, data.boilingData, ['enthalpyLiquid', 'enthalpyVapor'])
	if (enthalpyLiquid === undefined || enthalpyVapor === undefined) return undefined
	return enthalpy.subtract(enthalpyLiquid).divide(enthalpyVapor.subtract(enthalpyLiquid))
}
export function getVaporFractionFromPressureAndEnthalpy(data: RefrigerantData, pressure: Quantity, enthalpy: Quantity): Quantity | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getVaporFractionFromTemperatureAndEnthalpy(data, temperature, enthalpy)
}
export function getVaporFractionFromTemperatureAndEntropy(data: RefrigerantData, temperature: Quantity, entropy: Quantity): Quantity | undefined {
	const { entropyLiquid, entropyVapor } = interpolateTableOutputs(temperature, data.boilingData, ['entropyLiquid', 'entropyVapor'])
	if (entropyLiquid === undefined || entropyVapor === undefined) return undefined
	return entropy.subtract(entropyLiquid).divide(entropyVapor.subtract(entropyLiquid))
}
export function getVaporFractionFromPressureAndEntropy(data: RefrigerantData, pressure: Quantity, entropy: Quantity): Quantity | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getVaporFractionFromTemperatureAndEntropy(data, temperature, entropy)
}

// From temperature/pressure and enthalpy/entropy, get the phase ('liquid', 'vapor' or 'gas').
export function getPhaseFromTemperatureAndEnthalpy(data: RefrigerantData, temperature: Quantity, enthalpy: Quantity): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromTemperatureAndEnthalpy(data, temperature, enthalpy))
}
export function getPhaseFromPressureAndEnthalpy(data: RefrigerantData, pressure: Quantity, enthalpy: Quantity): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromPressureAndEnthalpy(data, pressure, enthalpy))
}
export function getPhaseFromTemperatureAndEntropy(data: RefrigerantData, temperature: Quantity, entropy: Quantity): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromTemperatureAndEntropy(data, temperature, entropy))
}
export function getPhaseFromPressureAndEntropy(data: RefrigerantData, pressure: Quantity, entropy: Quantity): RefrigerantPhase | undefined {
	return vaporFractionToPhase(getVaporFractionFromPressureAndEntropy(data, pressure, entropy))
}

// Support function to turn a vapor fraction into a phase.
function vaporFractionToPhase(vaporFraction: Quantity | undefined): RefrigerantPhase | undefined {
	if (vaporFraction === undefined) return undefined
	const x = vaporFraction.setUnit('').number
	return x < 0 || approximatelyEqual(x, 0) ? 'liquid' : x > 1 || approximatelyEqual(x, 1) ? 'gas' : 'vapor'
}

function isPhysicalVaporFraction(vaporFraction: Quantity): boolean {
	const x = vaporFraction.setUnit('').number
	return (x >= 0 || approximatelyEqual(x, 0)) && (x <= 1 || approximatelyEqual(x, 1))
}

/*
 * Functions determining a range of properties, using only the boiling data.
 */

// From temperature and known line, get all properties.
export function getLinePropertiesFromTemperature(data: RefrigerantData, temperature: Quantity, liquidLine = true): RefrigerantProperties | undefined {
	const addendum = liquidLine ? 'Liquid' : 'Vapor'
	const enthalpyLabel = `enthalpy${addendum}`
	const entropyLabel = `entropy${addendum}`

	const pointData = interpolateTableOutputs(temperature, data.boilingData, ['pressure', enthalpyLabel, entropyLabel])
	const { pressure } = pointData
	const enthalpy = pointData[enthalpyLabel]
	const entropy = pointData[entropyLabel]

	if (pressure === undefined || enthalpy === undefined || entropy === undefined) return undefined
	return { pressure, temperature, enthalpy, entropy, phase: liquidLine ? 'liquid' : 'gas' }
}

// From pressure and known line, get all properties.
export function getLinePropertiesFromPressure(data: RefrigerantData, pressure: Quantity, liquidLine = true): RefrigerantProperties | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getLinePropertiesFromTemperature(data, temperature, liquidLine)
}

export function getLiquidLinePropertiesFromTemperature(data: RefrigerantData, temperature: Quantity): RefrigerantProperties | undefined {
	return getLinePropertiesFromTemperature(data, temperature, true)
}

export function getLiquidLinePropertiesFromPressure(data: RefrigerantData, pressure: Quantity): RefrigerantProperties | undefined {
	return getLinePropertiesFromPressure(data, pressure, true)
}

export function getVaporLinePropertiesFromTemperature(data: RefrigerantData, temperature: Quantity): RefrigerantProperties | undefined {
	return getLinePropertiesFromTemperature(data, temperature, false)
}

export function getVaporLinePropertiesFromPressure(data: RefrigerantData, pressure: Quantity): RefrigerantProperties | undefined {
	return getLinePropertiesFromPressure(data, pressure, false)
}

// From temperature and vapor fraction, get all properties.
export function getVaporPropertiesFromTemperature(data: RefrigerantData, temperature: Quantity, vaporFraction: Quantity): RefrigerantProperties | undefined {
	vaporFraction = vaporFraction.setUnit('')
	let vaporFractionNumber = vaporFraction.number
	if (approximatelyEqual(vaporFractionNumber, 0)) vaporFraction = new Quantity(0)
	else if (approximatelyEqual(vaporFractionNumber, 1)) vaporFraction = new Quantity(1)
	vaporFractionNumber = vaporFraction.number
	if (vaporFractionNumber < 0 || vaporFractionNumber > 1) throw new Error(`Invalid vapor fraction: it has to be a number between 0 and 1, and not ${vaporFraction}.`)
	const { pressure, enthalpyLiquid, enthalpyVapor, entropyLiquid, entropyVapor } = interpolateTableOutputs(temperature, data.boilingData, ['pressure', 'enthalpyLiquid', 'enthalpyVapor', 'entropyLiquid', 'entropyVapor'])
	if (pressure === undefined || enthalpyLiquid === undefined || enthalpyVapor === undefined || entropyLiquid === undefined || entropyVapor === undefined) return undefined

	const enthalpy = interpolateRange(vaporFraction, [enthalpyLiquid, enthalpyVapor], [new Quantity(0), new Quantity(1)])
	const entropy = interpolateRange(vaporFraction, [entropyLiquid, entropyVapor], [new Quantity(0), new Quantity(1)])
	if (enthalpy === undefined || entropy === undefined) return undefined

	return { temperature, pressure, enthalpy, entropy, phase: vaporFractionToPhase(vaporFraction) as RefrigerantPhase, vaporFraction }
}

// From pressure and vapor fraction, get all properties.
export function getVaporPropertiesFromPressure(data: RefrigerantData, pressure: Quantity, vaporFraction: Quantity): RefrigerantProperties | undefined {
	const temperature = getBoilingTemperature(data, pressure)
	return temperature && getVaporPropertiesFromTemperature(data, temperature, vaporFraction)
}

/*
 * Functions determining a range of properties, using the full table.
 */

// Find a substance's properties based on the input values: pressure and temperature.
export function getRefrigerantPropertiesFromTemperature(data: RefrigerantData, pressure: Quantity, temperature: Quantity): RefrigerantProperties | undefined {
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined
	const boilingTemperature = getBoilingTemperature(data, pressure)
	if (boilingTemperature === undefined) return undefined
	const temperatureComparison = temperature.compare(boilingTemperature)
	if (temperatureComparison === 0) return undefined
	const phase: SinglePhase = temperatureComparison < 0 ? 'liquid' : 'gas'

	const enthalpy = getRefrigerantPropertyFromSubTables(data, subTables, temperature, boilingTemperature, 'enthalpy')
	const entropy = getRefrigerantPropertyFromSubTables(data, subTables, temperature, boilingTemperature, 'entropy')
	if (enthalpy === undefined || entropy === undefined) return undefined

	return { pressure, temperature, enthalpy, entropy, phase }
}

// Find a substance's properties based on pressure and enthalpy/entropy.
export function getRefrigerantPropertiesFromEnthalpy(data: RefrigerantData, pressure: Quantity, enthalpy: Quantity): RefrigerantProperties | undefined {
	const vaporFraction = getVaporFractionFromPressureAndEnthalpy(data, pressure, enthalpy)
	if (vaporFraction === undefined) return undefined
	if (isPhysicalVaporFraction(vaporFraction)) return getVaporPropertiesFromPressure(data, pressure, vaporFraction)

	const temperature = getRefrigerantTemperatureFromParameter(data, pressure, enthalpy, 'enthalpy', vaporFractionToPhase(vaporFraction) as SinglePhase)
	return temperature && getRefrigerantPropertiesFromTemperature(data, pressure, temperature)
}
export function getRefrigerantPropertiesFromEntropy(data: RefrigerantData, pressure: Quantity, entropy: Quantity): RefrigerantProperties | undefined {
	const vaporFraction = getVaporFractionFromPressureAndEntropy(data, pressure, entropy)
	if (vaporFraction === undefined) return undefined
	if (isPhysicalVaporFraction(vaporFraction)) return getVaporPropertiesFromPressure(data, pressure, vaporFraction)

	const temperature = getRefrigerantTemperatureFromParameter(data, pressure, entropy, 'entropy', vaporFractionToPhase(vaporFraction) as SinglePhase)
	return temperature && getRefrigerantPropertiesFromTemperature(data, pressure, temperature)
}

// Given a parameter like enthalpy/entropy, find the corresponding temperature at the given pressure.
function getRefrigerantTemperatureFromParameter(data: RefrigerantData, pressure: Quantity, parameter: Quantity, parameterLabel: RefrigerantPropertyLabel, phase: SinglePhase): Quantity | undefined {
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined
	const boilingTemperature = getBoilingTemperature(data, pressure)
	if (boilingTemperature === undefined) return undefined
	const offsetBounds = getTemperatureOffsetBounds(data, subTables, phase)
	if (offsetBounds === undefined) return undefined

	// Find the range in which the given point falls.
	const saturationParameter = getSaturationProperty(data, pressure, parameterLabel, phase)
	const outerTemperature = boilingTemperature.add(new Quantity({ value: phase === 'liquid' ? offsetBounds[0] : offsetBounds[1], unit: boilingTemperature.unit }))
	const outerParameter = getRefrigerantPropertyFromSubTables(data, subTables, outerTemperature, boilingTemperature, parameterLabel)
	if (saturationParameter === undefined || outerParameter === undefined) return undefined
	const [minimumParameter, maximumParameter] = phase === 'liquid' ? [outerParameter, saturationParameter] : [saturationParameter, outerParameter]
	if (parameter.compare(minimumParameter) < 0 || parameter.compare(maximumParameter) > 0) return undefined

	// Use binary search to find the exact inverse point.
	let [minimumOffset, maximumOffset] = offsetBounds
	for (let iteration = 0; iteration < 24; iteration++) {
		const middleOffset = (minimumOffset + maximumOffset) / 2
		const middleTemperature = boilingTemperature.add(new Quantity({ value: middleOffset, unit: boilingTemperature.unit }))
		const middleParameter = getRefrigerantPropertyFromSubTables(data, subTables, middleTemperature, boilingTemperature, parameterLabel)
		if (middleParameter === undefined) return undefined
		if (middleParameter.compare(parameter) < 0) minimumOffset = middleOffset
		else maximumOffset = middleOffset
	}
	return boilingTemperature.add(new Quantity({ value: (minimumOffset + maximumOffset) / 2, unit: boilingTemperature.unit }))
}

function getSaturationProperty(data: RefrigerantData, pressure: Quantity, propertyLabel: RefrigerantPropertyLabel, phase: SinglePhase): Quantity | undefined {
	const boilingTemperature = getBoilingTemperature(data, pressure)
	if (boilingTemperature === undefined) return undefined
	return interpolateTable(boilingTemperature, data.boilingData, `${propertyLabel}${phase === 'liquid' ? 'Liquid' : 'Vapor'}`)
}

function getTemperatureOffsetBounds(data: RefrigerantData, subTables: SubTables, phase: SinglePhase): [number, number] | undefined {
	const tables = subTables.part === 0 ? [subTables.tables[0]] : subTables.part === 1 ? [subTables.tables[1]] : subTables.tables
	const outerOffsets = tables.map(table => {
		const boilingTemperature = getBoilingTemperature(data, table.pressure)
		if (boilingTemperature === undefined) return undefined
		const temperatureAxis = table.table.inputAxes[0]
		const outerTemperature = phase === 'liquid' ? temperatureAxis[0] : temperatureAxis[temperatureAxis.length - 1]
		return outerTemperature.subtract(boilingTemperature).number
	})
	if (outerOffsets.some(offset => offset === undefined)) return undefined
	const definedOuterOffsets = outerOffsets as number[]
	return phase === 'liquid' ? [Math.max(...definedOuterOffsets), 0] : [0, Math.min(...definedOuterOffsets)]
}

function getRefrigerantSubTables(data: RefrigerantData, pressure: Quantity): SubTables | undefined {
	const tables = data.tablesByPressure
	const [min, max] = getBracketingIndices(pressure, index => tables[index].pressure, tables.length)
	const closestTables = [tables[min], tables[max]] as [RefrigerantPressureTable, RefrigerantPressureTable]
	const pressureFraction = getInterpolationFraction(pressure, [closestTables[0].pressure, closestTables[1].pressure])
	return isInterpolationFraction(pressureFraction) ? { tables: closestTables, part: pressureFraction } : undefined
}

function getRefrigerantPropertyFromSubTables(data: RefrigerantData, subTables: SubTables, temperature: Quantity, boilingTemperature: Quantity, outputLabel: RefrigerantPropertyLabel): Quantity | undefined {
	const temperatureOffset = temperature.subtract(boilingTemperature)
	const getValue = (table: RefrigerantPressureTable): Quantity | undefined => {
		const tableBoilingTemperature = getBoilingTemperature(data, table.pressure)
		return tableBoilingTemperature && interpolateTable(tableBoilingTemperature.add(temperatureOffset), table.table, outputLabel)
	}
	if (subTables.part === 0) return getValue(subTables.tables[0])
	if (subTables.part === 1) return getValue(subTables.tables[1])

	const values = subTables.tables.map(getValue)
	if (values[0] === undefined || values[1] === undefined) return undefined
	return interpolateRange(subTables.part, [values[0], values[1]], [0, 1])
}
