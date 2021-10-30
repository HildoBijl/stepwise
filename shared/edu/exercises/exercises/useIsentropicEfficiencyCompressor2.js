import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import gasProperties from '../../../data/gasProperties'
const { air: { k, cp } } = gasProperties
import { getCycle } from './support/gasTurbineCycle'

export const data = {
	skill: 'useIsentropicEfficiency',
	setup: combinerAnd('poissonsLaw', combinerRepeat('calculateSpecificHeatAndMechanicalWork', 2), 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation', 'calculateSpecificHeatAndMechanicalWork'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	let { p1, T1, p2, etai } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	etai = etai.setUnit('%').setDecimals(0).roundToPrecision()
	return { p1, p2, T1, etai }
}

export function getCorrect({ p1, p2, T1, etai }) {
	etai = etai.simplify()
	const T2p = T1.multiply(p2.divide(p1).float.toPower(1 - 1 / k.number)).setDecimals(0)
	const wti = cp.multiply(T1.subtract(T2p)).setUnit('J/kg')
	const wt = wti.divide(etai).setUnit('J/kg')
	const T2 = T1.subtract(wt.divide(cp)).setUnit('K').setDecimals(0)
	return { k, cp, p1, p2, T1, T2, T2p, wt, wti, etai }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('T2p', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('wti', correct, input, data.equalityOptions)
		case 3:
			return checkParameter('wt', correct, input, data.equalityOptions)
		default:
			return checkParameter('T2', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
