const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { getCycle } = require('./support/steamTurbineCycle')
const { withPressure, enthalpy, entropy } = require('../../../data/steamProperties')
const { gridInterpolate } = require('../../../util/interpolation')
const { getRandomInteger } = require('../../../util/random')

const data = {
	skill: 'analyseRankineCycle',
	setup: combinerAnd('createRankineCycleOverview', 'useVaporFraction', 'useIsentropicEfficiency', 'calculateWithEfficiency', 'massFlowTrick'),
	steps: ['createRankineCycleOverview', 'useVaporFraction', ['useIsentropicEfficiency', 'calculateWithEfficiency', 'massFlowTrick']],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
		},
	},
}

function generateState() {
	let { pc, pe, T2, x3, mdot, P } = getCycle()
	pc = pc.setSignificantDigits(2).roundToPrecision()
	pe = pe.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	x3 = x3.setSignificantDigits(2).roundToPrecision().setSignificantDigits(3)

	const type = getRandomInteger(1, 2) // Type 1 means mdot given, type 2 means P given.
	if (type === 1) {
		mdot = mdot.setSignificantDigits(2).roundToPrecision()
		return { type, pc, pe, T2, x3, mdot }
	} else {
		P = P.setSignificantDigits(2).roundToPrecision()
		return { type, pc, pe, T2, x3, P }
	}
}

function getCorrect({ type, pc, pe, T2, x3, mdot, P }) {
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

	// Find point 3p.
	const s3p = s2
	const x3p = s3p.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h3p = hx0.add(x3p.multiply(hx1.subtract(hx0)))

	// Find point 3 and etai.
	const h3 = hx0.add(x3.multiply(hx1.subtract(hx0)))
	const etai = h2.subtract(h3).divide(h2.subtract(h3p)).setUnit('')

	// Find energy flows.
	const wt = h2.subtract(h3)
	const q = h2.subtract(h1)
	const eta = wt.divide(q).setUnit('')

	// Apply mass flow trick.
	if (type === 1) {
		P = mdot.multiply(wt).setUnit('MW')
	} else {
		mdot = P.divide(wt).setUnit('kg/s')
	}

	// Return all data.
	return { type, pc, pe, T2, hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3p, s3p, x3p, h3, x3, h4, s4, etai, wt, q, eta, P, mdot }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	const toCheck = state.type === 1 ? 'P' : 'mdot'
	switch (step) {
		case 1:
			return checkParameter(['h1', 'h2', 'h3p', 'h4'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter('h3', correct, input, data.equalityOptions)
		case 3:
			switch (substep) {
				case 1:
					return checkParameter('etai', correct, input, data.equalityOptions)
				case 2:
					return checkParameter('eta', correct, input, data.equalityOptions)
				case 3:
					return checkParameter(toCheck, correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['etai', 'eta', toCheck], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
