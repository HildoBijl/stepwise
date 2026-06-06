const { sample, randomInteger } = require('@step-wise/utils')
const { asExpression, expressionComparisons, expressionChecks } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../eduTools')

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasPowerWithinPowerBase } = expressionChecks

// ax^b(x^c)^d = ax^(b+cd).
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'simplifyProductOfPowers',
	steps: ['rewritePower', 'rewritePower'],
	comparison: {
		powersReduced: (input, correct) => !hasPowerWithinPowerBase(input) && equivalent(input, correct),
		ans: onlyOrderChanges,
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = randomInteger(example ? 2 : -8, 8, [-1, 0, 1])
	return {
		x: sample(variableSet),
		a,
		b: randomInteger(2, 6),
		c: randomInteger(2, 5),
		d: randomInteger(2, 5),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('a*x^b(x^c)^d').substitute(variables).removeTrivial()
	const powersReducedStep = expression.removeTrivial(['removePowersWithinPowers'])
	const powersReduced = powersReducedStep.removeTrivial(['mergeProductNumbers', 'reduceNumberPowers'])
	const powersMergedStep = powersReduced.removeTrivial(['mergeProductFactors'])
	const ans = powersMergedStep.combine()
	return { ...state, variables, expression, powersReducedStep, powersReduced, powersMergedStep, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'powersReduced')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
