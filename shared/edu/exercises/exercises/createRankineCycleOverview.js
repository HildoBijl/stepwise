const { tableInterpolate } = require('../../../util/interpolation')
const { withPressure, enthalpy, entropy } = require('../../../data/steamProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getCycle } = require('./support/steamTurbineCycle')

const data = {
	skill: 'createRankineCycleOverview',
	steps: ['lookUpSteamProperties', null, 'lookUpSteamProperties', 'recognizeProcessTypes', 'useVaporFraction'],

	comparison: {
		default: {
			relativeMargin: 0.002,
			significantDigitMargin: 2,
		},
	},
}
addSetupFromSteps(data)

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
	return { pc, pe, T2, hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3, s3, x3, h4, s4 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('h4', input, solution, data.comparison)
		case 2:
			return performComparison('h1', input, solution, data.comparison)
		case 3:
			return performComparison(['h2', 's2'], input, solution, data.comparison)
		case 4:
			return performComparison('s3', input, solution, data.comparison)
		case 5:
			return performComparison('h3', input, solution, data.comparison)
		default:
			return performComparison(['h1', 'h2', 'h3', 'h4'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
