import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import gasProperties from '../../../data/gasProperties'
const { air: { Rs, k } } = gasProperties
import { combinerAnd, combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'

const equalityOptions = {
	default: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
	T: {
		absoluteMargin: 0.2,
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}

export const data = {
	skill: 'calculateOpenProcessStep',
	setup: combinerAnd(combinerRepeat('gasLaw', 2), 'recognizeProcessTypes'),
	steps: ['gasLaw', 'recognizeProcessTypes', 'gasLaw'],

	equalityOptions: {
		default: equalityOptions.default,
		T1: equalityOptions.T,
		T2: equalityOptions.T,
	},
}

export function generateState() {
	const p1 = getRandomFloatUnit({
		min: 6,
		max: 14,
		unit: 'bar',
		significantDigits: 2,
	})
	const pressureRatio = p1.number
	const T0 = getRandomFloatUnit({
		min: 275,
		max: 300,
		unit: 'K',
	})
	const T1 = T0.multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setDecimals(-1).roundToPrecision().setDecimals(0)
	const T2 = getRandomFloatUnit({
		min: 900,
		max: 1300,
		unit: 'K',
		decimals: -1,
	}).setDecimals(0)

	return { p1, T1, T2 }
}

export function getCorrect({ p1, T1, T2 }) {
	p1 = p1.simplify()
	T1 = T1.simplify()
	T2 = T2.simplify()
	const p2 = p1
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	return { Rs, p1, p2, v1, v2, T1, T2 }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'v1', 'T1'], correct, input, data.equalityOptions)
		case 2:
			return input.process === 0
		case 3:
			return checkParameter(['p2', 'v2', 'T2'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
