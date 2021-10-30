import { selectRandomly } from '../../../util/random'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import Unit from '../../../inputTypes/Unit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerOr } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import * as gasProperties from '../../../data/gasProperties'


export const data = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificGasConstant', 'gasLaw', 'calculateWithTemperature', 'calculateWithSpecificQuantities'),
	steps: ['recognizeProcessTypes', null, 'specificGasConstant', 'gasLaw', 'calculateWithTemperature', 'calculateWithSpecificQuantities'],

	equalityOptions: {
		Rs: {
			relativeMargin: 0.015,
		},
		ratio: {
			relativeMargin: 0.01,
		},
		T: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
		q: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		wt: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

export function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
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

	return { gas, T, p1, p2 }
}

export function getCorrect({ gas, T, p1, p2 }) {
	let { Rs } = gasProperties[gas]
	T = T.simplify()
	ratio = p1.divide(p2).simplify()
	const q = Rs.multiply(T).multiply(Math.log(ratio.number)).setUnit('J/kg')
	const wt = q
	return { gas, process: 2, eq: 5, Rs, ratio, T, p1, p2, q, wt }
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
			return checkParameter('T', correct, input, data.equalityOptions)
		default:
			return checkParameter(['q', 'wt'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
