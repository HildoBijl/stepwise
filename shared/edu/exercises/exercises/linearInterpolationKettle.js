const { getRandomInteger, getRandomFloat, getRandomFloatUnit } = require('../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const data = {
	skill: 'linearInterpolation',
	steps: ['solveLinearEquation', 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		x: {
			absoluteMargin: 0.005,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const type = getRandomInteger(1, 2) // 1 means give year, find population. 2 means give population, find year.
	const T1 = getRandomFloatUnit({
		min: 20,
		max: 40,
		unit: 'dC',
		decimals: 0,
	})
	const T2 = getRandomFloatUnit({
		min: 80,
		max: 100,
		unit: 'dC',
		decimals: 0,
	})
	const t1 = getRandomFloatUnit({
		min: 10,
		max: 30,
		unit: 's',
		decimals: 0,
	})
	const t2 = getRandomFloatUnit({
		min: 80,
		max: 160,
		unit: 's',
		decimals: 0,
	})
	const x = getRandomFloat({ min: 0.1, max: 0.9 })

	if (type === 1) {
		const T = T1.add((T2.subtract(T1)).multiply(x)).roundToPrecision()
		return { type, T1, T2, t1, t2, T }
	} else {
		const t = t1.add((t2.subtract(t1)).multiply(x)).roundToPrecision()
		return { type, T1, T2, t1, t2, t }
	}
}

function getSolution({ type, T1, T2, t1, t2, T, t }) {
	let x
	if (type === 1) {
		x = T.subtract(T1).divide(T2.subtract(T1)).float
		t = t1.add((t2.subtract(t1)).multiply(x)).roundToPrecision()
	} else {
		x = t.subtract(t1).divide(t2.subtract(t1)).float
		T = T1.add((T2.subtract(T1)).multiply(x)).roundToPrecision()
	}
	return { type, T1, T2, t1, t2, x, T, t }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('x', input, solution, data.comparison)
		default:
			return performComparison(state.type === 1 ? 't' : 'T', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}