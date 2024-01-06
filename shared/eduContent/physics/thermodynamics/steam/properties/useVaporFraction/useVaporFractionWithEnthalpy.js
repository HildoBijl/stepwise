const { getRandomInteger, tableInterpolate } = require('../../../../../../util')
const { and } = require('../../../../../../skillTracking')
const { getRandomFloatUnit } = require('../../../../../../inputTypes')
const { withTemperature, withPressure } = require('../../../../../../data/steamProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../../eduTools')

const metaData = {
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
		s: {
			relativeMargin: 0.002,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const type = getRandomInteger(1, 2) // 1 is temperature given, 2 is pressure given.
	const x = getRandomFloatUnit({ min: 0.1, max: 0.9, unit: '' })
	if (type === 1) {
		const temperatureRange = withTemperature.enthalpyLiquid.headers[0]
		const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
		const hx0 = tableInterpolate(T, withTemperature.enthalpyLiquid)
		const hx1 = tableInterpolate(T, withTemperature.enthalpyVapor)
		const h = hx0.add(x.multiply(hx1.subtract(hx0))).setDecimals(0).roundToPrecision()
		return { type, T, h }
	} else {
		const pressureRange = withPressure.enthalpyLiquid.headers[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
		const hx0 = tableInterpolate(p, withPressure.enthalpyLiquid)
		const hx1 = tableInterpolate(p, withPressure.enthalpyVapor)
		const h = hx0.add(x.multiply(hx1.subtract(hx0))).setDecimals(0).roundToPrecision()
		return { type, p, h }
	}
}

function getSolution({ type, T, p, h }) {
	// Use the right value to look up the enthalpy/entropy in the right table.
	const value = (type === 1 ? T : p)
	const table = (type === 1 ? withTemperature : withPressure)
	const hx0 = tableInterpolate(value, table.enthalpyLiquid)
	const hx1 = tableInterpolate(value, table.enthalpyVapor)
	const sx0 = tableInterpolate(value, table.entropyLiquid)
	const sx1 = tableInterpolate(value, table.entropyVapor)

	// Find the vapor fraction and the outcome.
	const x = h.subtract(hx0).divide(hx1.subtract(hx0)).setUnit('')
	const s = sx0.add(x.multiply(sx1.subtract(sx0)))
	return { hx0, hx1, x, sx0, sx1, s }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['hx0', 'hx1', 'sx0', 'sx1'])
		case 2:
			return performComparison(exerciseData, 'x')
		default:
			return performComparison(exerciseData, 's')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
