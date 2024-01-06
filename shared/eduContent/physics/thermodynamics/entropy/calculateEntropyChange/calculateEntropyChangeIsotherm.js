const { Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
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
addSetupFromSteps(metaData)

function generateState() {
	const Qo = getRandomFloatUnit({
		min: 2,
		max: 10,
		significantDigits: 2,
		unit: 'kJ',
	})
	const Two = getRandomFloatUnit({
		min: 500,
		max: 1000,
		decimals: -2,
		unit: 'dC',
	}).setDecimals(0)
	const Tco = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})

	return { Qo, Two, Tco }
}

function getSolution({ Qo, Two, Tco }) {
	const Q = Qo.simplify()
	const Tw = Two.simplify()
	const Tc = Tco.simplify()
	const Qw = Q.multiply(-1)
	const Qc = Q
	const dSw = Qw.divide(Tw)
	const dSc = Qc.divide(Tc)
	const dS = dSw.add(dSc)
	return { Q, Tw, Tc, Qw, Qc, dSw, dSc, dS }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['Tw', 'Tc'])
		case 2:
			return performComparison(exerciseData, 'dSc')
		case 3:
			return performComparison(exerciseData, 'dSw')
		default:
			return performComparison(exerciseData, 'dS')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
