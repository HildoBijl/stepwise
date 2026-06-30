const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons, expressionChecks } = require('@step-wise/cas')

const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasSumWithinProduct } = expressionChecks

// Multiply a*x+b+c/x+d/x^2=0 by ex^n.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd', 'e', 'n']

const metaData = {
	skill: 'multiplyAllEquationTerms',
	steps: ['multiplyBothEquationSides', 'expandBrackets', 'simplifyFractionWithVariables'],
	comparison: {
		form: { compareSide: equivalent },
		expanded: { compareSide: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct) },
		ans: { compareSide: onlyOrderChanges },
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	return {
		x: sample(variableSet),
		a: getRandomInteger(-8, 8, [-1, 0, 1]),
		b: getRandomInteger(-8, 8, [0]),
		c: getRandomInteger(-8, 8, [-1, 0, 1]),
		d: example ? 0 : getRandomInteger(-8, 8, [0]),
		e: getRandomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
		n: example ? 1 : getRandomInteger(1, 3),
		aLeft: example ? true : getRandomBoolean(),
		bLeft: getRandomBoolean(),
		cLeft: getRandomBoolean(),
		dLeft: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Assemble the equation.
	const variables = filterVariables(state, usedVariables, constants)
	const terms = ['a*x', 'b', 'c/x', 'd/x^2'].map(term => asExpression(term).substitute(variables))
	let left = asExpression(0)
	let right = asExpression(0)
	terms.forEach((term, index) => {
		if (state[`${constants[index]}Left`])
			left = left.add(term)
		else
			right = right.add(term)
	})
	const equation = asEquation({ left, right }).removeTrivial()
	const factor = asExpression('e*x^n', { eAsConstant: false }).substitute(variables).removeTrivial()

	// Manipulate the equation.
	const form = equation.multiplyLeft(factor).flatten()
	const expandedIntermediate = form.removeTrivial(['expandProductsOfSums', 'expandMinusSums'])
	const expanded = expandedIntermediate.cancel(['expandProductsOfSums', 'mergeFractionProducts', 'mergeProductFactors'])
	const ans = expanded.combine()
	return { ...state, variables, equation, factor, form, expandedIntermediate, expanded, ans }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'form')
		case 2:
			return performComparison(exerciseData, 'expanded')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
