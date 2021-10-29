import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import * as gasProperties from '../../../data/gasProperties'
const { air: { k, cp } } = gasProperties
import { getCycle } from './support/gasTurbineCycle'

export const data = {
	skill: 'useIsentropicEfficiency',
	setup: combinerAnd('poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	let { p1, T1, p2, T2 } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	return { p1, p2, T1, T2 }
}

export function getCorrect({ p1, p2, T1, T2 }) {
	const T2p = T1.multiply(p2.divide(p1).float.toPower(1 - 1 / k.number)).setDecimals(0)
	const wt = cp.multiply(T2.subtract(T1)).setUnit('J/kg')
	const wti = cp.multiply(T2p.subtract(T1)).setUnit('J/kg')
	const etai = wti.divide(wt).setUnit('')
	return { k, cp, p1, p2, T1, T2, T2p, wt, wti, etai }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('T2p', correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['wt', 'wti'], correct, input, data.equalityOptions)
		default:
			return checkParameter('etai', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
