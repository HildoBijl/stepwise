import { selectRandomly } from '../../../util/random'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import Unit from '../../../inputTypes/Unit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerOr } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import gasProperties from '../../../data/gasProperties'


export const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificGasConstant', 'gasLaw', combinerOr('calculateWithMass', 'calculateWithTemperature')),
	steps: ['recognizeProcessTypes', null, 'specificGasConstant', 'gasLaw', ['calculateWithMass', 'calculateWithTemperature'], 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		m: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		T: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}

export function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const m = getRandomFloatUnit({
		min: 0.5,
		max: 6,
		significantDigits: 2,
		unit: 'kg',
	})
	const T = getRandomFloatUnit({
		min: 6,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 9,
		decimals: 1,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 10,
		max: 30,
		decimals: 0,
		unit: 'bar',
	})

	return { gas, m, T, p1, p2 }
}

export function getCorrect({ gas, m, T, p1, p2 }) {
	let { Rs } = gasProperties[gas]
	T = T.simplify()
	ratio = p1.divide(p2).simplify()
	const Q = m.multiply(Rs).multiply(T).multiply(Math.log(ratio.number)).setUnit('J')
	const W = Q
	return { gas, process: 2, eq: 5, Rs, ratio, m, T, p1, p2, Q, W }
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
			return checkParameter('ratio', correct, input, data.equalityOptions)
		case 5:
			switch (substep) {
				case 1: return checkParameter('m', correct, input, data.equalityOptions)
				case 2: return checkParameter('T', correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['Q', 'W'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
