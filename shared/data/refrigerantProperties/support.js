const { firstOf, lastOf, isObject, ensureNumberLike, interpolate, getInterpolationPart, getClosestIndices, columnTableInterpolate } = require('../../util')
const { Unit, unitsSimilar, FloatUnit } = require('../../inputTypes')

const pressureUnit = new Unit('bar')
const temperatureUnit = new Unit('dC')
const enthalpyUnit = new Unit('kJ/kg')
const entropyUnit = new Unit('kJ/kg * K')

// getUnitLabel takes a unit and retrieves whether it's a pressure, temperature, enthalpy or entropy.
function getUnitLabel(unit) {
	if (!(unit instanceof Unit))
		throw new Error(`Invalid unit: expected to receive an object of type unit, but received "${JSON.stringify(unit)}".`)
	if (unitsSimilar(unit, pressureUnit))
		return 'pressure'
	if (unitsSimilar(unit, temperatureUnit))
		return 'temperature'
	if (unitsSimilar(unit, enthalpyUnit))
		return 'enthalpy'
	if (unitsSimilar(unit, entropyUnit))
		return 'entropy'
	throw new Error(`Invalid unit: the unit "${unit.str}" was not among the acceptable types.`)
}

// getBoilingTemperature takes a pressure and returns the corresponding boiling temperature.
function getBoilingTemperature(pressure, data) {
	if (!isObject(data) || !data.boilingData)
		throw new Error(`Invalid refrigerant data: the given data was not data exported from a refrigerant properties file.`)
	if (!(pressure instanceof FloatUnit) || !unitsSimilar(pressure.unit, pressureUnit))
		throw new Error(`Invalid pressure given: could not turn the given parameter into a pressure. The value given was "${pressure}".`)
	return columnTableInterpolate(pressure, 'pressure', data.boilingData, 'temperature')
}
module.exports.getBoilingTemperature = getBoilingTemperature

// getBoilingPressure takes a temperature and returns the corresponding boiling pressure.
function getBoilingPressure(temperature, data) {
	if (!isObject(data) || !data.boilingData)
		throw new Error(`Invalid refrigerant data: the given data was not data exported from a refrigerant properties file.`)
	if (!(temperature instanceof FloatUnit) || !unitsSimilar(temperature.unit, temperatureUnit))
		throw new Error(`Invalid temperature given: could not turn the given parameter into a temperature. The value given was "${temperature}".`)
	return columnTableInterpolate(temperature, 'temperature', data.boilingData, 'pressure')
}
module.exports.getBoilingPressure = getBoilingPressure

// isBoiling takes a pressure and enthalpy and checks if the resulting point is in the boiling region.
function isBoiling(pressure, enthalpy, data) {
	return getPhase(pressure, enthalpy, data) === 'vapor'
}
module.exports.isBoiling = isBoiling

// getPhase returns the phase of a refrigerant with given pressure and enthalpy. The outcome is a string being either 'liquid', 'vapor' or 'gas'.
function getPhase(pressure, enthalpy, data) {
	const { enthalpyLiquid, enthalpyVapor } = columnTableInterpolate(pressure, 'pressure', data.boilingData, ['enthalpyLiquid', 'enthalpyVapor'])
	if (enthalpy.compare(enthalpyLiquid) <= 0)
		return 'liquid'
	if (enthalpy.compare(enthalpyVapor) >= 0)
		return 'gas'
	return 'vapor'
}
module.exports.getPhase = getPhase

// getLiquidLineProperties gives the properties of a refrigerant at the liquid line, given any property.
function getLiquidLineProperties(parameter, data) {
	return getLineProperties(parameter, data, true)
}
module.exports.getLiquidLineProperties = getLiquidLineProperties

// getVaporLineProperties gives the properties of a refrigerant at the vapor line, given any property.
function getVaporLineProperties(parameter, data) {
	return getLineProperties(parameter, data, false)
}
module.exports.getVaporLineProperties = getVaporLineProperties

