const { sample } = require('@step-wise/utils')
const { Unit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateHeatAndWork',
	...stepsToSetup(['recognizeProcessTypes', undefined, ['specificHeats', 'specificGasConstant'], ['calculateWithMass', 'calculateWithTemperature'], undefined]),
	compare: {
		FloatUnit: {
			float: {
				relativeTolerance: 0.015,
				significantDigitTolerance: 2,
			},
		},
		ms: {
			float: {
				relativeTolerance: 0.001,
			},
			unit: {
				target: 'unchanged',
			}
		},
		T1s: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
		},
		T2s: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
		},
		process: {},
		eq: {},
	},
}

function generateState() {
	const gas = sample(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
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

function checkInput(data, step, substep) {
	switch (step) {
		case 1:
			return compare('process', data)
		case 2:
			return compare('eq', data)
		case 3:
			switch (substep) {
				case 1:
					return compare('cp', data)
				case 2:
					return compare('Rs', data)
			}
		case 4:
			switch (substep) {
				case 1:
					return compare('ms', data)
				case 2:
					return compare(['T1s', 'T2s'], data)
			}
		default:
			return compare(['Q', 'W'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
