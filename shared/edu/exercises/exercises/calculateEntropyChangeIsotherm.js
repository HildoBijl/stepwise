const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'calculateEntropyChange',
	setup: combinerAnd('calculateWithTemperature', combinerRepeat('solveLinearEquation', 2)),
	steps: ['calculateWithTemperature', 'solveLinearEquation', 'solveLinearEquation', null],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		Tw: {
			absoluteMargin: 0.2,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Tc: {
			absoluteMargin: 0.2,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}

function generateState() {
	const Q = getRandomFloatUnit({
		min: 2,
		max: 10,
		significantDigits: 2,
		unit: 'kJ',
	})
	const Tw = getRandomFloatUnit({
		min: 500,
		max: 1000,
		decimals: -2,
		unit: 'dC',
	}).setDecimals(0)
	const Tc = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})

	return { Q, Tw, Tc }
}

function getCorrect({ Q, Tw, Tc }) {
	Q = Q.simplify()
	Tw = Tw.simplify()
	Tc = Tc.simplify()
	const Qw = Q.multiply(-1)
	const Qc = Q
	const dSw = Qw.divide(Tw)
	const dSc = Qc.divide(Tc)
	const dS = dSw.add(dSc)
	return { Q, Tw, Tc, Qw, Qc, dSw, dSc, dS }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['Tw', 'Tc'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter('dSc', correct, input, data.equalityOptions)
		case 3:
			return checkParameter('dSw', correct, input, data.equalityOptions)
		default:
			return checkParameter('dS', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
