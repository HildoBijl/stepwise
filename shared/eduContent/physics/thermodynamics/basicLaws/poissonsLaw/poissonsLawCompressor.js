const { sample } = require('@step-wise/utils')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'poissonsLaw',
	steps: [[null, 'calculateWithPressure', null], 'specificHeatRatio', null, 'solveExponentEquation'],
	comparison: {
		V2s: {
			float: {
				absoluteTolerance: 0.001, // Standard units, in m^3.
				significantDigitTolerance: 1,
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
		V1: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const gas = sample(['methane', 'helium', 'hydrogen'])
	const V2 = getRandomFloatUnit({
		min: 20,
		max: 120,
		decimals: 0,
		unit: 'l',
	})
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 10,
		decimals: 1,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 200,
		max: 300,
		decimals: -1,
		unit: 'bar',
	}).setDecimals(0)

	return { gas, V2, p1, p2 }
}

function getSolution({ gas, p1, p2, V2 }) {
	const p1s = p1
	const p2s = p2
	const V2s = V2
	const { k } = gasProperties[gas]
	const eq = 0
	const V1 = V2.multiply(p2.divide(p1).float.toPower(k.float.invert()))
	return { k, p1s, p2s, V2s, eq, V1 }
}

function checkInput(exerciseData, step, substep) {
	const { input } = exerciseData
	const { p1s, p2s } = input
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'p1s') && p1s.unit.equals(p2s.unit, { target: 'unchanged' })
				case 2:
					return performComparison(exerciseData, 'p2s') && p1s.unit.equals(p2s.unit, { target: 'unchanged' })
				case 3:
					return performComparison(exerciseData, 'V2s')
			}
		case 2:
			return performComparison(exerciseData, 'k')
		case 3:
			return performComparison(exerciseData, 'eq')
		default:
			return performComparison(exerciseData, 'V1')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
