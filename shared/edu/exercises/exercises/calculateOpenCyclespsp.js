import FloatUnit, { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import gasProperties from '../../../data/gasProperties'
const { air: { k, Rs } } = gasProperties
import { combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'

export const data = {
	skill: 'calculateOpenCycle',
	setup: combinerRepeat('calculateOpenProcessStep', 3),
	steps: ['calculateOpenProcessStep', 'calculateOpenProcessStep', 'calculateOpenProcessStep'],

	equalityOptions: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const T1 = getRandomFloatUnit({
		min: 0,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = new FloatUnit('1.0 bar')
	const p2 = getRandomFloatUnit({
		min: 6,
		max: 12,
		significantDigits: 2,
		unit: 'bar',
	})
	const T3 = getRandomFloatUnit({
		min: 900,
		max: 1200,
		decimals: -1,
		unit: 'dC',
	})

	return { p1, T1, p2, T3 }
}

export function getCorrect({ p1, T1, p2, T3 }) {
	p1 = p1.simplify()
	T1 = T1.simplify()
	p2 = p2.simplify()
	T3 = T3.simplify()
	const p3 = p2
	const p4 = p1
	const ratio = p2.number / p1.number
	const factor = Math.pow(ratio, 1 - 1 / k.number)
	const T2 = T1.multiply(factor)
	const T4 = T3.divide(factor)
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	const v3 = Rs.multiply(T3).divide(p3).setUnit('m^3/kg')
	const v4 = Rs.multiply(T4).divide(p4).setUnit('m^3/kg')
	return { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['p3', 'v3', 'T3'], correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['p4', 'v4', 'T4'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
