const { selectRandomly, getRandomInteger, getRandomBoolean, getRandomIndices } = require('../../../../../../../util')
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
	const a = getRandomInteger(-8, 8, [0])
	const b = getRandomInteger(-8, 8, [0, a, -a])
	const c = getRandomInteger(-8, 8, [0, a, -a, b, -b])
	const d = getRandomInteger(-8, 8, [0, a, -a, b, -b, c, -c])
	return {
		x: selectRandomly(variableSet),
		a, b, c, d,
		termsLeft: getRandomIndices(4, 2),
		toLeft: getRandomBoolean(),
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
