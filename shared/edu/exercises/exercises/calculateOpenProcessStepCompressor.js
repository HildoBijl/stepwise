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
	setup: combinerAnd(combinerRepeat('gasLaw', 2), 'poissonsLaw'),
	steps: ['gasLaw', 'poissonsLaw', 'gasLaw'],

	equalityOptions: {
		default: equalityOptions.default,
		T1: equalityOptions.T,
		T2: equalityOptions.T,
	},
}

export function generateState() {
	const p1 = getRandomFloatUnit({
		min: 1,
		max: 3,
		unit: 'bar',
		significantDigits: 2,
	})
	const p2 = getRandomFloatUnit({
		min: 8,
		max: 16,
		unit: 'bar',
		significantDigits: 2,
	})
	const T1 = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})
	const n = getRandomFloatUnit({
		min: 1.2,
		max: k.number,
		significantDigits: 3,
		unit: '',
	})

	return { p1, p2, T1, n }
}

export function getCorrect({ p1, p2, T1, n }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	T1 = T1.simplify()
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = v1.multiply(Math.pow(p1.number / p2.number, 1 / n.number))
	const T2 = p2.multiply(v2).divide(Rs).setUnit('K')
	return { Rs, n, p1, p2, v1, v2, T1, T2 }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'v1', 'T1'], correct, input, data.equalityOptions)
		case 2:
			const choice = input.choice || 0
			return checkParameter(choice === 0 ? 'v2' : 'T2', correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['p2', 'v2', 'T2'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
