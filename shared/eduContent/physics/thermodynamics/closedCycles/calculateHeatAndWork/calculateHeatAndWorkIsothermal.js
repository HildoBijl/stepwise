const { selectRandomly } = require('../../../../../util')
const { Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, 'specificGasConstant', 'gasLaw', ['calculateWithMass', 'calculateWithTemperature'], null],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		ms: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Ts: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
	},
}
addSetupFromSteps(metaData)

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
	const Ts = T.simplify()
	const ms = m
	const ratio = p1.divide(p2).simplify()
	const Q = ms.multiply(Rs).multiply(Ts).multiply(Math.log(ratio.number)).setUnit('J')
	const W = Q
	return { gas, process: 2, eq: 5, Rs, ratio, ms, Ts, p1, p2, Q, W }
}

function checkInput(exerciseData, step, substep) {
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
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'ms')
				case 2:
					return performComparison(exerciseData, 'Ts')
			}
		default:
			return performComparison(exerciseData, ['Q', 'W'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
