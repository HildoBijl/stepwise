const { selectRandomly } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions } = require('../../tools')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const metaData = {
	skill: 'findAdvancedDerivative',
	steps: [null, null, ['applyChainRule', 'lookUpElementaryDerivative'], null],
	weight: 3,
	comparison: { method: {}, default: equivalent },
}
addSetupFromSteps(metaData)

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
	const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
	const derivative = derivativeRaw.advancedCleanDisplay({ expandPowersOfSums: false })
	return { ...solution, switched, fDerivative, gDerivative, derivativeRaw, derivative }
}

const getSolution = { dependentFields: ['f', 'g'], getStaticSolution, getInputDependency, getDynamicSolution }

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'method')
		case 2:
			return performComparison(exerciseData, ['f', 'g'])
		case 3:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'fDerivative')
				case 2:
					return performComparison(exerciseData, 'gDerivative')
			}
		default:
			return performComparison(exerciseData, 'derivative')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
