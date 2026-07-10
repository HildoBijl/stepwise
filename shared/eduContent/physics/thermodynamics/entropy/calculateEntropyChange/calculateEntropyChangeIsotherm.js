const { Unit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateEntropyChange',
	...stepsToSetup(['calculateWithTemperature', 'solveLinearEquation', 'solveLinearEquation', undefined]),
	compare: {
		FloatUnit: {
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

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare(['Tw', 'Tc'], data)
		case 2:
			return compare('dSc', data)
		case 3:
			return compare('dSw', data)
		default:
			return compare('dS', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
