const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { expressionComparisons } = require('../../../CAS')
const { combinerRepeat } = require('../../../skillTracking')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunctions, getElementaryFunctionFromTerm } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const data = {
	skill: 'findBasicDerivative',
	setup: combinerRepeat('lookUpElementaryDerivative', 3),
	steps: [[null, null, null], ['lookUpElementaryDerivative', 'lookUpElementaryDerivative', 'lookUpElementaryDerivative'], null],
	comparison: { default: equivalent },
}

function generateState() {
	const [f1, f2, f3] = getRandomElementaryFunctions(3, true)
	const x = selectRandomly(variableSet)
	const c1 = getRandomInteger(-12, 12, [0])
	const c2 = getRandomInteger(-12, 12, [0])
	const c3 = getRandomInteger(-12, 12, [0])
	const func = f1.multiply(c1, true).add(f2.multiply(c2, true)).add(f3.multiply(c3, true)).substitute('x', x).basicClean()
	return {
		x,
		f: selectRandomly(functionSet),
		func,
	}
}

function getSolution(state) {
	const { func } = state
	const { constant: c1, func: f1 } = getElementaryFunctionFromTerm(func.terms[0])
	const { constant: c2, func: f2 } = getElementaryFunctionFromTerm(func.terms[1])
	const { constant: c3, func: f3 } = getElementaryFunctionFromTerm(func.terms[2])
	const f1Derivative = f1.getDerivative()
	const f2Derivative = f2.getDerivative()
	const f3Derivative = f3.getDerivative()
	const derivative = c1.multiply(f1Derivative).add(c2.multiply(f2Derivative)).add(c3.multiply(f3Derivative)).basicClean()
	return { ...state, c1, c2, c3, f1, f2, f3, f1Derivative, f2Derivative, f3Derivative, derivative }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(['f1'], input, solution, data.comparison)
				case 2:
					return performComparison(['f2'], input, solution, data.comparison)
				case 3:
					return performComparison(['f3'], input, solution, data.comparison)
			}
		case 2:
			switch (substep) {
				case 1:
					return performComparison(['f1Derivative'], input, solution, data.comparison)
				case 2:
					return performComparison(['f2Derivative'], input, solution, data.comparison)
				case 3:
					return performComparison(['f3Derivative'], input, solution, data.comparison)
			}
		default:
			return performComparison('derivative', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}
