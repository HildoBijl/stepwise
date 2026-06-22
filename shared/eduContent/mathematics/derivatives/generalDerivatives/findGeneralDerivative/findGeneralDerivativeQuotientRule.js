const { pickKeys, sample, getRandomInteger } = require('@step-wise/utils')
const { expressionComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const { equivalent, constantMultiple } = expressionComparisons

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findGeneralDerivative',
	setup: 'applyQuotientRule',
	steps: [null, null, 'applyQuotientRule'],
	weight: 2,
	comparison: { method: {}, default: equivalent },
}

function generateState() {
	const x = sample(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, fRaw, g }
}

function getStaticSolution(state) {
	const { c, fRaw, g } = state
	const method = 1
	const f = fRaw.multiplyLeft(c).cancel()
	const h = f.divide(g).flatten()
	const x = h.getVariables()[0]
	return { ...state, method, x, f, h }
}

function checkF(func, solutionFunc) {
	return func && constantMultiple(func, solutionFunc)
}

function checkFAndG(input, solution) {
	return checkF(input.f, solution.f) && checkF(input.g, solution.g) && equivalent(input.f.divide(input.g), solution.h)
}

// The input dependency is the functions f and g when correctly given, and otherwise an empty object.
function getInputDependency(input, solution) {
	const functionsCorrect = checkFAndG(input, solution)
	return functionsCorrect ? { ...pickKeys(input, ['f', 'g']), adjusted: true } : {}
}

function getDynamicSolution(inputDependency, solution) {
	const solutionMerged = { ...solution, ...inputDependency }
	const { f, g } = solutionMerged
	const fDerivative = f.getDerivative().combine()
	const gDerivative = g.getDerivative().combine()
	const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
	const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
	return { ...solutionMerged, fDerivative, gDerivative, derivativeRaw, derivative }
}

const getSolution = { dependentFields: ['f', 'g'], getStaticSolution, getInputDependency, getDynamicSolution }

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'method')
		case 2:
			return checkFAndG(exerciseData.input, exerciseData.solution)
		default:
			return performComparison(exerciseData, 'derivative')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
	checkF,
	checkFAndG,
}
