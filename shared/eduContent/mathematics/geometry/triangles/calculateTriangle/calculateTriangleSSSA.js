const { sample, getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { and } = require('@step-wise/skill-setup')
const { asExpression, asEquation, equationComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const variableSet = ['α', 'β', 'γ']

const metaData = {
	skill: 'calculateTriangle',
	...stepsToSetup([undefined, undefined, undefined, and('solveLinearEquation', 'applySineCosineTangent')]),
	compare: {
		equation: (input, correct) => equationComparisons.equivalent(input, correct),
	},
}

function generateState() {
	// Determine sides and check the triangle inequality.
	const a = getRandomInteger(2, 12)
	const b = getRandomInteger(2, 12)
	const c = getRandomInteger(2, 12)
	if (a + b <= c || a + c <= b || b + c <= a)
		return generateState()

	// Assemble the state.
	return {
		α: asExpression(sample(variableSet)),
		a: asExpression(a),
		b: asExpression(b),
		c: asExpression(c),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, a, b, c } = state
	const variables = { α, a, b, c }

	// Define solution method data.
	const rule = 1 // Use the cosine rule.
	const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*b*c*cos(α)', undefined, { degrees: true }).substitute(variables)
	const equation = equationRaw.combine()
	const numSolutions = 1

	// Determine the remaining side a.
	const intermediateEquation = asEquation('cos(α) = (b^2 + c^2 - a^2)/(2*b*c)', undefined, { degrees: true }).substitute(variables).combine()
	α = intermediateEquation.right.arccos()

	return { ...state, variables, rule, equationRaw, equation, numSolutions, intermediateEquation, α }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('rule', data)
		case 2:
			return compare('equation', data)
		case 3:
			return compare('numSolutions', data)
		case 4:
			return compare('α', data)
		default:
			return compare(['numSolutions', 'α'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
