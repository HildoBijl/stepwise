const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, Equation, Integer, expressionComparisons, expressionChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

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
		form: { check: equivalent },
		expanded: { check: (input, correct) => !hasSumWithinProduct(input) && equivalent(input, correct) },
		ans: { check: onlyOrderChanges },
	}
}

function generateState(example) {
	return {
		x: selectRandomly(variableSet),
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
	const terms = ['a*x', 'b', 'c/x', 'd/x^2'].map(term => asExpression(term).substituteVariables(variables))
	let left = Integer.zero
	let right = Integer.zero
	terms.forEach((term, index) => {
		if (state[`${constants[index]}Left`])
			left = left.add(term)
		else
			right = right.add(term)
	})
	const equation = new Equation(left, right).removeUseless()
	const factor = asExpression('e*x^n').substituteVariables(variables).removeUseless()

	// Manipulate the equation.
	const form = equation.multiply(factor, true)
	const expandedIntermediate = form.removeUseless({ mergeFractionProducts: false, expandProductsOfSums: true })
	const expanded = expandedIntermediate.basicClean({ expandProductsOfSums: true, mergeFractionProducts: true })
	const ans = expanded.basicClean({ crossOutFractionNumbers: true, crossOutFractionFactors: true })
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
