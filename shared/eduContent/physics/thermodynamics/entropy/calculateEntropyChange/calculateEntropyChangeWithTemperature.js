const { getRandomInteger, selectRandomly } = require('../../../../../util')
const { Unit, FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateEntropyChange',
	steps: ['calculateWithTemperature', 'specificHeats', 'solveLinearEquation'],
	weight: 2,
	comparison: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		c: {
			relativeMargin: 0.015,
			accuracyFactor: 2,
		},
		T1: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
		T2: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const type = getRandomInteger(0, 2) // 0 isobaric, 1 isochoric, 2 isentropic
	const medium = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
