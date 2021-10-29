import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { getCycle } from './support/steamTurbineCycle'
import { withPressure, enthalpy, entropy } from '../../../data/steamProperties'
import { tableInterpolate } from '../../../util/interpolation'
import { getRandomInteger } from '../../../util/random'

export const data = {
	skill: 'analyseRankineCycle',
	setup: combinerAnd('createRankineCycleOverview', 'useIsentropicEfficiency', 'calculateWithEfficiency', 'massFlowTrick'),
	steps: ['createRankineCycleOverview', 'useIsentropicEfficiency', ['calculateWithEfficiency', 'massFlowTrick']],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
		},
	},
}

export function generateState() {
	let { pc, pe, T2, etai, mdot, P } = getCycle()
	pc = pc.setSignificantDigits(2).roundToPrecision()
	pe = pe.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	etai = etai.setUnit('%').setDecimals(0).roundToPrecision().setDecimals(1)

	const type = getRandomInteger(1, 2) // Type 1 means mdot given, type 2 means P given.
	if (type === 1) {
		mdot = mdot.setSignificantDigits(2).roundToPrecision()
		return { type, pc, pe, T2, etai, mdot }
	} else {
		P = P.setSignificantDigits(2).roundToPrecision()
		return { type, pc, pe, T2, etai, P }
	}
}

export function getCorrect({ type, pc, pe, T2, etai, mdot, P }) {
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

	// Find point 3p.
	const s3p = s2
	const x3p = s3p.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h3p = hx0.add(x3p.multiply(hx1.subtract(hx0)))

	// Find point 3.
	etai = etai.simplify()
	const h3 = h2.subtract(etai.multiply(h2.subtract(h3p)))

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
	return { type, pc, pe, T2, hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3p, s3p, x3p, h3, h4, s4, etai, wt, q, eta, P, mdot }
}

export function checkInput(state, input, step, substep) {
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
					return checkParameter('eta', correct, input, data.equalityOptions)
				case 2:
					return checkParameter(toCheck, correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['eta', toCheck], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
