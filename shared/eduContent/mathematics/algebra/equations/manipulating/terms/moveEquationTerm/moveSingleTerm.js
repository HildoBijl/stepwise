const { sample, getRandomInteger, getRandomBoolean } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons } = require('@step-wise/cas')

const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// ax^2 + bx + c = 0.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'moveEquationTerm',
	steps: ['addToBothEquationSides', 'cancelSumTerms'],
	comparison: {
		bothSidesChanged: { compareSide: equivalent },
		ans: { compareSide: onlyOrderChanges },
	}
}
addSetupFromSteps(metaData)

function generateState(example) {
	const a = getRandomInteger(-8, 8, [0])
	const b = getRandomInteger(-8, 8, [0, a, -a])
	const c = getRandomInteger(-8, 8, [0, a, -a, b, -b])
	return {
		x: sample(variableSet),
		a, b, c,
		switchSides: [getRandomBoolean(), getRandomBoolean(), getRandomBoolean()], // Does a term start on the other side of the equation?
		toMove: example ? 1 : getRandomInteger(0, 2),
	}
}

function getSolution(state) {
	// Set up the equation.
	const variables = filterVariables(state, usedVariables, constants)
	const terms = ['a*x^2', 'b*x', 'c'].map(term => asExpression(term).substitute(variables).removeTrivial())
	let equation = asEquation('0 = 0')
	terms.forEach((term, index) => equation = equation[state.switchSides[index] ? 'mapRight' : 'mapLeft'](side => side.add(term)))
	equation = equation.removeTrivial()

	// Find the term to move, add/subtract it and simplify.
	const termIsLeft = !state.switchSides[state.toMove]
	const positive = !terms[state.toMove].isMinus()
	const termToMove = terms[state.toMove].abs()
	const bothSidesChanged = equation[positive ? 'subtract' : 'add'](termToMove)
	const ans = bothSidesChanged.cancel()

	// Also set up possibly wrong answers.
	const ansWithWrongSignUsed = ans[termIsLeft ? 'mapRight' : 'mapLeft'](side => side[positive ? 'add' : 'subtract'](termToMove.multiply(2))).combine()
	return { ...state, variables, terms, equation, termIsLeft, positive, termToMove, bothSidesChanged, ans, ansWithWrongSignUsed }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'bothSidesChanged')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
