const { selectRandomly } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const gasProperties = require('../../../data/gasProperties')

const data = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificGasConstant', 'gasLaw', 'calculateWithTemperature', 'calculateWithSpecificQuantities'),
	steps: ['recognizeProcessTypes', null, 'specificGasConstant', 'gasLaw', 'calculateWithTemperature', 'calculateWithSpecificQuantities'],

	equalityOptions: {
		Rs: {
			relativeMargin: 0.015,
		},
		ratio: {
			relativeMargin: 0.01,
		},
		T: {
			absoluteMargin: 0.2,
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

function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const T = getRandomFloatUnit({
		min: 6,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 9,
		decimals: 1,
		unit: 'bar',
	})
	const p2 = getRandomFloatUnit({
		min: 10,
		max: 30,
		decimals: 0,
		unit: 'bar',
	})

	return { gas, T, p1, p2 }
}

function getSolution({ gas, T, p1, p2 }) {
	let { Rs } = gasProperties[gas]
	T = T.simplify()
	ratio = p1.divide(p2).simplify()
	const q = Rs.multiply(T).multiply(Math.log(ratio.number)).setUnit('J/kg')
	const wt = q
	return { gas, process: 2, eq: 5, Rs, ratio, T, p1, p2, q, wt }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			return performComparison('Rs', input, solution, data.equalityOptions)
		case 4:
			return performComparison('ratio', input, solution, data.equalityOptions)
		case 5:
			return performComparison('T', input, solution, data.equalityOptions)
		default:
			return performComparison(['q', 'wt'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
