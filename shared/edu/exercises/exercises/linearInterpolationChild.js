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
	const h1 = getRandomFloatUnit({
		min: 80,
		max: 110,
		unit: 'cm',
		decimals: 0,
	})
	const h2 = getRandomFloatUnit({
		min: 130,
		max: 160,
		unit: 'cm',
		decimals: 0,
	})
	const BMI1 = getRandomFloatUnit({
		min: 15,
		max: 18,
		unit: 'kg/m^2',
	})
	const BMI2 = getRandomFloatUnit({
		min: 17,
		max: 20,
		unit: 'kg/m^2',
	})
	const W1 = BMI1.multiply(h1.toPower(2)).setUnit('kg').setDecimals(0).roundToPrecision()
	const W2 = BMI2.multiply(h2.toPower(2)).setUnit('kg').setDecimals(0).roundToPrecision()
	const x = getRandomFloat({ min: 0.1, max: 0.9 })

	if (type === 1) {
		const h = h1.add((h2.subtract(h1)).multiply(x)).roundToPrecision()
		return { type, h1, h2, W1, W2, h }
	} else {
		const W = W1.add((W2.subtract(W1)).multiply(x)).roundToPrecision()
		return { type, h1, h2, W1, W2, W }
	}
}

function getCorrect({ type, h1, h2, W1, W2, h, W }) {
	let x
	if (type === 1) {
		x = h.subtract(h1).divide(h2.subtract(h1)).setUnit('')
		W = W1.add((W2.subtract(W1)).multiply(x)).roundToPrecision()
	} else {
		x = W.subtract(W1).divide(W2.subtract(W1)).setUnit('')
		h = h1.add((h2.subtract(h1)).multiply(x)).roundToPrecision()
	}
	return { type, h1, h2, W1, W2, x, h, W }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('x', correct, input, data.equalityOptions)
		default:
			return checkParameter(state.type === 1 ? 'W' : 'h', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}