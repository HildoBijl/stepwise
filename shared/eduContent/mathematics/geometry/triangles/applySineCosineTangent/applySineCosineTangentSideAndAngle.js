const { sample, randomNumber, randomBoolean, randomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, expressionComparisons, equationComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const variableSet = ['x', 'y', 'z']

const metaData = {
	skill: 'applySineCosineTangent',
	steps: [null, null, null],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct),
	},
}

function generateState() {
	// Determine what is known and what is requested.
	const known = randomInteger(0, 2) // Is a, b or c known?
	const requested = randomInteger(0, 2, [known]) // Is a, b or c requested?

	// Gather all data into a state.
	return {
		known,
		x: asExpression(randomInteger(2, known === 2 ? 12 : 10)),
		beta: asExpression(randomInteger(5, 13) * 5),
		requested,
		y: asExpression(sample(variableSet)),
		rotation: randomNumber(0, 2 * Math.PI),
		reflection: randomBoolean(),
	}
}

function getSolution(state) {
	// Determine which case we are dealing with.
	let { x, known, beta, y, requested } = state
	const variables = {
		[['a', 'b', 'c'][known]]: x,
		[['a', 'b', 'c'][requested]]: y,
		'β': beta,
	}

	// Determine the rule to apply.
	const rule = 3 - (known + requested) // 0 for sine, 1 for cosine, 2 for tangent.
	const equation = asEquation(['sin(β)=b/c', 'cos(β)=a/c', 'tan(β)=b/a'][rule], undefined, { degrees: true }).substitute(variables)

	// Depending on what is known, determine a, b and c.
	let a, b, c
	if (known === 0) {
		a = x
		b = asExpression('a*tan(β)', undefined, { degrees: true }).substitute(variables)
		c = asExpression('a/cos(β)', undefined, { degrees: true }).substitute(variables)
	} else if (known === 1) {
		a = asExpression('b/tan(β)', undefined, { degrees: true }).substitute(variables)
		b = x
		c = asExpression('b/sin(β)', undefined, { degrees: true }).substitute(variables)
	} else {
		a = asExpression('c*cos(β)', undefined, { degrees: true }).substitute(variables)
		b = asExpression('c*sin(β)', undefined, { degrees: true }).substitute(variables)
		c = x
	}

	// Determine the solution.
	const ansRaw = [a, b, c][requested]
	const ans = ansRaw.combine()
	const canSimplifyAns = !expressionComparisons.exactEqual(ans, ansRaw)

	return { ...state, a, b, c, variables, rule, equation, ansRaw, ans, canSimplifyAns }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'rule')
		case 2:
			return performComparison(exerciseData, 'equation')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
