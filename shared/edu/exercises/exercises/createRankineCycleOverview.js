const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { getCycle } = require('./support/steamTurbineCycle')
const { withPressure, enthalpy, entropy } = require('../../../data/steamProperties')
const { gridInterpolate } = require('../../../util/interpolation')

const data = {
	skill: 'createRankineOverview',
	setup: combinerAnd(combinerRepeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
	steps: ['lookUpSteamProperties', null, 'lookUpSteamProperties', 'recognizeProcessTypes', 'useVaporFraction'],

	equalityOptions: {
		default: {
			relativeMargin: 0.002,
			significantDigitMargin: 2,
		},
	},
}

function generateState() {
	let { pc, pe, T2 } = getCycle()
	pc = pc.setSignificantDigits(2).roundToPrecision()
	pe = pe.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	return { pc, pe, T2 }
}

function getCorrect({ pc, pe, T2 }) {
	// Get liquid and vapor points.
	const hx0 = gridInterpolate(pc, withPressure.enthalpyLiquid.grid, ...withPressure.enthalpyLiquid.headers)
	const hx1 = gridInterpolate(pc, withPressure.enthalpyVapor.grid, ...withPressure.enthalpyVapor.headers)
	const sx0 = gridInterpolate(pc, withPressure.entropyLiquid.grid, ...withPressure.entropyLiquid.headers)
	const sx1 = gridInterpolate(pc, withPressure.entropyVapor.grid, ...withPressure.entropyVapor.headers)

	// Find points 1 and 4.
	const h1 = hx0
	const s1 = sx0
	const h4 = h1
	const s4 = s1

	// Find point 2.
	const h2 = gridInterpolate([pe, T2], enthalpy.grid, ...enthalpy.headers)
	const s2 = gridInterpolate([pe, T2], entropy.grid, ...entropy.headers)

	// Find point 3.
	const s3 = s2
	const x3 = s3.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h3 = hx0.add(x3.multiply(hx1.subtract(hx0)))

	// Return all data.
	return { pc, pe, T2, hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3, s3, x3, h4, s4 }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('h4', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('h1', correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['h2', 's2'], correct, input, data.equalityOptions)
		case 4:
			return checkParameter('s3', correct, input, data.equalityOptions)
		case 5:
			return checkParameter('h3', correct, input, data.equalityOptions)
		default:
			return checkParameter(['h1', 'h2', 'h3', 'h4'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
