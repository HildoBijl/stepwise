const { selectRandomly } = require('../../../../../util')
const { Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	steps: ['recognizeProcessTypes', null, 'specificGasConstant', 'gasLaw', 'calculateWithTemperature', 'calculateWithSpecificQuantities'],
	comparison: {
		Rs: {
			relativeMargin: 0.015,
		},
		ratio: {
			relativeMargin: 0.01,
		},
		T: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
		q: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		wt: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const To = getRandomFloatUnit({
		min: 6,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1o = getRandomFloatUnit({
		min: 2,
		max: 9,
		decimals: 1,
		unit: 'bar',
	})
	const p2o = getRandomFloatUnit({
		min: 10,
		max: 30,
		decimals: 0,
		unit: 'bar',
	})

	return { gas, To, p1o, p2o }
}

function getSolution({ gas, To, p1o, p2o }) {
	let { Rs } = gasProperties[gas]
	const T = To.simplify()
	const p1 = p1o
	const p2 = p2o
	const ratio = p1.divide(p2).simplify()
	const q = Rs.multiply(T).multiply(Math.log(ratio.number)).setUnit('J/kg')
	const wt = q
	return { gas, process: 2, eq: 5, Rs, ratio, T, p1, p2, q, wt }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'process')
		case 2:
			return performComparison(exerciseData, 'eq')
		case 3:
			return performComparison(exerciseData, 'Rs')
		case 4:
			return performComparison(exerciseData, 'ratio')
		case 5:
			return performComparison(exerciseData, 'T')
		default:
			return performComparison(exerciseData, ['q', 'wt'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
