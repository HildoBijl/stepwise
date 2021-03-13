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
		h: {
			relativeMargin: 0.002,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const type = getRandomInteger(1, 2) // 1 is temperature given, 2 is pressure given.
	const x = getRandomFloatUnit({ min: 0.1, max: 0.9, unit: '' })
	if (type === 1) {
		const temperatureRange = withTemperature.entropyLiquid.headers[0]
		const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
		const s0 = gridInterpolate(T, withTemperature.entropyLiquid.grid, ...withTemperature.entropyLiquid.headers)
		const s1 = gridInterpolate(T, withTemperature.entropyVapor.grid, ...withTemperature.entropyVapor.headers)
		s = s0.add(x.multiply(s1.subtract(s0))).setDecimals(3).roundToPrecision()
		return { type, T, s }
	} else {
		const pressureRange = withPressure.entropyLiquid.headers[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
		const s0 = gridInterpolate(p, withPressure.entropyLiquid.grid, ...withPressure.entropyLiquid.headers)
		const s1 = gridInterpolate(p, withPressure.entropyVapor.grid, ...withPressure.entropyVapor.headers)
		s = s0.add(x.multiply(s1.subtract(s0))).setDecimals(3).roundToPrecision()
		return { type, p, s }
	}
}

function getCorrect({ type, T, p, s }) {
	// Use the right value to look up the enthalpy/entropy in the right table.
	const value = (type === 1 ? T : p)
	const table = (type === 1 ? withTemperature : withPressure)
	const h0 = gridInterpolate(value, table.enthalpyLiquid.grid, ...table.enthalpyLiquid.headers)
	const h1 = gridInterpolate(value, table.enthalpyVapor.grid, ...table.enthalpyVapor.headers)
	const s0 = gridInterpolate(value, table.entropyLiquid.grid, ...table.entropyLiquid.headers)
	const s1 = gridInterpolate(value, table.entropyVapor.grid, ...table.entropyVapor.headers)

	// Find the vapor fraction and the outcome.
	const x = s.subtract(s0).divide(s1.subtract(s0)).setUnit('')
	const h = h0.add(x.multiply(h1.subtract(h0)))
	return { type, T, p, s, s0, s1, x, h0, h1, h }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['h0', 'h1', 's0', 's1'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter('x', correct, input, data.equalityOptions)
		default:
			return checkParameter('h', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
