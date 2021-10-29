import { getRandom } from '../../../util/random'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import * as gasProperties from '../../../data/gasProperties'
const { air: { Rs, cv } } = gasProperties
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithInternalEnergy',
	setup: combinerAnd('gasLaw', 'specificHeats', 'solveLinearEquation'),
	steps: ['gasLaw', 'specificHeats', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		cv: {
			relativeMargin: 0.02,
		},
	},
}

export function generateState() {
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p2 = getRandomFloatUnit({
		min: 2.5,
		max: 3.8,
		significantDigits: 2,
		unit: 'bar',
	})
	const V2 = getRandomFloatUnit({
		min: 1,
		max: 3,
		significantDigits: 2,
		unit: 'l',
	})
	const n = getRandom(1.1, 1.3)
	const pressureRatio = p2.number
	const T2 = T1.setUnit('K').multiply(Math.pow(pressureRatio, (n - 1) / n)).setUnit('dC')
	return { T1, p2, V2, T2 }
}

export function getCorrect({ T1, p2, V2, T2 }) {
	T1 = T1.simplify()
	p2 = p2.simplify()
	V2 = V2.simplify()
	T2 = T2.simplify()
	cv = cv.simplify()
	const m = p2.multiply(V2).divide(Rs.multiply(T2)).setUnit('kg')
	const dU = m.multiply(cv).multiply(T2.subtract(T1)).setUnit('J')
	return { cv, Rs, T1, p2, V2, T2, m, dU }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('m', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('cv', correct, input, data.equalityOptions)
		default:
			return checkParameter('dU', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
