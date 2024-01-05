const { selectRandomly } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const gasProperties = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateProcessStep',
	steps: ['gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw'],
	comparison: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const gas = selectRandomly(['methane', 'helium', 'hydrogen'])
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 8,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 10,
		max: 30,
		decimals: 0,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 25,
		decimals: 0,
		unit: 'dC',
	})
	const p2 = getRandomFloatUnit({
		min: 15,
		max: 40,
		unit: 'bar',
	})

	const { k, Rs } = gasProperties[gas]
	const m = p1.simplify().multiply(V1.simplify()).divide(Rs.multiply(T1.simplify())).setUnit('g').roundToPrecision()
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k)).roundToPrecision()

	return { gas, m, T1, V1, V2 }
}

function getSolution({ gas, m, T1, V1, V2 }) {
	const { k, Rs } = gasProperties[gas]
	const ms = m.simplify()
	const T1s = T1.simplify()
	const V1s = V1.simplify()
	const V2s = V2.simplify()
	const p1 = ms.multiply(Rs).multiply(T1s).divide(V1s).setUnit('Pa')
	const p2 = p1.multiply(Math.pow(V1s.number / V2s.number, k))
	const T2 = p2.multiply(V2s).divide(ms.multiply(Rs)).setUnit('K')
	return { process: 3, m, T1, V1, V2, k, Rs, ms, p1, V1s, T1s, p2, V2s, T2 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'V1', 'T1'])
		case 2:
			return performComparison(exerciseData, 'process')
		case 3:
			return performComparison(exerciseData, (exerciseData.input.choice || 0) === 0 ? 'p2' : 'T2')
		case 4:
			return performComparison(exerciseData, ['p2', 'V2', 'T2'])
		default:
			return performComparison(exerciseData, ['p1', 'V1', 'T1', 'p2', 'V2', 'T2'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
