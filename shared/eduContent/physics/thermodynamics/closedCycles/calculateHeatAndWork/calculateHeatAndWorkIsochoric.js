const { sample } = require('@step-wise/utils')
const { FloatUnit, getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateHeatAndWork',
	...stepsToSetup(['recognizeProcessTypes', undefined, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], undefined]),
	compare: {
		FloatUnit: {
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

function checkInput(data, step, substep) {
	switch (step) {
		case 1:
			return compare('process', data)
		case 2:
			return compare('eq', data)
		case 3:
			return compare('k', data)
		case 4:
			switch (substep) {
				case 1:
					return compare('Vs', data)
				case 2:
					return compare(['p1s', 'p2s'], data)
			}
		default:
			return compare(['Q', 'W'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
