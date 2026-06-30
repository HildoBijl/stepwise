const { getRandomInteger } = require('@step-wise/utils')
const { tableInterpolate } = require('@step-wise/interpolation')
const { and } = require('@step-wise/skill-setup')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { saturatedSteamByTemperature, saturatedSteamByPressure } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../../eduTools')

const metaData = {
	skill: 'useVaporFraction',
	setup: and('lookUpSteamProperties', 'linearInterpolation'),
	steps: ['lookUpSteamProperties', 'linearInterpolation', 'linearInterpolation'],
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.001,
			},
		},
		x: {
			float: {
				relativeTolerance: 0.002,
				significantDigitTolerance: 1,
			},
		},
		h: {
			float: {
				relativeTolerance: 0.002,
				significantDigitTolerance: 1,
			},
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const type = getRandomInteger(1, 2) // 1 is temperature given, 2 is pressure given.
	const x = getRandomFloatUnit({ min: 0.1, max: 0.9, unit: '' })
	if (type === 1) {
		const temperatureRange = saturatedSteamByTemperature.inputValues[0]
		const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
		const sx0 = tableInterpolate(T, saturatedSteamByTemperature, 'entropyLiquid')
		const sx1 = tableInterpolate(T, saturatedSteamByTemperature, 'entropyVapor')
		const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
		return { type, T, s }
	} else {
		const pressureRange = saturatedSteamByPressure.inputValues[0]
		const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
		const sx0 = tableInterpolate(p, saturatedSteamByPressure, 'entropyLiquid')
		const sx1 = tableInterpolate(p, saturatedSteamByPressure, 'entropyVapor')
		const s = sx0.add(x.multiply(sx1.subtract(sx0))).setDecimals(3).roundToPrecision()
		return { type, p, s }
	}
}

function getSolution({ type, T, p, s }) {
	// Use the right value to look up the enthalpy/entropy in the right table.
	const value = (type === 1 ? T : p)
	const table = (type === 1 ? saturatedSteamByTemperature : saturatedSteamByPressure)
	const hx0 = tableInterpolate(value, table, 'enthalpyLiquid')
	const hx1 = tableInterpolate(value, table, 'enthalpyVapor')
	const sx0 = tableInterpolate(value, table, 'entropyLiquid')
	const sx1 = tableInterpolate(value, table, 'entropyVapor')

	// Find the vapor fraction and the outcome.
	const x = s.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h = hx0.add(x.multiply(hx1.subtract(hx0)))
	return { sx0, sx1, x, hx0, hx1, h }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['hx0', 'hx1', 'sx0', 'sx1'])
		case 2:
			return performComparison(exerciseData, 'x')
		default:
			return performComparison(exerciseData, 'h')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
