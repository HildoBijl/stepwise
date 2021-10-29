import { FloatUnit, getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import * as gasProperties from '../../../data/gasProperties'
const { air: { k, Rs } } = gasProperties

export const data = {
	skill: 'calculateProcessStep',
	setup: combinerAnd(combinerRepeat('gasLaw', 2), 'recognizeProcessTypes', 'poissonsLaw'),
	steps: ['gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const m = getRandomFloatUnit({
		min: 500,
		max: 3000,
		significantDigits: 2,
		unit: 'kg',
	})
	const T1 = getRandomFloatUnit({
		min: 900,
		max: 1200,
		decimals: -1,
		unit: 'K',
	})
	const p1 = getRandomFloatUnit({
		min: 7,
		max: 11,
		decimals: 1,
		unit: 'bar',
	})
	const p2 = new FloatUnit('1.0 bar')

	return { m, T1, p1, p2 }
}

export function getCorrect({ m, T1, p1, p2 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	const V1 = m.multiply(Rs).multiply(T1).divide(p1).setUnit('m^3')
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(V2).divide(m.multiply(Rs)).setUnit('K')
	return { k, Rs, m, p1, V1, T1, p2, V2, T2 }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'V1', 'T1'], correct, input, data.equalityOptions)
		case 2:
			return input.process === 3
		case 3:
			const choice = input.choice || 0
			return checkParameter(choice === 0 ? 'V2' : 'T2', correct, input, data.equalityOptions)
		case 4:
			return checkParameter(['p2', 'V2', 'T2'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
