import { Unit } from '../../../inputTypes/Unit'
import { FloatUnit, getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getRandomInteger, selectRandomly } from '../../../util/random'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import * as gasProperties from '../../../data/gasProperties'


export const data = {
	skill: 'calculateEntropyChange',
	setup: combinerAnd('calculateWithTemperature', 'specificHeats', 'solveLinearEquation'),
	steps: ['calculateWithTemperature', 'specificHeats', 'solveLinearEquation'],
	weight: 2,

	equalityOptions: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		c: {
			relativeMargin: 0.015,
			accuracyFactor: 2,
		},
		T1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
		T2: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}

export function generateState() {
	const type = getRandomInteger(0, 2) // 0 isobaric, 1 isochoric, 2 isentropic
	const medium = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const T1 = getRandomFloatUnit({
		min: 200,
		max: 400,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)
	const T2 = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const m = getRandomFloatUnit({
		min: 100,
		max: 800,
		decimals: -1,
		unit: 'g',
	}).setDecimals(0)

	return { type, medium, T1, T2, m }
}

export function getCorrect({ type, medium, T1, T2, m }) {
	T1 = T1.simplify()
	T2 = T2.simplify()
	m = m.simplify()
	const c = type === 0 ? gasProperties[medium].cp : type === 1 ? gasProperties[medium].cv : new FloatUnit('0 J/kg*K')
	const dS = m.multiply(c).multiply(Math.log(T2.number / T1.number)).setUnit('J/K')
	return { type, medium, T1, T2, m, c, dS }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['T1', 'T2'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter('c', correct, input, data.equalityOptions)
		default:
			return checkParameter('dS', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
