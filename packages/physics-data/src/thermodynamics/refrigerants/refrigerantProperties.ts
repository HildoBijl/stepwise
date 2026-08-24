import { interpolateRange, getInterpolationFraction, getBracketingIndices, interpolateTable, interpolateTableOutputs, interpolateTableInput, isInterpolationFraction } from '@step-wise/interpolation'
import { approximatelyEqual } from '@step-wise/js-utils'
import { Quantity } from '@step-wise/physics-core'

import { type RefrigerantPressureTable, type RefrigerantDataset } from './refrigerantTables'

export type RefrigerantPhase = 'liquid' | 'mixture' | 'vapor'
export type RefrigerantProperties = {
	pressure: Quantity
	temperature: Quantity
	enthalpy: Quantity
	entropy: Quantity
	phase: RefrigerantPhase
	vaporFraction?: Quantity
}

type SubTables = { tables: [RefrigerantPressureTable, RefrigerantPressureTable], part: number }
type SinglePhase = Exclude<RefrigerantPhase, 'mixture'>
type RefrigerantPropertyLabel = 'enthalpy' | 'entropy'

/*
 * Small functions determining a single value.
 */

// From temperature, get the corresponding saturation pressure.
export function getSaturationPressure(data: RefrigerantDataset, temperature: Quantity): Quantity | undefined {
	return interpolateTable(temperature, data.saturationTable, 'pressure')
}

// From pressure, get the corresponding saturation temperature.
export function getSaturationTemperature(data: RefrigerantDataset, pressure: Quantity): Quantity | undefined {
	return interpolateTableInput(pressure, data.saturationTable, 'pressure')
}

// From temperature/pressure and enthalpy/entropy, get the vapor fraction.
function getVaporFractionFromTemperatureAndEnthalpy(data: RefrigerantDataset, temperature: Quantity, enthalpy: Quantity): Quantity | undefined {
	const { enthalpyLiquid, enthalpyVapor } = interpolateTableOutputs(temperature, data.saturationTable, ['enthalpyLiquid', 'enthalpyVapor'])
	if (enthalpyLiquid === undefined || enthalpyVapor === undefined) return undefined
	return enthalpy.subtract(enthalpyLiquid).divide(enthalpyVapor.subtract(enthalpyLiquid))
}
function getVaporFractionFromPressureAndEnthalpy(data: RefrigerantDataset, pressure: Quantity, enthalpy: Quantity): Quantity | undefined {
	const temperature = getSaturationTemperature(data, pressure)
	return temperature && getVaporFractionFromTemperatureAndEnthalpy(data, temperature, enthalpy)
}
function getVaporFractionFromTemperatureAndEntropy(data: RefrigerantDataset, temperature: Quantity, entropy: Quantity): Quantity | undefined {
	const { entropyLiquid, entropyVapor } = interpolateTableOutputs(temperature, data.saturationTable, ['entropyLiquid', 'entropyVapor'])
	if (entropyLiquid === undefined || entropyVapor === undefined) return undefined
	return entropy.subtract(entropyLiquid).divide(entropyVapor.subtract(entropyLiquid))
}
function getVaporFractionFromPressureAndEntropy(data: RefrigerantDataset, pressure: Quantity, entropy: Quantity): Quantity | undefined {
	const temperature = getSaturationTemperature(data, pressure)
	return temperature && getVaporFractionFromTemperatureAndEntropy(data, temperature, entropy)
}

// Support function to turn a vapor fraction into a phase.
function vaporFractionToPhase(vaporFraction: Quantity | undefined): RefrigerantPhase | undefined {
	if (vaporFraction === undefined) return undefined
	const x = vaporFraction.setUnit('').number
	return x < 0 || approximatelyEqual(x, 0) ? 'liquid' : x > 1 || approximatelyEqual(x, 1) ? 'vapor' : 'mixture'
}

function isPhysicalVaporFraction(vaporFraction: Quantity): boolean {
	const x = vaporFraction.setUnit('').number
	return (x >= 0 || approximatelyEqual(x, 0)) && (x <= 1 || approximatelyEqual(x, 1))
}

