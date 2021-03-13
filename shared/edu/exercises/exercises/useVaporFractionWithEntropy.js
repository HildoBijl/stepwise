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
		const sx0 = gridInterpolate(T, withTemperature.entropyLiquid.grid, ...withTemperature.entropyLiquid.headers)
		const sx1 = gridInterpolate(T, withTemperature.entropyVapor.grid, ...withTemperature.entropyVapor.headers)
		const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
		return { type, T, s }
	} else {
		const pressureRange = withPressure.entropyLiquid.headers[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
		const sx0 = gridInterpolate(p, withPressure.entropyLiquid.grid, ...withPressure.entropyLiquid.headers)
		const sx1 = gridInterpolate(p, withPressure.entropyVapor.grid, ...withPressure.entropyVapor.headers)
		const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
		return { type, p, s }
	}
}

function getCorrect({ type, T, p, s }) {
	// Use the right value to look up the enthalpy/entropy in the right table.
	const value = (type === 1 ? T : p)
	const table = (type === 1 ? withTemperature : withPressure)
	const hx0 = gridInterpolate(value, table.enthalpyLiquid.grid, ...table.enthalpyLiquid.headers)
	const hx1 = gridInterpolate(value, table.enthalpyVapor.grid, ...table.enthalpyVapor.headers)
	const sx0 = gridInterpolate(value, table.entropyLiquid.grid, ...table.entropyLiquid.headers)
	const sx1 = gridInterpolate(value, table.entropyVapor.grid, ...table.entropyVapor.headers)

	// Find the vapor fraction and the outcome.
	const x = s.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h = hx0.add(x.multiply(hx1.subtract(hx0)))
	return { type, T, p, s, sx0, sx1, x, hx0, hx1, h }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['hx0', 'hx1', 'sx0', 'sx1'], correct, input, data.equalityOptions)
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
