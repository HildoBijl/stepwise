const { selectRandomly } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { checkField } = require('../util/check')
const gasProperties = require('../../../data/gasProperties')

const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificHeatRatio', combinerOr('calculateWithVolume', 'calculateWithPressure')),
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], null],

	equalityOptions: {
		k: {
			relativeMargin: 0.01,
		},
		V: {
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
		Q: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		W: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const gas = selectRandomly(['air', 'carbonDioxide', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const V = getRandomFloatUnit({
		min: 20,
		max: 200,
		decimals: -1,
		unit: 'l',
	}).useDecimals(0)
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
			return checkField('k', correct, input, data.equalityOptions)
		case 4:
			switch (substep) {
				case 1: return checkField('V', correct, input, data.equalityOptions)
				case 2: return checkField(['p1', 'p2'], correct, input, data.equalityOptions)
			}
		default:
			return checkField(['Q', 'W'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
