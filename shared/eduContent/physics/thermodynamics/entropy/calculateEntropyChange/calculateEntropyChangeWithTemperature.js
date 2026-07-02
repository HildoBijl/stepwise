const { getRandomInteger, sample } = require('@step-wise/utils')
const { FloatUnit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateEntropyChange',
	...stepsToSetup(['calculateWithTemperature', 'specificHeats', 'solveLinearEquation']),
	weight: 2,
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.015,
				significantDigitTolerance: 1,
			},
		},
		c: {
			float: {
				relativeTolerance: 0.015,
			},
		},
		T1: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
			unit: {
				target: 'unchanged',
			},
		},
		T2: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
			unit: {
				target: 'unchanged',
			},
		},
	},
}

function generateState() {
	const type = getRandomInteger(0, 2) // 0 isobaric, 1 isochoric, 2 isentropic
	const medium = sample(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const T1o = getRandomFloatUnit({
		min: 200,
		max: 400,
		decimals: -1,
		unit: 'dC',
	}).setDecimals(0)
	const T2o = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const mo = getRandomFloatUnit({
		min: 100,
		max: 800,
		decimals: -1,
		unit: 'g',
	}).setDecimals(0)

	return { type, medium, T1o, T2o, mo }
}

function getSolution({ type, medium, T1o, T2o, mo }) {
	const T1 = T1o.simplify()
	const T2 = T2o.simplify()
	const m = mo.simplify()
	const c = type === 0 ? gasProperties[medium].cp : type === 1 ? gasProperties[medium].cv : new FloatUnit('0 J/kg*K')
	const dS = m.multiply(c).multiply(Math.log(T2.number / T1.number)).setUnit('J/K')
	return { T1, T2, m, c, dS }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['T1', 'T2'])
		case 2:
			return performComparison(exerciseData, 'c')
		default:
			return performComparison(exerciseData, 'dS')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
