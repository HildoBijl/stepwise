const { getRandomInteger } = require('@step-wise/utils')
const { Unit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { oxygen: { Rs } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'gasLaw',
	...stepsToSetup([['calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation']),
	comparison: {
		Vs: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 1,
			},
			unit: {
				target: 'unchanged',
			},
		},
		ms: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 1,
			},
			unit: {
				target: 'unchanged',
			},
		},
		Ts: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 1,
			},
			unit: {
				target: 'unchanged',
			},
		},
		Rs: {
			float: {
				relativeTolerance: 0.01,
			},
			unit: {
				target: 'noPrefixes',
			},
		},
		p: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	const p = getRandomFloatUnit({ // Note: this is the final input.wer. It won't be part of the state.
		min: 180,
		max: 300,
		significantDigits: 2,
		unit: 'bar',
	})

	const V = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: getRandomInteger(2, 3),
		unit: 'l',
	})

	const T = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: 2,
		unit: 'dC',
	})

	const m = p.multiply(V).divide(Rs.multiply(T.setUnit('K'))).setUnit('kg').roundToPrecision()

	return { V, m, T }
}

function getSolution({ V, m, T }) {
	const Vs = V.simplify()
	const Ts = T.simplify()
	const ms = m
	const p = ms.multiply(Rs).multiply(Ts).divide(Vs).setUnit('Pa')
	return { p, Vs, ms, Rs, Ts }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'Vs')
				case 2:
					return performComparison(exerciseData, 'ms')
				case 3:
					return performComparison(exerciseData, 'Ts')
			}
		case 2:
			return performComparison(exerciseData, 'Rs')
		default:
			return performComparison(exerciseData, 'p')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