// getLineProperties takes a parameter (temperature, pressure, enthalpy, entropy) and finds the properties of the refrigerant on a given line. Use true for the liquid line (left) and false for the vapor line (right).
function getLineProperties(parameter, data, liquidLine = true) {
	// Check the input.
	if (!(parameter instanceof FloatUnit))
		throw new Error(`Invalid parameter: a FloatUnit parameter was expected, but received "${parameter}".`)

	// Deal with easy cases first.
	const label = getUnitLabel(parameter.unit)
	if (label === 'pressure' || label === 'temperature')
		return { ...getVaporProperties(parameter, liquidLine ? 0 : 1, data), phase: liquidLine ? 'liquid' : 'gas' }

	// We must interpolate.
	const addendum = liquidLine ? 'Liquid' : 'Vapor'
	const columnToSearch = `${label}${addendum}`
	const pointData = columnTableInterpolate(parameter, columnToSearch, data.boilingData, ['pressure', 'temperature', `enthalpy${addendum}`, `entropy${addendum}`])
	return {
		pressure: pointData.pressure,
		temperature: pointData.temperature,
		enthalpy: pointData[`enthalpy${addendum}`],
		entropy: pointData[`entropy${addendum}`],
		phase: liquidLine ? 'liquid' : 'gas',
	}
}
module.exports.getLineProperties = getLineProperties

// getVaporProperties takes either a temperature or pressure (which one it is will be automatically determined) and a vapor fraction, and returns the corresponding temperature, pressure, enthalpy and entropy.
function getVaporProperties(parameter, vaporFraction, data) {
	// Check input.
	ensureNumberLike(vaporFraction)
	if (!isObject(data) || !data.boilingData)
		throw new Error(`Invalid refrigerant data: the given data was not data exported from a refrigerant properties file.`)

	// Check the first parameter: is it a temperature or a pressure? Either way, use it to determine the pressure.
	let pressure, temperature
	if (!(parameter instanceof FloatUnit))
		throw new Error(`Invalid value: did not understand the value given for the temperature/pressure. Expected a FloatUnit object, but received "${JSON.stringify(temperature)}".`)
	if (unitsSimilar(parameter.unit, pressureUnit)) {
		pressure = parameter
		temperature = getBoilingTemperature(pressure, data)
	} else if (unitsSimilar(parameter.unit, temperatureUnit)) {
		temperature = parameter
		pressure = getBoilingPressure(temperature, data)
	} else {
		throw new Error(`Invalid value: did not understand the value given for the temperature/pressure. Its unit "${parameter.unit.str}" did not match that of a temperature or pressure.`)
	}

	// Use the pressure to find the relevant properties.
	const result = { phase: 'vapor', temperature, pressure, vaporFraction }
	const parameters = ['enthalpy', 'entropy']
	parameters.forEach(parameter => {
		const names = [`${parameter}Liquid`, `${parameter}Vapor`]
		const parameterData = columnTableInterpolate(pressure, 'pressure', data.boilingData, names)
		result[parameter] = interpolate(vaporFraction, names.map(name => parameterData[name]))
	})
	return result
}
module.exports.getVaporProperties = getVaporProperties

