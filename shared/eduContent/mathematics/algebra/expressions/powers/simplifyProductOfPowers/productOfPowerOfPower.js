const { selectRandomly, getRandomInteger } = require('../../../../../../util')
const { asExpression, expressionComparisons, expressionChecks } = require('../../../../../../CAS')
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
	const a = getRandomInteger(example ? -8 : 2, 8, [-1, 0, 1])
	return {
		x: selectRandomly(variableSet),
		a,
		b: getRandomInteger(2, 6),
		c: getRandomInteger(2, 5),
		d: getRandomInteger(2, 5),
	}
}

function getSolution(state) {
	const variables = filterVariables(state, usedVariables, constants)
	const expression = asExpression('a*x^b(x^c)^d').substituteVariables(variables)
	const powersReducedStep = expression.simplify({ removePowersWithinPowers: true })
	const powersReduced = powersReducedStep.simplify({ mergeProductNumbers: true, mergePowerNumbers: true })
	const powersMergedStep = powersReduced.simplify({ mergeProductFactors: true })
	const ans = powersMergedStep.regularClean()
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
