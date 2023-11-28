const { getRandomInteger, tableInterpolate } = require('../../../util')
const { and } = require('../../../skillTracking')
const { getRandomFloatUnit } = require('../../../inputTypes')
const { withTemperature, withPressure } = require('../../../data/steamProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const data = {
	skill: 'useVaporFraction',
	setup: and('lookUpSteamProperties', 'linearInterpolation'),
	steps: ['lookUpSteamProperties', 'linearInterpolation', 'linearInterpolation'],

	comparison: {
		default: {
			relativeMargin: 0.001,
		},
		x: {
			relativeMargin: 0.002,
			significantDigitMargin: 1,
		},
		h: {
			relativeMargin: 0.002,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const type = getRandomInteger(1, 2) // 1 is temperature given, 2 is pressure given.
	const x = getRandomFloatUnit({ min: 0.1, max: 0.9, unit: '' })
	if (type === 1) {
		const temperatureRange = withTemperature.entropyLiquid.headers[0]
		const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
		const sx0 = tableInterpolate(T, withTemperature.entropyLiquid)
		const sx1 = tableInterpolate(T, withTemperature.entropyVapor)
		const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
		return { type, T, s }
	} else {
		const pressureRange = withPressure.entropyLiquid.headers[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
		const sx0 = tableInterpolate(p, withPressure.entropyLiquid)
		const sx1 = tableInterpolate(p, withPressure.entropyVapor)
		const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
		return { type, p, s }
	}
}

function getSolution({ type, T, p, s }) {
	// Use the right value to look up the enthalpy/entropy in the right table.
	const value = (type === 1 ? T : p)
	const table = (type === 1 ? withTemperature : withPressure)
	const hx0 = tableInterpolate(value, table.enthalpyLiquid)
	const hx1 = tableInterpolate(value, table.enthalpyVapor)
	const sx0 = tableInterpolate(value, table.entropyLiquid)
	const sx1 = tableInterpolate(value, table.entropyVapor)

	// Find the vapor fraction and the outcome.
	const x = s.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h = hx0.add(x.multiply(hx1.subtract(hx0)))
	return { type, T, p, s, sx0, sx1, x, hx0, hx1, h }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['hx0', 'hx1', 'sx0', 'sx1'], input, solution, data.comparison)
		case 2:
			return performComparison('x', input, solution, data.comparison)
		default:
			return performComparison('h', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
