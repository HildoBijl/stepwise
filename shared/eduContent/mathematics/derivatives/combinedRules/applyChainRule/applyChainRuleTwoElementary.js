const { selectRandomly, getRandomInteger } = require('../../../../../util')
const { expressionComparisons } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getRandomElementaryFunctions }  = require('../..')

const { equivalent } = expressionComparisons

const variableSet = ['x', 'y', 't']

const data = {
	skill: 'applyChainRule',
	steps: [['lookUpElementaryDerivative', 'lookUpElementaryDerivative'], null],
	weight: 2,
	comparison: { default: equivalent },
}
addSetupFromSteps(data)

function generateState() {
	const x = selectRandomly(variableSet)
	const [fRaw, g] = getRandomElementaryFunctions(2, false, false, false).map(func => func.substitute('x', x))
	const c = getRandomInteger(-12, 12, [0])
	const f = fRaw.multiply(c, true).basicClean()
	return { f, g }
}

function getSolution(state) {
	const { f, g } = state
	const x = f.getVariables()[0]
	const h = f.substitute(x, g).removeUseless()
	const fDerivative = f.getDerivative().regularCleanDisplay()
	const gDerivative = g.getDerivative().regularCleanDisplay()
	const derivative = fDerivative.substitute(x, g).multiply(gDerivative).elementaryClean()
	const derivativeSimplified = derivative.advancedCleanDisplay({ expandPowersOfSums: false })
	return { ...state, x, h, fDerivative, gDerivative, derivative, derivativeSimplified }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(['fDerivative'], input, solution, data.comparison)
				case 2:
					return performComparison(['gDerivative'], input, solution, data.comparison)
			}
		default:
			return performComparison('derivative', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}
