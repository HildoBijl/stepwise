const { selectRandomly } = require('../../../util')
const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const gasProperties = require('../../../data/gasProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], null],

	comparison: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		V: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p1: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p2: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const V = getRandomFloatUnit({
		min: 20,
		max: 200,
		decimals: -1,
		unit: 'l',
	}).setDecimals(0)
	const p1 = getRandomFloatUnit({
		min: 6,
		max: 12,
		decimals: 0,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 13,
		max: 24,
		decimals: 0,
		unit: 'bar',
	})

	return { gas, V, p1, p2 }
}

function getSolution({ gas, V, p1, p2 }) {
	let { k } = gasProperties[gas]
	V = V.simplify()
	p1 = p1.simplify()
	p2 = p2.simplify()
	const Q = V.multiply(p2.subtract(p1)).multiply(1 / (k.number - 1)).setUnit('J')
	const W = new FloatUnit('0 J')
	return { gas, process: 1, eq: 2, k, V, p1, p2, Q, W }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			return performComparison('k', input, solution, data.comparison)
		case 4:
			switch (substep) {
				case 1: return performComparison('V', input, solution, data.comparison)
				case 2: return performComparison(['p1', 'p2'], input, solution, data.comparison)
			}
		default:
			return performComparison(['Q', 'W'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
