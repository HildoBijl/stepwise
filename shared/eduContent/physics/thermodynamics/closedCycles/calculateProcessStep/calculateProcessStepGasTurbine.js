const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { k, Rs } } = require('../../../../../data/gasProperties')
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
	const m = getRandomFloatUnit({
		min: 500,
		max: 3000,
		significantDigits: 2,
		unit: 'kg',
	})
	const T1 = getRandomFloatUnit({
		min: 900,
		max: 1200,
		decimals: -1,
		unit: 'K',
	})
	const p1 = getRandomFloatUnit({
		min: 7,
		max: 11,
		decimals: 1,
		unit: 'bar',
	})
	const p2 = new FloatUnit('1.0 bar')

	return { m, T1, p1, p2 }
}

function getSolution({ m, T1, p1, p2 }) {
	const p1s = p1.simplify()
	const p2s = p2.simplify()
	const V1 = m.multiply(Rs).multiply(T1).divide(p1).setUnit('m^3')
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(V2).divide(m.multiply(Rs)).setUnit('K')
	return { process: 3, m, T1, p1, p2, k, Rs, m, p1s, V1, T1, p2s, V2, T2 }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'V1', 'T1'])
		case 2:
			return performComparison(exerciseData, 'process')
		case 3:
			return performComparison(exerciseData, exerciseData.input.choice === 1 ? 'T2' : 'V2')
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
