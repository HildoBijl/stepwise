const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomFloat } = require('../../../inputTypes/Float')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')

const data = {
	skill: 'linearInterpolation',
	setup: combinerRepeat('solveLinearEquation', 2),
	steps: ['solveLinearEquation', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		x: {
			absoluteMargin: 0.005,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const type = getRandomInteger(1, 2) // 1 means give year, find population. 2 means give population, find year.
	const T1 = getRandomFloatUnit({
		min: 20,
		max: 40,
		unit: 'dC',
		decimals: 0,
	})
	const T2 = getRandomFloatUnit({
		min: 80,
		max: 100,
		unit: 'dC',
		decimals: 0,
	})
	const t1 = getRandomFloatUnit({
		min: 10,
		max: 30,
		unit: 's',
		decimals: 0,
	})
	const t2 = getRandomFloatUnit({
		min: 80,
		max: 160,
		unit: 's',
		decimals: 0,
	})
	const x = getRandomFloat({ min: 0.1, max: 0.9 })

	if (type === 1) {
		const T = T1.add((T2.subtract(T1)).multiply(x)).roundToPrecision()
		return { type, T1, T2, t1, t2, T }
	} else {
		const t = t1.add((t2.subtract(t1)).multiply(x)).roundToPrecision()
		return { type, T1, T2, t1, t2, t }
	}
}

function getCorrect({ type, T1, T2, t1, t2, T, t }) {
	let x
	if (type === 1) {
		x = T.subtract(T1).divide(T2.subtract(T1)).setUnit('')
		t = t1.add((t2.subtract(t1)).multiply(x)).roundToPrecision()
	} else {
		x = t.subtract(t1).divide(t2.subtract(t1)).setUnit('')
		T = T1.add((T2.subtract(T1)).multiply(x)).roundToPrecision()
	}
	return { type, T1, T2, t1, t2, x, T, t }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('x', correct, input, data.equalityOptions)
		default:
			return checkParameter(state.type === 1 ? 't' : 'T', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}