const { getRandomInteger } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { withTemperature, withPressure } = require('../../../data/steamProperties')
const { gridInterpolate } = require('../../../util/interpolation')

const data = {
	skill: 'useVaporFraction',
	setup: combinerAnd('lookUpSteamProperties', 'linearInterpolation'),
	steps: ['lookUpSteamProperties', 'linearInterpolation', 'linearInterpolation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.001,
		},
		x: {
			relativeMargin: 0.002,
			significantDigitMargin: 1,
		},
		s: {
			relativeMargin: 0.002,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const type = getRandomInteger(1, 2) // 1 is temperature given, 2 is pressure given.
	const x = getRandomFloatUnit({ min: 0.1, max: 0.9, unit: '' })
	if (type === 1) {
		const temperatureRange = withTemperature.enthalpyLiquid.headers[0]
		const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
		const h0 = gridInterpolate(T, withTemperature.enthalpyLiquid.grid, ...withTemperature.enthalpyLiquid.headers)
		const h1 = gridInterpolate(T, withTemperature.enthalpyVapor.grid, ...withTemperature.enthalpyVapor.headers)
		const h = h0.add(x.multiply(h1.subtract(h0))).setDecimals(0).roundToPrecision()
		return { type, T, h }
	} else {
		const pressureRange = withPressure.enthalpyLiquid.headers[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
		const h0 = gridInterpolate(p, withPressure.enthalpyLiquid.grid, ...withPressure.enthalpyLiquid.headers)
		const h1 = gridInterpolate(p, withPressure.enthalpyVapor.grid, ...withPressure.enthalpyVapor.headers)
		const h = h0.add(x.multiply(h1.subtract(h0))).setDecimals(0).roundToPrecision()
		return { type, p, h }
	}
}

function getCorrect({ type, T, p, h }) {
	// Use the right value to look up the enthalpy/entropy in the right table.
	const value = (type === 1 ? T : p)
	const table = (type === 1 ? withTemperature : withPressure)
	const h0 = gridInterpolate(value, table.enthalpyLiquid.grid, ...table.enthalpyLiquid.headers)
	const h1 = gridInterpolate(value, table.enthalpyVapor.grid, ...table.enthalpyVapor.headers)
	const s0 = gridInterpolate(value, table.entropyLiquid.grid, ...table.entropyLiquid.headers)
	const s1 = gridInterpolate(value, table.entropyVapor.grid, ...table.entropyVapor.headers)

	// Find the vapor fraction and the outcome.
	const x = h.subtract(h0).divide(h1.subtract(h0)).setUnit('')
	const s = s0.add(x.multiply(s1.subtract(s0)))
	return { type, T, p, h, h0, h1, x, s0, s1, s }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['h0', 'h1', 's0', 's1'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter('x', correct, input, data.equalityOptions)
		default:
			return checkParameter('s', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
