import { getRandom } from '../../../util/random'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import * as gasProperties from '../../../data/gasProperties'
const { helium: { k } } = gasProperties
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithInternalEnergy',
	setup: combinerAnd('calculateHeatAndWork', 'solveLinearEquation'),
	steps: ['calculateHeatAndWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const factor = getRandom(1.1, 1.25)
	const p = getRandomFloatUnit({
		min: 1.01,
		max: 1.10,
		decimals: 2,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 3,
		max: 10,
		significantDigits: 2,
		unit: 'l',
	})
	const V2 = V1.multiply(factor)
	return { p, V1, V2 }
}

export function getCorrect({ p, V1, V2 }) {
	p = p.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	const W = p.multiply(V2.subtract(V1)).setUnit('J').setMinimumSignificantDigits(2)
	const Q = W.multiply(k.number/(k.number - 1)).setMinimumSignificantDigits(2)
	const dU = Q.subtract(W).setMinimumSignificantDigits(2)
	return { k, p, V1, V2, Q, W, dU }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['Q', 'W'], correct, input, data.equalityOptions)
		default:
			return checkParameter('dU', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
