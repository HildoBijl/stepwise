const { getRandom, selectRandomly } = require('../../../util/random')
const { getRandomFloat } = require('../../../inputTypes/Float')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const kValues = require('../../../data/specificHeatRatios')

const data = {
	skill: 'poissonsLaw',
	setup: combinerAnd('calculateWithPressure', 'specificHeatRatio', 'solveExponentEquation'),
	steps: [[null, 'calculateWithPressure', null], 'specificHeatRatio', null, 'solveExponentEquation'],

	equalityOptions: {
		V2: {
			absoluteMargin: 0.001,
			significantDigitMargin: 1,
		},
		p: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
		},
		pUnit: {
			type: Unit.equalityTypes.exact,
		},
		k: {
			relativeMargin: 0.01,
		},
		V1: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
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
	}).useDecimals(0)

	return { gas, V2, p1, p2 }
}

function getCorrect({ gas, V2, p1, p2 }) {
	const k = kValues[gas]
	const V1 = V2.multiply(p2.divide(p1).float.toPower(k.float.invert()))
	return { k, V1, V2, p1, p2 }
}

function checkInput(state, { ansp1, ansp2, ansV1, ansV2, ansk, ansEq }, step, substep) {
	const { k, V1, V2, p1, p2 } = getCorrect(state)
	const eo = data.equalityOptions

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return p1.equals(ansp1, eo.p)
				case 2:
					return p2.equals(ansp2, eo.p) && ansp1.unit.equals(ansp2.unit, eo.pUnit)
				case 3:
					return V2.equals(ansV2, eo.V2)
			}
		case 2:
			return k.equals(ansk, eo.k)
		case 3:
			return ansEq[0] === 0
		default:
			return V1.equals(ansV1, eo.V1)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
