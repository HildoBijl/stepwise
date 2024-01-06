const { getRandomInteger, tableInterpolate } = require('../../../../../../util')
const { withPressure } = require('../../../../../../data/steamProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../../eduTools')

const metaData = {
	skill: 'lookUpSteamProperties',
	comparison: {
		default: {
			relativeMargin: 0.001,
		},
	},
}

function generateState() {
	const pressureRange = withPressure.boilingTemperature.headers[0]
	const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
	const type = getRandomInteger(1, 2) // Type 1: liquid line. Type 2: vapor line.
	return { p, type }
}

function getSolution({ p, type }) {
	// Get pressure.
	const T = tableInterpolate(p, withPressure.boilingTemperature)

	// Get enthalpy.
	const h = tableInterpolate(p, type === 1 ? withPressure.enthalpyLiquid : withPressure.enthalpyVapor)

	// Get entropy.
	const s = tableInterpolate(p, type === 1 ? withPressure.entropyLiquid : withPressure.entropyVapor)

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