/*
 * Functions determining a range of properties, using only the saturation data.
 */

// From temperature and known line, get all properties.
function getSaturationLinePropertiesFromTemperature(data: RefrigerantDataset, temperature: Quantity, liquidLine = true): RefrigerantProperties | undefined {
	const addendum = liquidLine ? 'Liquid' : 'Vapor'
	const enthalpyLabel = `enthalpy${addendum}`
	const entropyLabel = `entropy${addendum}`

	const pointData = interpolateTableOutputs(temperature, data.saturationTable, ['pressure', enthalpyLabel, entropyLabel])
	const { pressure } = pointData
	const enthalpy = pointData[enthalpyLabel]
	const entropy = pointData[entropyLabel]

	if (pressure === undefined || enthalpy === undefined || entropy === undefined) return undefined
	return { pressure, temperature, enthalpy, entropy, phase: liquidLine ? 'liquid' : 'vapor' }
}

// From pressure and known line, get all properties.
function getSaturationLinePropertiesFromPressure(data: RefrigerantDataset, pressure: Quantity, liquidLine = true): RefrigerantProperties | undefined {
	const temperature = getSaturationTemperature(data, pressure)
	return temperature && getSaturationLinePropertiesFromTemperature(data, temperature, liquidLine)
}

export function getSaturatedLiquidPropertiesFromTemperature(data: RefrigerantDataset, temperature: Quantity): RefrigerantProperties | undefined {
	return getSaturationLinePropertiesFromTemperature(data, temperature, true)
}

export function getSaturatedLiquidPropertiesFromPressure(data: RefrigerantDataset, pressure: Quantity): RefrigerantProperties | undefined {
	return getSaturationLinePropertiesFromPressure(data, pressure, true)
}

export function getSaturatedVaporPropertiesFromTemperature(data: RefrigerantDataset, temperature: Quantity): RefrigerantProperties | undefined {
	return getSaturationLinePropertiesFromTemperature(data, temperature, false)
}

export function getSaturatedVaporPropertiesFromPressure(data: RefrigerantDataset, pressure: Quantity): RefrigerantProperties | undefined {
	return getSaturationLinePropertiesFromPressure(data, pressure, false)
}

// From temperature and vapor fraction, get all properties.
export function getSaturatedMixturePropertiesFromTemperature(data: RefrigerantDataset, temperature: Quantity, vaporFraction: Quantity): RefrigerantProperties | undefined {
	vaporFraction = vaporFraction.setUnit('')
	let vaporFractionNumber = vaporFraction.number
	if (approximatelyEqual(vaporFractionNumber, 0)) vaporFraction = new Quantity(0)
	else if (approximatelyEqual(vaporFractionNumber, 1)) vaporFraction = new Quantity(1)
	vaporFractionNumber = vaporFraction.number
	if (vaporFractionNumber < 0 || vaporFractionNumber > 1) throw new Error(`Invalid vapor fraction: it has to be a number between 0 and 1, and not ${vaporFraction}.`)
	const { pressure, enthalpyLiquid, enthalpyVapor, entropyLiquid, entropyVapor } = interpolateTableOutputs(temperature, data.saturationTable, ['pressure', 'enthalpyLiquid', 'enthalpyVapor', 'entropyLiquid', 'entropyVapor'])
	if (pressure === undefined || enthalpyLiquid === undefined || enthalpyVapor === undefined || entropyLiquid === undefined || entropyVapor === undefined) return undefined

	const enthalpy = interpolateRange(vaporFraction, [enthalpyLiquid, enthalpyVapor], [new Quantity(0), new Quantity(1)])
	const entropy = interpolateRange(vaporFraction, [entropyLiquid, entropyVapor], [new Quantity(0), new Quantity(1)])
	if (enthalpy === undefined || entropy === undefined) return undefined

	return { temperature, pressure, enthalpy, entropy, phase: vaporFractionToPhase(vaporFraction) as RefrigerantPhase, vaporFraction }
}

