const { selectRandomly } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const gasProperties = require('../../../data/gasProperties')

const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificHeatRatio', combinerOr('calculateWithVolume', 'calculateWithPressure')),
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		V: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p1: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p2: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
	},
}

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

function getCorrect({ gas, V, p1, p2 }) {
	let { k } = gasProperties[gas]
	V = V.simplify()
	p1 = p1.simplify()
	p2 = p2.simplify()
	const Q = V.multiply(p2.subtract(p1)).multiply(1 / (k.number - 1)).setUnit('J')
	const W = new FloatUnit('0 J')
	return { gas, process: 1, eq: 2, k, V, p1, p2, Q, W }
}

function checkInput(state, input, step, substep) {
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
				case 1: return checkParameter('V', correct, input, data.equalityOptions)
				case 2: return checkParameter(['p1', 'p2'], correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['Q', 'W'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
