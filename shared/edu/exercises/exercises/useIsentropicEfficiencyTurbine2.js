import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { getCycle } from './support/steamTurbineCycle'

export const data = {
	skill: 'useIsentropicEfficiency',
	setup: combinerAnd(combinerRepeat('calculateWithEnthalpy', 2), 'solveLinearEquation'),
	steps: ['calculateWithEnthalpy', 'solveLinearEquation', 'calculateWithEnthalpy'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	let { etai, h2: h1, h3p: h2p } = getCycle() // Cycle indices.
	etai = etai.setUnit('%').setDecimals(0).roundToPrecision()
	h1 = h1.setDecimals(-1).roundToPrecision().setDecimals(0)
	h2p = h2p.setDecimals(-1).roundToPrecision().setDecimals(0)
	return { h1, h2p, etai }
}

export function getCorrect({ h1, h2p, etai }) {
	etai = etai.simplify()
	const wti = h1.subtract(h2p)
	const wt = wti.multiply(etai).setDecimals(0)
	const h2 = h1.subtract(wt)
	return { h1, h2p, h2, wti, wt, etai }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('wti', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('wt', correct, input, data.equalityOptions)
		default:
			return checkParameter('h2', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
