const { sample } = require('@step-wise/utils')
const { Unit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	...stepsToSetup(['recognizeProcessTypes', undefined, 'specificGasConstant', 'gasLaw', 'calculateWithTemperature', 'calculateWithSpecificQuantities']),
	compare: {
		Rs: {
			float: {
				relativeTolerance: 0.015,
			},
		},
		ratio: {
			float: {
				relativeTolerance: 0.01,
			},
		},
		T: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
			unit: {
				target: 'unchanged',
			},
		},
		q: {
			float: {
				relativeTolerance: 0.015,
				significantDigitTolerance: 1,
			},
		},
		wt: {
			float: {
				relativeTolerance: 0.015,
				significantDigitTolerance: 1,
			},
		},
	},
}

function generateState() {
	const gas = sample(['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
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
	const { Rs } = gasProperties[gas]
	const T = To.simplify()
	const p1 = p1o
	const p2 = p2o
	const ratio = p1.divide(p2).simplify()
	const q = Rs.multiply(T).multiply(Math.log(ratio.number)).setUnit('J/kg')
	const wt = q
	return { gas, process: 2, eq: 5, Rs, ratio, T, p1, p2, q, wt }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('process', data)
		case 2:
			return compare('eq', data)
		case 3:
			return compare('Rs', data)
		case 4:
			return compare('ratio', data)
		case 5:
			return compare('T', data)
		default:
			return compare(['q', 'wt'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
