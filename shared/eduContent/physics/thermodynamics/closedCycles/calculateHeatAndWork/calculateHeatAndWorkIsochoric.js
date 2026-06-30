const { sample } = require('@step-wise/utils')
const { FloatUnit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], null],
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.015,
				significantDigitTolerance: 2,
			},
		},
		Vs: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 1,
			},
			unit: {
				checkSize: true,
			},
		},
		p1s: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 1,
			},
			unit: {
				checkSize: true,
			},
		},
		p2s: {
			float: {
				relativeTolerance: 0.001,
				significantDigitTolerance: 1,
			},
			unit: {
				checkSize: true,
			},
		},
		process: {},
		eq: {},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const gas = sample(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const V = getRandomFloatUnit({
		min: 20,
		max: 200,
		decimals: -1,
		unit: 'l',
	}).setDecimals(0)
	const p1 = getRandomFloatUnit({
		min: 6,
		max: 12,
		decimals: 0,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 13,
		max: 24,
		decimals: 0,
		unit: 'bar',
	})

	return { gas, V, p1, p2 }
}

function getSolution({ gas, V, p1, p2 }) {
	let { k } = gasProperties[gas]
	const Vs = V.simplify()
	const p1s = p1.simplify()
	const p2s = p2.simplify()
	const Q = Vs.multiply(p2s.subtract(p1s)).multiply(1 / (k.number - 1)).setUnit('J')
	const W = new FloatUnit('0 J')
	return { gas, process: 1, eq: 2, k, Vs, p1s, p2s, Q, W }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'process')
		case 2:
			return performComparison(exerciseData, 'eq')
		case 3:
			return performComparison(exerciseData, 'k')
		case 4:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'Vs')
				case 2:
					return performComparison(exerciseData, ['p1s', 'p2s'])
			}
		default:
			return performComparison(exerciseData, ['Q', 'W'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