// From pressure and vapor fraction, get all properties.
export function getSaturatedMixturePropertiesFromPressure(data: RefrigerantDataset, pressure: Quantity, vaporFraction: Quantity): RefrigerantProperties | undefined {
	const temperature = getSaturationTemperature(data, pressure)
	return temperature && getSaturatedMixturePropertiesFromTemperature(data, temperature, vaporFraction)
}

/*
 * Functions determining a range of properties, using the full table.
 */

// Find a substance's properties based on the input values: pressure and temperature.
export function getRefrigerantPropertiesFromPressureAndTemperature(data: RefrigerantDataset, pressure: Quantity, temperature: Quantity): RefrigerantProperties | undefined {
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined
	const saturationTemperature = getSaturationTemperature(data, pressure)
	if (saturationTemperature === undefined) return undefined
	const temperatureComparison = temperature.compare(saturationTemperature)
	if (temperatureComparison === 0) return undefined
	const phase: SinglePhase = temperatureComparison < 0 ? 'liquid' : 'vapor'

	const enthalpy = getRefrigerantPropertyFromSubTables(data, subTables, temperature, saturationTemperature, 'enthalpy')
	const entropy = getRefrigerantPropertyFromSubTables(data, subTables, temperature, saturationTemperature, 'entropy')
	if (enthalpy === undefined || entropy === undefined) return undefined

	return { pressure, temperature, enthalpy, entropy, phase }
}

// Find a substance's properties based on pressure and enthalpy/entropy.
export function getRefrigerantPropertiesFromPressureAndEnthalpy(data: RefrigerantDataset, pressure: Quantity, enthalpy: Quantity): RefrigerantProperties | undefined {
	const vaporFraction = getVaporFractionFromPressureAndEnthalpy(data, pressure, enthalpy)
	if (vaporFraction === undefined) return undefined
	if (isPhysicalVaporFraction(vaporFraction)) return getSaturatedMixturePropertiesFromPressure(data, pressure, vaporFraction)

	const temperature = getRefrigerantTemperatureFromParameter(data, pressure, enthalpy, 'enthalpy', vaporFractionToPhase(vaporFraction) as SinglePhase)
	return temperature && getRefrigerantPropertiesFromPressureAndTemperature(data, pressure, temperature)
}
export function getRefrigerantPropertiesFromPressureAndEntropy(data: RefrigerantDataset, pressure: Quantity, entropy: Quantity): RefrigerantProperties | undefined {
	const vaporFraction = getVaporFractionFromPressureAndEntropy(data, pressure, entropy)
	if (vaporFraction === undefined) return undefined
	if (isPhysicalVaporFraction(vaporFraction)) return getSaturatedMixturePropertiesFromPressure(data, pressure, vaporFraction)

	const temperature = getRefrigerantTemperatureFromParameter(data, pressure, entropy, 'entropy', vaporFractionToPhase(vaporFraction) as SinglePhase)
	return temperature && getRefrigerantPropertiesFromPressureAndTemperature(data, pressure, temperature)
}

// Given a parameter like enthalpy/entropy, find the corresponding temperature at the given pressure.
function getRefrigerantTemperatureFromParameter(data: RefrigerantDataset, pressure: Quantity, parameter: Quantity, parameterLabel: RefrigerantPropertyLabel, phase: SinglePhase): Quantity | undefined {
	const subTables = getRefrigerantSubTables(data, pressure)
	if (subTables === undefined) return undefined
	const saturationTemperature = getSaturationTemperature(data, pressure)
	if (saturationTemperature === undefined) return undefined
	const offsetBounds = getTemperatureOffsetBounds(data, subTables, phase)
	if (offsetBounds === undefined) return undefined

	// Find the range in which the given point falls.
	const saturationParameter = getSaturationProperty(data, pressure, parameterLabel, phase)
	const outerTemperature = saturationTemperature.add(new Quantity({ value: phase === 'liquid' ? offsetBounds[0] : offsetBounds[1], unit: saturationTemperature.unit }))
	const outerParameter = getRefrigerantPropertyFromSubTables(data, subTables, outerTemperature, saturationTemperature, parameterLabel)
	if (saturationParameter === undefined || outerParameter === undefined) return undefined
	const [minimumParameter, maximumParameter] = phase === 'liquid' ? [outerParameter, saturationParameter] : [saturationParameter, outerParameter]
	if (parameter.compare(minimumParameter) < 0 || parameter.compare(maximumParameter) > 0) return undefined

	// Use binary search to find the exact inverse point.
	let [minimumOffset, maximumOffset] = offsetBounds
	for (let iteration = 0; iteration < 24; iteration++) {
		const middleOffset = (minimumOffset + maximumOffset) / 2
		const middleTemperature = saturationTemperature.add(new Quantity({ value: middleOffset, unit: saturationTemperature.unit }))
		const middleParameter = getRefrigerantPropertyFromSubTables(data, subTables, middleTemperature, saturationTemperature, parameterLabel)
		if (middleParameter === undefined) return undefined
		if (middleParameter.compare(parameter) < 0) minimumOffset = middleOffset
		else maximumOffset = middleOffset
	}
	return saturationTemperature.add(new Quantity({ value: (minimumOffset + maximumOffset) / 2, unit: saturationTemperature.unit }))
}

