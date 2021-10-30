import { selectRandomly } from '../../../util/random'
import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import Unit from '../../../inputTypes/Unit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd } from '../../../skillTracking'
import * as gasProperties from '../../../data/gasProperties'


export const data = {
	skill: 'poissonsLaw',
	setup: combinerAnd('calculateWithPressure', 'specificHeatRatio', 'solveExponentEquation'),
	steps: [[null, 'calculateWithPressure', null], 'specificHeatRatio', null, 'solveExponentEquation'],

	equalityOptions: {
		V2: {
			absoluteMargin: 0.001,
			significantDigitMargin: 1,
		},
		p1: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
		},
		p2: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
		},
		pUnit: {
			type: Unit.equalityTypes.exact,
		},
		k: {
			relativeMargin: 0.015,
		},
		V1: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

export function generateState() {
	const gas = selectRandomly(['methane', 'helium', 'hydrogen'])
	const V2 = getRandomFloatUnit({
		min: 20,
		max: 120,
		decimals: 0,
		unit: 'l',
	})
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 10,
		decimals: 1,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 200,
		max: 300,
		decimals: -1,
		unit: 'bar',
	}).setDecimals(0)

	return { gas, V2, p1, p2 }
}

export function getCorrect({ gas, V2, p1, p2 }) {
	const { k } = gasProperties[gas]
	const V1 = V2.multiply(p2.divide(p1).float.toPower(k.float.invert()))
	return { gas, k, V1, V2, p1, p2 }
}

export function checkInput(state, input, step, substep) {
	const { k, V1, V2, p1, p2 } = getCorrect(state)
	const eo = data.equalityOptions

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return p1.equals(input.p1, eo.p) && input.p1.unit.equals(input.p2.unit, eo.pUnit)
				case 2:
					return p2.equals(input.p2, eo.p) && input.p1.unit.equals(input.p2.unit, eo.pUnit)
				case 3:
					return V2.equals(input.V2, eo.V2)
			}
		case 2:
			return k.equals(input.k, eo.k)
		case 3:
			return input.eq === 0
		default:
			return V1.equals(input.V1, eo.V1)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
