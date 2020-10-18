const { selectRandomly } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { checkField } = require('../util/check')
const gasProperties = require('../../../data/gasProperties')

const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', combinerOr('specificHeats', 'specificGasConstant'), combinerOr('calculateWithMass','calculateWithTemperature')),
	steps: ['recognizeProcessTypes', null, ['specificHeats', 'specificGasConstant'], ['calculateWithMass', null], null],

	equalityOptions: {
		m: {
			relativeMargin: 0.001,
			unitCheck: Unit.equalityTypes.exact,
		},
		cp: {
			relativeMargin: 0.01,
		},
		Rs: {
			relativeMargin: 0.01,
		},
		T1: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
		},
		T2: {
			absoluteMargin: 0.2,
			significantDigitMargin: 2,
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
	const m = getRandomFloatUnit({
		min: 20,
		max: 200,
		significantDigits: 2,
		unit: 'g',
	})
	const T1 = getRandomFloatUnit({
		min: 0,
		max: 10,
		decimals: 0,
		unit: 'dC',
	}).useDecimals(1)
	const T2 = getRandomFloatUnit({
		min: 30,
		max: 60,
		decimals: 0,
		unit: 'dC',
	})
	
	return { gas, m, T1, T2 }
}

function getCorrect({ gas, m, T1, T2 }) {
	let { cp, Rs } = gasProperties[gas]
	cp = cp.simplify()
	m = m.simplify()
	const dT = T2.subtract(T1)
	const Q = m.multiply(cp).multiply(dT).useUnit('J')
	const W = m.multiply(Rs).multiply(dT).useUnit('J')
	return { gas, m, T1, T2, cp, Rs, Q, W }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return input.process === 0
		case 2:
			return input.eq === 1
		case 3:
			switch (substep) {
				case 1: return checkField('cp', correct, input, data.equalityOptions)
				case 2: return checkField('Rs', correct, input, data.equalityOptions)
			}
		case 4:
			switch (substep) {
				case 1: return checkField('m', correct, input, data.equalityOptions)
				case 2: return checkField(['T1', 'T2'], correct, input, data.equalityOptions)
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
