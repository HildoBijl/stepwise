import { getRandom } from '../../../util/random'
import { getRandomFloat } from '../../../inputTypes/Float'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import gasProperties from '../../../data/gasProperties'
const { air: { Rs, cv } } = gasProperties
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateWithInternalEnergy',
	setup: combinerAnd('poissonsLaw', 'calculateHeatAndWork', 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateHeatAndWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const n = getRandomFloat({
		min: 1.1,
		max: 1.3,
		decimals: 1,
	}).number
	const p2 = getRandomFloatUnit({
		min: 1.3,
		max: 1.8,
		decimals: 2,
		unit: 'bar',
	})
	const V2 = getRandomFloatUnit({
		min: 300,
		max: 600,
		significantDigits: 2,
		unit: 'cm^3',
	}).setDecimals(0)
	const volumeFactor = getRandom(15, 25) // = V2/V1
	const V1 = V2.divide(volumeFactor).setDecimals(0).roundToPrecision()
	const p1 = p2.multiply(Math.pow(volumeFactor, n)).setDecimals(0).roundToPrecision() // Poisson's law

	return { p1, V1, V2, n }
}

export function getCorrect({ p1, V1, V2, n }) {
	p1 = p1.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	cv = cv.simplify()
	const p2 = p1.multiply(Math.pow(V1.number/V2.number, n))
	const diff = p2.multiply(V2).subtract(p1.multiply(V1)).setUnit('J')
	const c = cv.subtract(Rs.divide(n-1))
	const Q = c.divide(Rs).multiply(diff).setUnit('J').setMinimumSignificantDigits(2)
	const W = diff.multiply(-1/(n-1)).setMinimumSignificantDigits(2)
	const dU = Q.subtract(W).setMinimumSignificantDigits(2)
	return { cv, Rs, c, p1, V1, p2, V2, n, Q, W, dU }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('p2', correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q', 'W'], correct, input, data.equalityOptions)
		default:
			return checkParameter('dU', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
