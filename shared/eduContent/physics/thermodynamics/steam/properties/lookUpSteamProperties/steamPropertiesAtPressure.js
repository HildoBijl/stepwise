const { getRandomInteger } = require('@step-wise/utils')
const { tableInterpolate } = require('@step-wise/interpolation')
const { saturatedSteamByPressure } = require('@step-wise/physics-data')
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
	const pressureRange = saturatedSteamByPressure.inputValues[0]
	const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
	const type = getRandomInteger(1, 2) // Type 1: liquid line. Type 2: vapor line.
	return { p, type }
}

function getSolution({ p, type }) {
	// Get pressure.
	const T = tableInterpolate(p, saturatedSteamByPressure, 'boilingTemperature')

	// Get enthalpy.
	const h = tableInterpolate(p, saturatedSteamByPressure, type === 1 ? 'enthalpyLiquid' : 'enthalpyVapor')

	// Get entropy.
	const s = tableInterpolate(p, saturatedSteamByPressure, type === 1 ? 'entropyLiquid' : 'entropyVapor')

	return { p, type, T, h, s }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['T', 'h', 's'])
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
