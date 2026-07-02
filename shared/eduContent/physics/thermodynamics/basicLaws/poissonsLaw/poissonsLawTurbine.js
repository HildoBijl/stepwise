const { FloatUnit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { air: { k } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'poissonsLaw',
	...stepsToSetup([[undefined, undefined, 'calculateWithPressure'], 'specificHeatRatio', undefined, 'solveExponentEquation']),

	comparison: {
		T1s: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
			unit: {
				target: 'unchanged',
			},
		},
		p1s: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 1,
			},
		},
		p2s: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 1,
			},
		},
		k: {
			float: {
				relativeTolerance: 0.015,
			},
		},
		T2: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	const T1 = getRandomFloatUnit({
		min: 700,
		max: 1200,
		decimals: -1,
		unit: 'K',
	}).setSignificantDigits(3)
	const p1 = getRandomFloatUnit({
		min: 6,
		max: 12,
		significantDigits: 2,
		unit: 'bar',
	})
	const p2 = new FloatUnit('1.0 bar')

	return { p1, p2, T1 }
}

function getSolution({ p1, p2, T1 }) {
	const T1s = T1
	const p1s = p1
	const p2s = p2
	const eq = 2
	const kNum = k.float.number
	const T2 = T1.multiply(p2.divide(p1).float.toPower((kNum - 1) / kNum))
	return { k, p1s, p2s, T1s, T2, eq }
}

function checkInput(exerciseData, step, substep) {
	const { input } = exerciseData
	const { p1s, p2s } = input
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'T1s')
				case 2:
					return performComparison(exerciseData, 'p1s') && p1s.unit.equals(p2s.unit, { target: 'unchanged' })
				case 3:
					return performComparison(exerciseData, 'p2s') && p1s.unit.equals(p2s.unit, { target: 'unchanged' })
			}
		case 2:
			return performComparison(exerciseData, 'k')
		case 3:
			return performComparison(exerciseData, 'eq')
		default:
			return performComparison(exerciseData, 'T2')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
