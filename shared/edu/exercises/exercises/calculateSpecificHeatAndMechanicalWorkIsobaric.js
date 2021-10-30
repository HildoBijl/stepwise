import FloatUnit, { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerOr } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import gasProperties from '../../../data/gasProperties'
const { air: { cp } } = gasProperties

export const data = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificHeats', combinerOr('calculateWithMass', 'calculateWithTemperature', 'calculateWithSpecificQuantities')),
	steps: ['recognizeProcessTypes', null, 'specificHeats', 'calculateWithTemperature', 'calculateWithSpecificQuantities'],

	equalityOptions: {
		cp: {
			relativeMargin: 0.02,
		},
		T1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		T2: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		q: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
		wt: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const T1 = getRandomFloatUnit({
		min: 150,
		max: 300,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)
	const T2 = getRandomFloatUnit({
		min: 650,
		max: 800,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)

	return { T1, T2 }
}

export function getCorrect({ T1, T2 }) {
	cp = cp.simplify()
	const dT = T2.subtract(T1)
	const q = cp.multiply(dT).setUnit('J/kg')
	const wt = new FloatUnit('0 J/kg')
	return { process: 0, eq: 1, T1, T2, cp, q, wt }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return input.process === correct.process
		case 2:
			return input.eq === correct.eq
		case 3:
			return checkParameter('Rs', correct, input, data.equalityOptions)
		case 4:
			return checkParameter(['T1', 'T2'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['q', 'wt'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
