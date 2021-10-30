import FloatUnit, { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerOr } from '../../../skillTracking'
import { checkParameter } from '../util/check'
import { getRandom } from '../../../util/random'
import * as gasProperties from '../../../data/gasProperties'
const { air: { k } } = gasProperties

export const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificHeatRatio', combinerOr('calculateWithVolume', 'calculateWithPressure')),
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		V1: {
			relativeMargin: 0.01,
			checkUnitSize: true,
		},
		V2: {
			relativeMargin: 0.01,
			checkUnitSize: true,
		},
		p1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
			checkUnitSize: true,
		},
		p2: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
			checkUnitSize: true,
		},
	},
}

export function generateState() {
	// Determine volumes, ensuring they are nice round numbers.
	let V1 = getRandomFloatUnit({
		min: 150,
		max: 900,
		decimals: -1,
		unit: 'm^3',
	})
	const pressureRatio = getRandom(7, 11)
	const V2 = V1.multiply(Math.pow(pressureRatio, 1 / k)).roundToPrecision()
	V1 = V1.setDecimals(0)

	// Determine corresponding pressures.
	const p2 = new FloatUnit('1.0 bar')
	const p1 = p2.multiply(Math.pow(V2.number / V1.number, k)).setDecimals(1)

	return { p1, p2, V1, V2 }
}

export function getCorrect({ p1, p2, V1, V2 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	const Q = new FloatUnit('0 J')
	const W = p2.multiply(V2).subtract(p1.multiply(V1)).multiply(-1 / (k.number - 1)).setUnit('J')
	return { process: 3, eq: 6, k, p1, p2, V1, V2, Q, W }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return input.process === correct.process
		case 2:
			return input.eq === correct.eq
		case 3:
			return checkParameter('k', correct, input, data.equalityOptions)
		case 4:
			switch (substep) {
				case 1: return checkParameter(['V1', 'V2'], correct, input, data.equalityOptions)
				case 2: return checkParameter(['p1', 'p2'], correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['Q', 'W'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
