const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions, getElementaryFunctionFromTerm } = require('../../tools')

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const metaData = {
	skill: 'findBasicDerivative',
	steps: [[null, null], ['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], null],
	comparison: expressionComparisons.equivalent,
}
addSetupFromSteps(metaData)

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

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'f1')
				case 2:
					return performComparison(exerciseData, 'f2')
			}
		case 2:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'f1Derivative')
				case 2:
					return performComparison(exerciseData, 'f2Derivative')
			}
		default:
			return performComparison(exerciseData, 'derivative')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
