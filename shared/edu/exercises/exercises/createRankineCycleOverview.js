import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { getCycle } from './support/steamTurbineCycle'
import { withPressure, enthalpy, entropy } from '../../../data/steamProperties'
import { tableInterpolate } from '../../../util/interpolation'

export const data = {
	skill: 'createRankineCycleOverview',
	setup: combinerAnd(combinerRepeat('lookUpSteamProperties', 2), 'recognizeProcessTypes', 'useVaporFraction'),
	steps: ['lookUpSteamProperties', null, 'lookUpSteamProperties', 'recognizeProcessTypes', 'useVaporFraction'],

	equalityOptions: {
		default: {
			relativeMargin: 0.002,
			significantDigitMargin: 2,
		},
	},
}

export function generateState() {
	let { pc, pe, T2 } = getCycle()
	pc = pc.setSignificantDigits(2).roundToPrecision()
	pe = pe.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	return { pc, pe, T2 }
}

export function getCorrect({ pc, pe, T2 }) {
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

export function checkInput(state, input, step, substep) {
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

export const processAction = getStepExerciseProcessor(checkInput, data)
