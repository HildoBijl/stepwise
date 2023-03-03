const { Unit } = require('../../../inputTypes/Unit')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'calculateEntropyChange',
	steps: ['calculateWithTemperature', 'solveLinearEquation', 'solveLinearEquation', null],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		Tw: {
			absoluteMargin: 0.7,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Tc: {
			absoluteMargin: 0.7,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}
addSetupFromSteps(data)

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

function getSolution({ Q, Tw, Tc }) {
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
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['Tw', 'Tc'], input, solution, data.comparison)
		case 2:
			return performComparison('dSc', input, solution, data.comparison)
		case 3:
			return performComparison('dSw', input, solution, data.comparison)
		default:
			return performComparison('dS', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
