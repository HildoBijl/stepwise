import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerRepeat } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { tableInterpolate, inverseTableInterpolate } from '../../../util/interpolation'
import { getCycle } from './support/aircoCycle'
import { maximumHumidity } from '../../../data/moistureProperties'

export const data = {
	skill: 'analyseAirco',
	setup: combinerRepeat('readMollierDiagram', 3),
	steps: ['readMollierDiagram', 'readMollierDiagram', 'readMollierDiagram'],

	equalityOptions: {
		default: { // AH
			absoluteMargin: .001, // In standard units, so kg/kg.
			significantDigitMargin: 1,
		},
		endRH: {
			absoluteMargin: .04, // In standard units, so without percentage.
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	let { T1, T3, T4, startRH } = getCycle()
	T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
	T3 = T3.setDecimals(0).roundToPrecision().setDecimals(0)
	T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
	startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
	return { T1, T3, T4, startRH }
}

export function getCorrect({ T1, T3, T4, startRH }) {
	startRH = startRH.simplify()
	const startAHmax = tableInterpolate(T1, maximumHumidity).setSignificantDigits(2)
	const startAH = startRH.multiply(startAHmax)
	const endAH = tableInterpolate(T3, maximumHumidity).setSignificantDigits(2)
	const endAHmax = tableInterpolate(T4, maximumHumidity).setSignificantDigits(2)
	const endRH = endAH.divide(endAHmax).setUnit('')
	const T2 = inverseTableInterpolate(startAH, maximumHumidity).setDecimals(0) // Unneeded, but nice to know.
	return { T1, T2, T3, T4, startRH, startAH, startAHmax, endRH, endAH, endAHmax }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('startAH', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('endAH', correct, input, data.equalityOptions)
		default:
			return checkParameter('endRH', correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
