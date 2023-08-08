const { selectRandomly, getRandomInteger } = require('../../../util')
const { expressionComparisons } = require('../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunctions, getElementaryFunctionFromTerm } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const data = {
	skill: 'findBasicDerivative',
	steps: [[null, null], ['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], null],
	comparison: { default: equivalent },
}
addSetupFromSteps(data)

function generateState() {
	const [f1, f2] = getRandomElementaryFunctions(2, true)
	const x = selectRandomly(variableSet)
	const c1 = getRandomInteger(-12, 12, [0])
	const c2 = getRandomInteger(-12, 12, [0])
	const func = f1.multiply(c1, true).add(f2.multiply(c2, true)).substitute('x', x).basicClean({ mergeProductTerms: false }) // Do not turn 10 * 10^x into 10^(x+1).
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
	const f1Derivative = f1.getDerivative().regularCleanDisplay()
	const f2Derivative = f2.getDerivative().regularCleanDisplay()
	const derivative = c1.multiply(f1Derivative).add(c2.multiply(f2Derivative)).basicClean()
	return { ...state, c1, c2, f1, f2, f1Derivative, f2Derivative, derivative }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(['f1'], input, solution, data.comparison)
				case 2:
					return performComparison(['f2'], input, solution, data.comparison)
			}
		case 2:
			switch (substep) {
				case 1:
					return performComparison(['f1Derivative'], input, solution, data.comparison)
				case 2:
					return performComparison(['f2Derivative'], input, solution, data.comparison)
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
