const { getRandomInteger, tableInterpolate } = require('../../../../../../util')
const { enthalpy, entropy } = require('../../../../../../data/steamProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../../eduTools')

const metaData = {
	skill: 'lookUpSteamProperties',
	weight: 2,
	comparison: {
		default: {
			relativeMargin: 0.001,
		},
	},
}

function generateState() {
	// Extract pressure column.
	const pressureRange = enthalpy.headers[0]
	const p = pressureRange[getRandomInteger(3, Math.min(20, pressureRange.length))] // Limit to a certain part of the table.

	// Extract temperature row.
	const temperatureRange = enthalpy.headers[1]
	const T = temperatureRange[getRandomInteger(6, Math.min(24, temperatureRange.length))] // Limit to a certain part of the table.

	return { p, T }
}

function getSolution({ p, T }) {
	const h = tableInterpolate([p, T], enthalpy)
	const s = tableInterpolate([p, T], entropy)
	return { p, T, h, s }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['h', 's'])
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
