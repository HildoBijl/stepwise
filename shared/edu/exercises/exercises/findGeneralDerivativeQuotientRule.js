const { filterProperties } = require('../../../util/objects')
const { selectRandomly, getRandomInteger } = require('../../../util/random')
const { expressionComparisons } = require('../../../CAS')

const { getStepExerciseProcessor, assembleSolution } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent, constantMultiple } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'findGeneralDerivative',
	setup: 'applyQuotientRule',
	steps: [null, null, 'applyQuotientRule'],
	weight: 2,
	comparison: { default: equivalent },
}

function generateState() {
	const x = selectRandomly(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	return { c, fRaw, g }
}

function getStaticSolution(state) {
	const { c, fRaw, g } = state
	const method = 1
	const f = fRaw.multiply(c, true).basicClean()
	const h = f.divide(g).elementaryClean()
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
	return functionsCorrect ? { ...filterProperties(input, ['f', 'g']), adjusted: true } : {}
}

function getDynamicSolution(inputDependency, solution) {
	const solutionMerged = { ...solution, ...inputDependency }
	const { f, g } = solutionMerged
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivative = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
	const derivativeSimplified = derivative.advancedCleanDisplay()
	return { ...solutionMerged, fDerivative, gDerivative, derivative, derivativeSimplified }
}

const dependencyData = { dependentFields: ['f', 'g'], getStaticSolution, getInputDependency, getDynamicSolution }

function checkInput(state, input, step) {
	const solution = assembleSolution(dependencyData, state, input)
	switch (step) {
		case 1:
			return input.method === solution.method
		case 2:
			return checkFAndG(input, solution)
		default:
			return performComparison('derivative', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	checkF,
	checkFAndG,
	...dependencyData,
}