// getProperties takes the pressure and another parameter and uses it to extract the remaining properties. The first parameter must be the pressure. The second can be temperature, enthalpy or entropy. Which one it is gets determined by the unit. Finally the data for the respective refrigerant must be added.
function getProperties(pressure, parameter, data) {
	// Check the input.
	if (!(pressure instanceof FloatUnit))
		throw new Error(`Invalid pressure: the pressure given to the getProperties function was not a pressure variable. Its value was "${JSON.stringify(pressure)}".`)
	if (!unitsSimilar(pressure.unit, pressureUnit))
		throw new Error(`Invalid pressure: the pressure given to the getProperties function was not a pressure. Its unit was "${pressure.unit.str}".`)
	if (!(parameter instanceof FloatUnit))
		throw new Error(`Invalid parameter: the second parameter given to the getProperties function was not a FloatUnit. Its value was "${JSON.stringify(parameter)}".`)
	if (!isObject(data) || !data.boilingData || !data.dataByPressure)
		throw new Error(`Invalid refrigerant data: the given data was not data exported from a refrigerant properties file.`)
	if (pressure.compare(firstOf(data.dataByPressure).pressure) < 0 || pressure.compare(lastOf(data.dataByPressure).pressure) > 0)
		throw new Error(`Pressure out of range: the given pressure "${pressure.str}" was not inside the pressure range of the given data set.`)

	// Determine what type of other parameter was given.
	const label = getUnitLabel(parameter.unit)
	if (label === 'pressure')
		throw new Error(`Invalid parameter: a pressure is not allowed as second parameter.`)

	// Check if we are in the boiling region. If so, directly use the getVaporProperties function.
	const boilingProperties = columnTableInterpolate(pressure, 'pressure', data.boilingData, ['pressure', 'temperature', 'enthalpyLiquid', 'enthalpyVapor', 'entropyLiquid', 'entropyVapor'])
	if (label !== 'temperature') {
		if (parameter.compare(boilingProperties[`${label}Liquid`]) >= 0 && parameter.compare(boilingProperties[`${label}Vapor`]) <= 0) {
			const vaporFraction = parameter.subtract(boilingProperties[`${label}Liquid`]).divide(boilingProperties[`${label}Vapor`].subtract(boilingProperties[`${label}Liquid`])).setUnit('')
			return getVaporProperties(pressure, vaporFraction, data)
		}
	}

	// Check the phase that we have.
	let phase
	if (label === 'temperature')
		phase = parameter.compare(boilingProperties['temperature']) <= 0 ? 'liquid' : 'gas'
	else
		phase = parameter.compare(boilingProperties[`${label}Liquid`]) <= 0 ? 'liquid' : 'gas'

	// Find the two closest tables through a binary search.
	const fullTable = data.dataByPressure
	const [min, max] = getClosestIndices(pressure, (index) => fullTable[index].pressure, fullTable.length)
	const closestTables = [min, max].map(index => fullTable[index])

	// For the given pressure tables, find the points with respect to the given parameter.
	const closestIndices = closestTables.map(closestTable => getClosestIndices(parameter, (index) => closestTable[label][index], closestTable[label].length))
	const labels = ['temperature', 'enthalpy', 'entropy']
	const closestValues = closestIndices.map((indices, tableIndex) => indices.map(index => {
		const result = { pressure: closestTables[tableIndex].pressure }
		labels.forEach(currLabel => {
			result[currLabel] = closestTables[tableIndex][currLabel][index]
		})
		result.phase = getPhase(result.pressure, result.enthalpy, data)
		return result
	}))

	// Walk through the points again. If any of them has the wrong phase, then errors will ensue. Check for this and, when it happens, find an alternative point on the nearest line based on the temperature. (We cannot use the enthalpy here, since the line does not have a purely ascending enthalpy.)
	const closestValuesProcessed = closestValues.map((valueArray, tableIndex) => valueArray.map((values, rowIndex) => {
		// If the phase matches, it all checks out.
		if (values.phase === phase)
			return values

		// Get the temperature from the other pressure table and use that to find a point on the respective line.
		const temperature = closestValues[1 - tableIndex][rowIndex].temperature
		return getLineProperties(temperature, data, phase === 'liquid')
	}))

	// We have the four closest points. First interpolate between them for the given parameter, reducing it to a range of two points.
	const valuesAtParameter = closestValuesProcessed.map(range => {
		const part = getInterpolationPart(parameter, range.map(value => value[label])).setUnit('')
		const result = {}
		const labelsWithPressure = ['pressure', ...labels]
		labelsWithPressure.forEach(currLabel => {
			result[currLabel] = interpolate(part, range.map(range => range[currLabel]))
		})
		return result
	})

	// Next interpolate between these two points, with respect to the pressure. Do this for all properties to be found.
	const result = { pressure, phase }
	const part = getInterpolationPart(pressure, valuesAtParameter.map(value => value.pressure)).setUnit('')
	labels.forEach(currLabel => {
		if (label === currLabel)
			result[currLabel] = parameter
		result[currLabel] = interpolate(part, valuesAtParameter.map(value => value[currLabel]))
	})
	return result
}
module.exports.getProperties = getProperties
