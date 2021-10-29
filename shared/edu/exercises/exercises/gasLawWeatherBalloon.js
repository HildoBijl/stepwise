import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { FloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import * as gasProperties from '../../../data/gasProperties'
const { helium: { Rs } } = gasProperties
import { combinerRepeat } from '../../../skillTracking'

export const data = {
	setup: combinerRepeat('gasLaw', 2),
	steps: ['gasLaw', 'gasLaw'],

	equalityOptions: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}

export function generateState() {
	// Define first situation.
	const p1 = new FloatUnit('1.0 bar')
	const V1 = getRandomFloatUnit({
		min: 20,
		max: 300,
		significantDigits: 2,
		unit: 'm^3',
	})
	const T1 = getRandomFloatUnit({
		min: 275,
		max: 295,
		significantDigits: 3,
		unit: 'K',
	})

	// Define end-point.
	const p2 = getRandomFloatUnit({
		min: 5,
		max: 20,
		significantDigits: 2,
		unit: 'mbar',
	})
	const T2 = getRandomFloatUnit({
		min: 200,
		max: 250,
		significantDigits: 3,
		unit: 'K',
	})

	return { p1, p2, T1, T2, V1 }
}

export function getCorrect({ p1, p2, T1, T2, V1 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	T1 = T1.simplify()
	T2 = T2.simplify()
	V1 = V1.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
	const V2 = m.multiply(Rs).multiply(T2).divide(p2).setUnit('m^3')
	return { p1, p2, V1, V2, T1, T2, m, Rs }
}

export function checkInput(state, input, step, substep) {
	const { m, V2 } = getCorrect(state)

	switch (step) {
		case 1:
			return m.equals(input.m, data.equalityOptions)
		default:
			return V2.equals(input.V2, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
