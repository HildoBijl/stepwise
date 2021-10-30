import { getRandomInteger } from '../../../inputTypes/Integer'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import Unit from '../../../inputTypes/Unit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import * as gasProperties from '../../../data/gasProperties'
const { oxygen: { Rs } } = gasProperties
import { combinerAnd } from '../../../skillTracking'

export const data = {
	skill: 'gasLaw',
	setup: combinerAnd('calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature', 'specificGasConstant', 'solveLinearEquation'),
	steps: [['calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation'],

	equalityOptions: {
		V: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		m: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		T: {
			absoluteMargin: 0.2,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Rs: {
			relativeMargin: 0.01,
			unitCheck: Unit.equalityTypes.sameUnitsAndPrefixes,
		},
		p: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const p = getRandomFloatUnit({ // Note: this is the final input.wer. It won't be part of the state.
		min: 180,
		max: 300,
		significantDigits: 2,
		unit: 'bar',
	})

	const V = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: getRandomInteger(2, 3),
		unit: 'l',
	})

	const T = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: 2,
		unit: 'dC',
	})

	const m = p.multiply(V).divide(Rs.multiply(T.setUnit('K'))).setUnit('kg').roundToPrecision()

	return { V, m, T }
}

export function getCorrect({ V, m, T }) {
	V = V.simplify()
	T = T.simplify()
	const p = m.multiply(Rs).multiply(T).divide(V).setUnit('Pa')
	return { p, V, m, Rs, T }
}

export function checkInput(state, input, step, substep) {
	const { p, V, m, Rs, T } = getCorrect(state)

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return V.equals(input.V, data.equalityOptions.V)
				case 2:
					return m.equals(input.m, data.equalityOptions.m)
				case 3:
					return T.equals(input.T, data.equalityOptions.T)
			}
		case 2:
			return Rs.equals(input.Rs, data.equalityOptions.Rs)
		default:
			return p.equals(input.p, data.equalityOptions.p)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
