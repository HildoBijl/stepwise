const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { getRandom } = require('../../../util/random')
const { air: { k } } = require('../../../data/gasProperties')

const data = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificHeatRatio', combinerOr('calculateWithVolume', 'calculateWithPressure'), 'calculateWithSpecificQuantities'),
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], 'calculateWithSpecificQuantities'],

	equalityOptions: {
		k: {
			relativeMargin: 0.015,
		},
		v1: {
			relativeMargin: 0.01,
			checkUnitSize: true,
		},
		v2: {
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
		q: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
		wt: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	// Determine volumes, ensuring they are nice round numbers.
	let v2 = getRandomFloatUnit({
		min: 1.5,
		max: 1.8,
		decimals: 1,
		unit: 'm^3/kg',
	})
	const pressureRatio = getRandom(7, 11)
	const v1 = v2.multiply(Math.pow(1 / pressureRatio, 1 / k)).roundToPrecision()

	// Determine corresponding pressures.
	const p2 = new FloatUnit('1.0 bar')
	const p1 = p2.multiply(Math.pow(v2.number / v1.number, k)).setDecimals(1)

	return { p1, p2, v1, v2 }
}

function getSolution({ p1, p2, v1, v2 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	const q = new FloatUnit('0 J/kg')
	const wt = p2.multiply(v2).subtract(p1.multiply(v1)).multiply(-k.number / (k.number - 1)).setUnit('J/kg')
	return { process: 3, eq: 6, k, p1, p2, v1, v2, q, wt }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			return checkParameter('k', solution, input, data.equalityOptions)
		case 4:
			switch (substep) {
				case 1: return checkParameter(['v1', 'v2'], solution, input, data.equalityOptions)
				case 2: return checkParameter(['p1', 'p2'], solution, input, data.equalityOptions)
			}
		default:
			return checkParameter(['q', 'wt'], solution, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
