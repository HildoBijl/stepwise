const { Unit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { argon: { Rs } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'gasLaw',
	...stepsToSetup([['calculateWithVolume', 'calculateWithPressure', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation']),
	compare: {
		Vs: {
			float: {
				relativeTolerance: 0.001,
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
				target: 'unchanged',
			},
		},
		m: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	const V = getRandomFloatUnit({
		min: 40,
		max: 200,
		decimals: -1,
		unit: 'cm^3',
	}).adjustSignificantDigits(1)

	const p = getRandomFloatUnit({
		min: 200,
		max: 800,
		significantDigits: 2,
		unit: 'mbar',
	}).adjustSignificantDigits(1)

	const T = getRandomFloatUnit({
		min: 15,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})

	return { V, p, T }
}

function getSolution({ p, V, T }) {
	const Vs = V.simplify()
	const ps = p.simplify()
	const Ts = T.simplify()
	const m = ps.multiply(Vs).divide(Rs.multiply(Ts)).setUnit('kg')
	return { ps, Vs, m, Rs, Ts }
}

function checkInput(data, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return compare('Vs', data)
				case 2:
					return compare('ps', data)
				case 3:
					return compare('Ts', data)
			}
		case 2:
			return compare('Rs', data)
		default:
			return compare('m', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
