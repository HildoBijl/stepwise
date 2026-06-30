const { Unit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateEntropyChange',
	steps: ['calculateWithTemperature', 'solveLinearEquation', 'solveLinearEquation', null],
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
		Tw: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 1,
			},
			unit: {
				target: 'unchanged',
			},
		},
		Tc: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 1,
			},
			unit: {
				target: 'unchanged',
			},
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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
