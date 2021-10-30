import { getRandom } from '../../../util/random'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import gasProperties from '../../../data/gasProperties'
const { air: { Rs, k, cp } } = gasProperties
import { combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithEnthalpy',
	setup: combinerRepeat('solveLinearEquation', 2),
	steps: ['solveLinearEquation', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const n = getRandom(1.2, 1.38)
	const pressureRatio = getRandom(6, 9)
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 25,
		decimals: 0,
		unit: 'dC',
	})
	const T2 = T1.simplify().multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setUnit('dC')
	const wt = Rs.multiply(-n / (n - 1)).multiply(T2.subtract(T1)).setUnit('kJ/kg')

	return { T1, T2, wt }
}

export function getCorrect({ T1, T2, wt }) {
	wt = wt.simplify()
	cp = cp.simplify()
	const dh = cp.multiply(T2.subtract(T1)).setUnit('J/kg')
	const q = dh.add(wt)
	return { cp, T1, T2, wt, dh, q }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('dh', correct, input, data.equalityOptions)
		default:
			return checkParameter('q', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
