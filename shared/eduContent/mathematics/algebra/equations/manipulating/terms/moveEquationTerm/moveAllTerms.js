const { sample, randomInteger, randomBoolean, randomIndices } = require('@step-wise/utils')
const { asEquation, expressionComparisons, Equation, Integer } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, addSetupFromSteps, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// ax^3 + bx^2 + cx + d = 0.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c', 'd']

const metaData = {
	skill: 'moveEquationTerm',
	steps: ['addToBothEquationSides', 'cancelSumTerms'],
	comparison: {
		bothSidesChanged: { check: equivalent },
		ans: { check: onlyOrderChanges },
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = randomInteger(-8, 8, [0])
	const b = randomInteger(-8, 8, [0, a, -a])
	const c = randomInteger(-8, 8, [0, a, -a, b, -b])
	const d = randomInteger(-8, 8, [0, a, -a, b, -b, c, -c])
	return {
		x: sample(variableSet),
		a, b, c, d,
		termsLeft: randomIndices(4, 2),
		toLeft: randomBoolean(),
	}
}

function getSolution(state) {
	// Set up the equation.
	const variables = filterVariables(state, usedVariables, constants)
	let equation = asEquation('0=a*x^3+b*x^2+c*x+d').substituteVariables(variables).removeUseless()
	state.termsLeft.forEach(index => {
		equation = equation.subtract(equation.right.terms[index])
	})
	equation = equation.regularClean()

	// Find the term to move, add/subtract it and simplify.
	const sideToMove = equation[state.toLeft ? 'right' : 'left']
	const termsToMove = sideToMove.terms
	const positive = termsToMove.some(term => !term.isNegative())
	const bothSidesChanged = equation.subtract(sideToMove)
	const ans = bothSidesChanged.basicClean()

	// Also set up possibly wrong answers.
	const sidesAdded = equation.left.add(equation.right)
	const ansWithWrongSignUsed = new Equation({ left: state.toLeft ? sidesAdded : Integer.zero, right: state.toLeft ? Integer.zero : sidesAdded }).regularClean()
	return { ...state, variables, equation, sideToMove, termsToMove, positive, bothSidesChanged, ans, ansWithWrongSignUsed }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'bothSidesChanged')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
