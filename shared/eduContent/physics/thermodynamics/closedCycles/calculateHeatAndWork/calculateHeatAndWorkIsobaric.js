const { selectRandomly } = require('../../../../../util')
const { Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, ['specificHeats', 'specificGasConstant'], ['calculateWithMass', 'calculateWithTemperature'], null],
	comparison: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		ms: {
			relativeMargin: 0.001,
			unitCheck: Unit.equalityTypes.exact,
		},
		T1s: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
		},
		T2s: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const gas = selectRandomly(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const m = getRandomFloatUnit({
		min: 20,
		max: 200,
		significantDigits: 2,
		unit: 'g',
	})
	const T1 = getRandomFloatUnit({
		min: 1,
		max: 10,
		decimals: 0,
		unit: 'dC',
	})
	const T2 = getRandomFloatUnit({
		min: 30,
		max: 60,
		decimals: 0,
		unit: 'dC',
	})

	return { gas, m, T1, T2 }
}

function getSolution({ gas, m, T1, T2 }) {
	let { cp, Rs } = gasProperties[gas]
	cp = cp.simplify()
	const T1s = T1
	const T2s = T2
	const ms = m.simplify()
	const dT = T2s.subtract(T1s)
	const Q = ms.multiply(cp).multiply(dT).setUnit('J')
	const W = ms.multiply(Rs).multiply(dT).setUnit('J')
	return { gas, process: 0, eq: 1, ms, T1s, T2s, cp, Rs, Q, W }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'process')
		case 2:
			return performComparison(exerciseData, 'eq')
		case 3:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'cp')
				case 2:
					return performComparison(exerciseData, 'Rs')
			}
		case 4:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'ms')
				case 2:
					return performComparison(exerciseData, ['T1s', 'T2s'])
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
