const { Unit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { helium: { Rs } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'gasLaw',
	...stepsToSetup([['calculateWithMass', 'calculateWithTemperature', 'calculateWithPressure'], 'specificGasConstant', 'solveLinearEquation']),
	comparison: {
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
		ps: {
			float: {
				relativeTolerance: 0.001,
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
		V: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	const m = getRandomFloatUnit({
		min: 0.4,
		max: 2,
		significantDigits: 2,
		unit: 'g',
	})

	const T = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})

	const p = getRandomFloatUnit({
		min: 1.0,
		max: 1.1,
		decimals: 2,
		unit: 'bar',
	})

	return { m, T, p }
}

function getSolution({ m, T, p }) {
	const ms = m.simplify()
	const Ts = T.simplify()
	const ps = p.simplify()
	const V = ms.multiply(Rs).multiply(Ts).divide(ps).setUnit('m^3')
	return { ps, V, ms, Rs, Ts }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'ms')
				case 2:
					return performComparison(exerciseData, 'Ts')
				case 3:
					return performComparison(exerciseData, 'ps')
			}
		case 2:
			return performComparison(exerciseData, 'Rs')
		default:
			return performComparison(exerciseData, 'V')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
