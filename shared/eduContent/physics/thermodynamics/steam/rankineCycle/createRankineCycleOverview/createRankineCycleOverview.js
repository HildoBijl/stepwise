const { tableInterpolate } = require('../../../../../../util')
const { withPressure, enthalpy, entropy } = require('../../../../../../data/steamProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../../eduTools')

const { getCycle } = require('../tools')

const metaData = {
	skill: 'createRankineCycleOverview',
	steps: ['lookUpSteamProperties', null, 'lookUpSteamProperties', 'recognizeProcessTypes', 'useVaporFraction'],
	comparison: {
		default: {
			relativeMargin: 0.002,
			significantDigitMargin: 2,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	let { pc, pe, T2 } = getCycle()
	pc = pc.setSignificantDigits(2).roundToPrecision()
	pe = pe.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	return { pc, pe, T2 }
}

function getSolution({ pc, pe, T2 }) {
	// Get liquid and vapor points.
	const hx0 = tableInterpolate(pc, withPressure.enthalpyLiquid)
	const hx1 = tableInterpolate(pc, withPressure.enthalpyVapor)
	const sx0 = tableInterpolate(pc, withPressure.entropyLiquid)
	const sx1 = tableInterpolate(pc, withPressure.entropyVapor)

	// Find points 1 and 4.
	const h1 = hx0
	const s1 = sx0
	const h4 = h1
	const s4 = s1

	// Find point 2.
	const h2 = tableInterpolate([pe, T2], enthalpy)
	const s2 = tableInterpolate([pe, T2], entropy)

	// Find point 3.
	const s3 = s2
	const x3 = s3.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h3 = hx0.add(x3.multiply(hx1.subtract(hx0)))

	// Return all data.
	return { hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3, s3, x3, h4, s4 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'h4')
		case 2:
			return performComparison(exerciseData, 'h1')
		case 3:
			return performComparison(exerciseData, ['h2', 's2'])
		case 4:
			return performComparison(exerciseData, 's3')
		case 5:
			return performComparison(exerciseData, 'h3')
		default:
			return performComparison(exerciseData, ['h1', 'h2', 'h3', 'h4'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
