import FloatUnit, { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import gasProperties from '../../../data/gasProperties'
const { air: { cv, cp, Rs } } = gasProperties

export const data = {
	skill: 'calculateEntropyChange',
	setup: combinerAnd('calculateWithTemperature', 'specificGasConstant', 'specificHeats', 'solveLinearEquation'),
	steps: ['calculateWithTemperature', ['specificGasConstant', 'specificHeats'], 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		Rs: {
			relativeMargin: 0.02,
		},
		cp: {
			relativeMargin: 0.02,
		},
	},
}

export function generateState() {
	const n = getRandomFloatUnit({
		min: 1.26,
		max: 1.38,
		significantDigits: 3,
		unit: '',
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = new FloatUnit('1.0 bar')
	const p2 = getRandomFloatUnit({
		min: 6,
		max: 11,
		significantDigits: 2,
		unit: 'bar',
	})

	return { p1, T1, p2, n }
}

export function getCorrect({ p1, T1, p2, n }) {
	T1 = T1.simplify()
	const T2 = T1.multiply(p2.divide(p1).float.toPower((n.number - 1) / n.number)).setDecimals(0)
	const ds = cp.multiply(Math.log(T2.number / T1.number)).subtract(Rs.multiply(Math.log(p2.number / p1.number))).setSignificantDigits(2)
	const c = cv.subtract(Rs.divide(n.number - 1)).setSignificantDigits(3)
	return { n, p1, p2, T1, T2, ds, cv, cp, Rs, c }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('T2', correct, input, data.equalityOptions)
		case 2:
			switch (substep) {
				case 1:
					return checkParameter('Rs', correct, input, data.equalityOptions)
				case 2:
					return checkParameter('cp', correct, input, data.equalityOptions)
			}
		default:
			return checkParameter('ds', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
