const { selectRandomly, getRandomInteger, getRandomBoolean } = require('../../../../../../../util')
const { asExpression, asEquation, expressionComparisons } = require('../../../../../../../CAS')

const { getStepExerciseProcessor, filterVariables, performComparison } = require('../../../../../../../eduTools')

const { onlyOrderChanges, equivalent } = expressionComparisons

// ax^2 + bx + c = 0.
const variableSet = ['x', 'y', 'z']
const usedVariables = 'x'
const constants = ['a', 'b', 'c']

const metaData = {
	skill: 'moveEquationTerm',
	steps: ['addTermToBothEquationSides', 'cancelSumTerms'],
	comparison: {
		bothSidesChanged: { check: equivalent },
		ans: { check: onlyOrderChanges },
	}
}

function generateState(example) {
	const a = getRandomInteger(-8, 8, [0])
	const b = getRandomInteger(-8, 8, [0, a, -a])
	const c = getRandomInteger(-8, 8, [0, a, -a, b, -b])
	return {
		x: selectRandomly(variableSet),
		a, b, c,
		switchSides: [getRandomBoolean(), getRandomBoolean(), getRandomBoolean()], // Does a term start on the other side of the equation?
		toMove: example ? 1 : getRandomInteger(0, 2),
	}
}

function getSolution(state) {
	// Set up the equation.
	const variables = filterVariables(state, usedVariables, constants)
	const terms = ['a*x^2', 'b*x', 'c'].map(term => asExpression(term).substituteVariables(variables).removeUseless())
	let equation = asEquation('0 = 0')
	terms.forEach((term, index) => equation = equation[state.switchSides[index] ? 'applyToRight' : 'applyToLeft'](side => side.add(term)))
	equation = equation.removeUseless()

	// Find the term to move, add/subtract it and simplify.
	const termIsLeft = !state.switchSides[state.toMove]
	const positive = !terms[state.toMove].isNegative()
	const termToMove = terms[state.toMove].abs()
	const bothSidesChanged = equation[positive ? 'subtract' : 'add'](termToMove)
	const ans = bothSidesChanged.basicClean()

	// Also set up possibly wrong answers.
	const ansWithWrongSignUsed = ans[termIsLeft ? 'applyToRight' : 'applyToLeft'](side => side[positive ? 'add' : 'subtract'](termToMove.multiply(2))).regularClean()
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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