function getSaturationProperty(data: RefrigerantDataset, pressure: Quantity, propertyLabel: RefrigerantPropertyLabel, phase: SinglePhase): Quantity | undefined {
	const saturationTemperature = getSaturationTemperature(data, pressure)
	if (saturationTemperature === undefined) return undefined
	return interpolateTable(saturationTemperature, data.saturationTable, `${propertyLabel}${phase === 'liquid' ? 'Liquid' : 'Vapor'}`)
}

function getTemperatureOffsetBounds(data: RefrigerantDataset, subTables: SubTables, phase: SinglePhase): [number, number] | undefined {
	const tables = subTables.part === 0 ? [subTables.tables[0]] : subTables.part === 1 ? [subTables.tables[1]] : subTables.tables
	const outerOffsets = tables.map(table => {
		const saturationTemperature = getSaturationTemperature(data, table.pressure)
		if (saturationTemperature === undefined) return undefined
		const temperatureAxis = table.table.inputAxes[0]
		const outerTemperature = phase === 'liquid' ? temperatureAxis[0] : temperatureAxis[temperatureAxis.length - 1]
		return outerTemperature.subtract(saturationTemperature).number
	})
	if (outerOffsets.some(offset => offset === undefined)) return undefined
	const definedOuterOffsets = outerOffsets as number[]
	return phase === 'liquid' ? [Math.max(...definedOuterOffsets), 0] : [0, Math.min(...definedOuterOffsets)]
}

function getRefrigerantSubTables(data: RefrigerantDataset, pressure: Quantity): SubTables | undefined {
	const tables = data.tablesByPressure
	const [min, max] = getBracketingIndices(pressure, index => tables[index].pressure, tables.length)
	const closestTables = [tables[min], tables[max]] as [RefrigerantPressureTable, RefrigerantPressureTable]
	const pressureFraction = getInterpolationFraction(pressure, [closestTables[0].pressure, closestTables[1].pressure])
	return isInterpolationFraction(pressureFraction) ? { tables: closestTables, part: pressureFraction } : undefined
}

function getRefrigerantPropertyFromSubTables(data: RefrigerantDataset, subTables: SubTables, temperature: Quantity, saturationTemperature: Quantity, outputLabel: RefrigerantPropertyLabel): Quantity | undefined {
	const temperatureOffset = temperature.subtract(saturationTemperature)
	const getValue = (table: RefrigerantPressureTable): Quantity | undefined => {
		const tableSaturationTemperature = getSaturationTemperature(data, table.pressure)
		return tableSaturationTemperature && interpolateTable(tableSaturationTemperature.add(temperatureOffset), table.table, outputLabel)
	}
	if (subTables.part === 0) return getValue(subTables.tables[0])
	if (subTables.part === 1) return getValue(subTables.tables[1])

	const values = subTables.tables.map(getValue)
	if (values[0] === undefined || values[1] === undefined) return undefined
	return interpolateRange(subTables.part, [values[0], values[1]], [0, 1])
}
