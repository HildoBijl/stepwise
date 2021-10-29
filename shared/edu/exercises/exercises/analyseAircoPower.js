import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import * as gasProperties from '../../../data/gasProperties'
const { air: { cp } } = gasProperties
import { checkParameter } from '../util/check'
import { tableInterpolate, inverseTableInterpolate } from '../../../util/interpolation'
import { getCycle } from './support/aircoCycle'
import { maximumHumidity } from '../../../data/moistureProperties'

export const data = {
	setup: combinerAnd('analyseAirco', 'calculateSpecificHeatAndMechanicalWork', 'massFlowTrick'),
	steps: ['analyseAirco', 'calculateSpecificHeatAndMechanicalWork', 'massFlowTrick'],

	equalityOptions: {
		default: {
			relativeMargin: 0.05,
			significantDigitMargin: 1,
		},
		T3: {
			absoluteMargin: 1,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	let { T1, startRH, T4, endRH } = getCycle()
	T1 = T1.setDecimals(0).roundToPrecision().setDecimals(0)
	T4 = T4.setDecimals(0).roundToPrecision().setDecimals(0)
	startRH = startRH.setUnit('%').setDecimals(0).roundToPrecision()
	endRH = endRH.setUnit('%').setDecimals(0).roundToPrecision()
	const mdot = getRandomFloatUnit({
		min: 3,
		max: 15,
		unit: 'kg/s',
		significantDigits: 2,
	})
	return { T1, startRH, T4, endRH, mdot }
}

export function getCorrect({ T1, startRH, T4, endRH, mdot }) {
	// Relative humidity.
	startRH = startRH.simplify()
	endRH = endRH.simplify()

	// Maximum humidity.
	const startAHmax = tableInterpolate(T1, maximumHumidity).setSignificantDigits(2)
	const endAHmax = tableInterpolate(T4, maximumHumidity).setSignificantDigits(2)

	// Absolute humidity.
	const startAH = startRH.multiply(startAHmax).setDecimals(0)
	const endAH = endRH.multiply(endAHmax).setDecimals(0)
	const dAH = startAH.subtract(endAH)

	// Temperatures.
	const T2 = inverseTableInterpolate(startAH, maximumHumidity).setDecimals(0)
	const T3 = inverseTableInterpolate(endAH, maximumHumidity).setDecimals(0)

	// Heat flows.
	const qcool = cp.multiply(T1.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)
	const qheat = cp.multiply(T4.subtract(T3)).setUnit('kJ/kg').setMinimumSignificantDigits(2)

	// Powers.
	const Pcool = mdot.multiply(qcool).setUnit('kW')
	const Pheat = mdot.multiply(qheat).setUnit('kW')

	return { T1, T2, T3, T4, startRH, startAH, startAHmax, endRH, endAH, endAHmax, cp, qcool, qheat, mdot, Pcool, Pheat }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('T3', correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['qcool', 'qheat'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['Pcool', 'Pheat'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
