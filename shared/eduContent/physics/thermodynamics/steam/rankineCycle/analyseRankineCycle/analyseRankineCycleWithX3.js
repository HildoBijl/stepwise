const { getRandomInteger } = require('@step-wise/utils')
const { multiOutputTableInterpolate } = require('@step-wise/interpolation')
const { saturatedSteamByPressure, superheatedSteam } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../../eduTools')

const { getCycle } = require('../tools')

const metaData = {
	skill: 'analyseRankineCycle',
	steps: ['createRankineCycleOverview', 'useVaporFraction', ['useIsentropicEfficiency', 'calculateWithEfficiency', 'massFlowTrick']],
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 2,
			},
		},
	},
}
addSetupFromSteps(metaData)

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

function getSolution({ type, pc, pe, T2, x3, mdot, P }) {
	// Get liquid and vapor points.
	const { enthalpyLiquid: hx0, enthalpyVapor: hx1, entropyLiquid: sx0, entropyVapor: sx1 } = multiOutputTableInterpolate(pc, saturatedSteamByPressure)

	// Find points 1 and 4.
	const h1 = hx0
	const s1 = sx0
	const h4 = h1
	const s4 = s1

	// Find point 2.
	const { enthalpy: h2, entropy: s2 } = multiOutputTableInterpolate([pe, T2], superheatedSteam)

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
	return { hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3p, s3p, x3p, h3, h4, s4, etai, wt, q, eta, mdot, P }
}

function checkInput(exerciseData, step, substep) {
	const toCheck = exerciseData.state.type === 1 ? 'P' : 'mdot'
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['h1', 'h2', 'h3p', 'h4'])
		case 2:
			return performComparison(exerciseData, 'h3')
		case 3:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'etai')
				case 2:
					return performComparison(exerciseData, 'eta')
				case 2:
					return performComparison(exerciseData, toCheck)
			}
		default:
			return performComparison(exerciseData, ['etai', 'eta', toCheck])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
