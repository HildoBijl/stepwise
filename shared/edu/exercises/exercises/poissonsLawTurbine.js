const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { air: { k } } = require('../../../data/gasProperties')

const data = {
	skill: 'poissonsLaw',
	setup: combinerAnd('calculateWithPressure', 'specificHeatRatio', 'solveExponentEquation'),
	steps: [[null, null, 'calculateWithPressure'], 'specificHeatRatio', null, 'solveExponentEquation'],

	equalityOptions: {
		T1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
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
		T2: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const T1 = getRandomFloatUnit({
		min: 700,
		max: 1200,
		decimals: -1,
		unit: 'K',
	}).setSignificantDigits(3)
	const p1 = getRandomFloatUnit({
		min: 6,
		max: 12,
		significantDigits: 2,
		unit: 'bar',
	})
	const p2 = new FloatUnit('1.0 bar')

	return { p1, p2, T1 }
}

function getSolution({ p1, p2, T1 }) {
	const kNum = k.float.number
	const T2 = T1.multiply(p2.divide(p1).float.toPower((kNum-1)/kNum))
	return { k, p1, p2, T1, T2 }
}

function checkInput(state, input, step, substep) {
	const { k, p1, p2, T1, T2 } = getSolution(state)
	const eo = data.equalityOptions

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return T1.equals(input.T1, eo.T1)
				case 2:
					return p1.equals(input.p1, eo.p) && input.p1.unit.equals(input.p2.unit, eo.pUnit)
				case 3:
					return p2.equals(input.p2, eo.p) && input.p1.unit.equals(input.p2.unit, eo.pUnit)
			}
		case 2:
			return k.equals(input.k, eo.k)
		case 3:
			return input.eq === 2
		default:
			return T2.equals(input.T2, eo.T2)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
