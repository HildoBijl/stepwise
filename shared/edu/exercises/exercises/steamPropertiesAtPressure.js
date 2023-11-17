const { getRandomInteger, tableInterpolate } = require('../../../util')
const { withPressure } = require('../../../data/steamProperties')
const { getSimpleExerciseProcessor } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const data = {
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

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['T', 'h', 's'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}