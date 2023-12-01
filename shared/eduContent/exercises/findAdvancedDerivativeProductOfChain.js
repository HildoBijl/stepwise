const { selectRandomly } = require('../../util')
const { expressionComparisons } = require('../../CAS')
const { getStepExerciseProcessor, assembleSolution, addSetupFromSteps, performComparison } = require('../../eduTools')

const { getRandomElementaryFunctions } = require('./support/derivatives')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'findAdvancedDerivative',
	steps: [null, null, ['applyChainRule', 'lookUpElementaryDerivative'], null],
	weight: 3,
	comparison: { default: equivalent },
}
addSetupFromSteps(data)

function generateState() {
	const x = selectRandomly(variableSet)
	const [f] = getRandomElementaryFunctions(1, false, false, false).map(func => func.substitute('x', x))
	const [g1, g2] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
	return { f, g1, g2 }
}

function getStaticSolution(state) {
	const { f, g1, g2 } = state
	const method = 0
	const x = f.getVariables()[0]
	const g = g1.substitute(x, g2).elementaryClean()
	const h = f.multiply(g).elementaryClean()
	return { ...state, method, x, f, g, h }
}

// The input dependency is whether or not f and g are switched.
function getInputDependency(input, solution) {
	return !!(input.f && input.g && equivalent(input.f, solution.g) && equivalent(input.g, solution.f))
}

function getDynamicSolution(switched, solution) {
	if (switched)
		solution = { ...solution, f: solution.g, g: solution.f }
	const { f, g } = solution
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivative = fDerivative.multiply(g).add(f.multiply(gDerivative))
	const derivativeSimplified = derivative.advancedCleanDisplay({ expandPowersOfSums: false })
	return { ...solution, switched, fDerivative, gDerivative, derivative, derivativeSimplified }
}

const dependencyData = { dependentFields: ['f', 'g'], getStaticSolution, getInputDependency, getDynamicSolution }

function checkInput(state, input, step, substep) {
	const solution = assembleSolution(dependencyData, state, input)
	switch (step) {
		case 1:
			return input.method === solution.method
		case 2:
			return equivalent(input.f, solution.f) && equivalent(input.g, solution.g) // The solution already has the functions switched if appropriate.
		case 3:
			switch (substep) {
				case 1:
					return performComparison('fDerivative', input, solution, data.comparison)
				case 2:
					return performComparison('gDerivative', input, solution, data.comparison)
			}
		default:
			return performComparison('derivative', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	...dependencyData,
	checkInput,
}
