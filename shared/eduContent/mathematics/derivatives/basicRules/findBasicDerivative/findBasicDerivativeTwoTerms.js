const { sample, getRandomInteger } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { getRandomElementaryFunctions, getElementaryFunctionFromTerm } = require('../../tools')

const variableSet = ['x', 'y', 't']
const functionSet = ['f', 'g', 'h']

const metaData = {
	skill: 'findBasicDerivative',
	...stepsToSetup([[undefined, undefined], ['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], undefined]),
	compare: { Expression: expressionComparisons.equivalent },
}

function generateState() {
	const [f1, f2] = getRandomElementaryFunctions(2, false)
	const x = sample(variableSet)
	const c1 = getRandomInteger(-12, 12, [0])
	const c2 = getRandomInteger(-12, 12, [0])
	const func = f1.multiplyLeft(c1).add(f2.multiplyLeft(c2)).substitute('x', x).cancel(['mergeFractionProducts']) // Do not turn 10 * 10^x into 10^(x+1).
	return {
		x,
		f: sample(functionSet),
		func,
	}
}

function getSolution(state) {
	const { func } = state
	const { constant: c1, func: f1 } = getElementaryFunctionFromTerm(func.terms[0])
	const { constant: c2, func: f2 } = getElementaryFunctionFromTerm(func.terms[1])
	const f1Derivative = f1.getDerivative().combine().sort()
	const f2Derivative = f2.getDerivative().combine().sort()
	const derivative = c1.multiply(f1Derivative).add(c2.multiply(f2Derivative)).combine()
	return { ...state, c1, c2, f1, f2, f1Derivative, f2Derivative, derivative }
}

function checkInput(data, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return compare('f1', data)
				case 2:
					return compare('f2', data)
			}
		case 2:
			switch (substep) {
				case 1:
					return compare('f1Derivative', data)
				case 2:
					return compare('f2Derivative', data)
			}
		default:
			return compare('derivative', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
