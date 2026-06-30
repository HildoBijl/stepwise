const { compareNumbers, sample, getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const sideVariableSet = ['x', 'y', 'z']
const angleVariableSet = ['α', 'β', 'γ']

const metaData = {
	steps: ['calculateTriangle', 'calculateTriangle', null],
	comparison: {
		default: {},
		βRaw: (input, correct, { variables, a }) => compareNumbers(...[input, correct].map(value => value.substitute(variables.a, a).number)), // Plug in the value of a and compare numbers. This is the easiest way to allow for alternate solutions.
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const b = getRandomInteger(3, 12)
	return {
		α: asExpression(getRandomInteger(5, 24, [18]) * 5), // Ensure there is no 90 degree angle.
		β: asExpression(sample(angleVariableSet)),
		a: asExpression(sample(sideVariableSet)),
		b: asExpression(b),
		c: asExpression(getRandomInteger(3, 12, [b])), // Don't have a triangle with two equal sides; that's too easy.
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, β, a, b, c } = state
	const variables = { α, β, a, b, c }

	// Determine a through the cosine rule.
	const numSolutions = 1
	const equation1Raw = asEquation('a^2 = b^2 + c^2 - 2*b*c*cos(α)', undefined, { degrees: true }).substitute(variables)
	const equation1 = equation1Raw.combine()
	const aRaw = equation1.right.sqrt()
	a = aRaw.combine()

	// Determine beta through the cosine rule.
	const equation2Raw = asEquation('b^2 = c^2 + a^2 - 2*c*a*cos(β)', undefined, { degrees: true }).substitute(variables)
	const equation2 = equation2Raw.combine()
	const intermediateEquation = asEquation('cos(β) = (c^2 + a^2 - b^2)/(2*c*a)', undefined, { degrees: true }).substitute(variables).combine()
	const βRaw = intermediateEquation.right.arccos()
	β = asExpression('acos((c-b*cos(α))/a)', undefined, { degrees: true }).substitute({ ...variables, a }).combine()

	return { ...state, variables, numSolutions, equation1Raw, equation1, aRaw, a, equation2Raw, equation2, intermediateEquation, βRaw, β }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['numSolutions', 'a'])
		case 2:
			return performComparison(exerciseData, 'βRaw')
		case 3:
			return performComparison(exerciseData, 'β')
		default:
			return performComparison(exerciseData, ['numSolutions', 'β'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
