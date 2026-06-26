const { getRandomInteger } = require('@step-wise/utils')
const { tableInterpolate } = require('@step-wise/interpolation')
const { saturatedSteamByTemperature } = require('@step-wise/physics-data')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../../eduTools')

const metaData = {
	skill: 'lookUpSteamProperties',
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.001,
			},
		},
	},
}

function generateState() {
	const temperatureRange = saturatedSteamByTemperature.inputValues[0]
	const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
	const type = getRandomInteger(1, 2) // Type 1: liquid line. Type 2: vapor line.
	return { T, type }
}

function getSolution({ T, type }) {
	// Get pressure.
	const p = tableInterpolate(T, saturatedSteamByTemperature, 'boilingPressure')

	// Get enthalpy.
	const h = tableInterpolate(T, saturatedSteamByTemperature, type === 1 ? 'enthalpyLiquid' : 'enthalpyVapor')

	// Get entropy.
	const s = tableInterpolate(T, saturatedSteamByTemperature, type === 1 ? 'entropyLiquid' : 'entropyVapor')

	return { T, type, p, h, s }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['p', 'h', 's'])
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
