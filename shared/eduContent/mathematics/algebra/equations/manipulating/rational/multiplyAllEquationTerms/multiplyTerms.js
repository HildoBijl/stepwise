const { sample, randomInteger, randomBoolean } = require('../../../../../../../util')
const { asExpression, Equation, Integer, expressionComparisons, expressionChecks } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

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
addSetupFromSteps(metaData)

function generateState(example) {
	return {
		x: sample(variableSet),
		a: randomInteger(-8, 8, [-1, 0, 1]),
		b: randomInteger(-8, 8, [0]),
		c: randomInteger(-8, 8, [-1, 0, 1]),
		d: example ? 0 : randomInteger(-8, 8, [0]),
		e: randomInteger(example ? 2 : -8, 8, [-1, 0, 1]),
		n: example ? 1 : randomInteger(1, 3),
		aLeft: example ? true : randomBoolean(),
		bLeft: randomBoolean(),
		cLeft: randomBoolean(),
		dLeft: randomBoolean(),
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
