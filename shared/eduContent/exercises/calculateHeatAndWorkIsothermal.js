const { selectRandomly } = require('../../util')
const { Unit, getRandomFloatUnit } = require('../../inputTypes')
const gasProperties = require('../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../eduTools')

const data = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, 'specificGasConstant', 'gasLaw', ['calculateWithMass', 'calculateWithTemperature'], null],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		m: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		T: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const m = getRandomFloatUnit({
		min: 0.5,
		max: 6,
		significantDigits: 2,
		unit: 'kg',
	})
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

	return { gas, m, T, p1, p2 }
}

function getSolution({ gas, m, T, p1, p2 }) {
	let { Rs } = gasProperties[gas]
	T = T.simplify()
	const ratio = p1.divide(p2).simplify()
	const Q = m.multiply(Rs).multiply(T).multiply(Math.log(ratio.number)).setUnit('J')
	const W = Q
	return { gas, process: 2, eq: 5, Rs, ratio, m, T, p1, p2, Q, W }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			return performComparison('Rs', input, solution, data.comparison)
		case 4:
			return performComparison('ratio', input, solution, data.comparison)
		case 5:
			switch (substep) {
				case 1: return performComparison('m', input, solution, data.comparison)
				case 2: return performComparison('T', input, solution, data.comparison)
			}
		default:
			return performComparison(['Q', 'W'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
