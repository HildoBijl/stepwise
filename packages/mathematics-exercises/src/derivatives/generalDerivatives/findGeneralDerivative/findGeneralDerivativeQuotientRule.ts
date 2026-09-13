import { pickKeys, sample, randomInteger } from '@step-wise/js-utils'
import { type Expression, expressionComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'

import { getRandomElementaryFunctions } from '../../tools/index.ts'

const { areEquivalent, areConstantMultiples } = expressionComparisons

const variableSet = ['x', 'y', 't']

type DerivativeInputDependency = { f?: Expression, g?: Expression, adjusted?: boolean }

function checkF(func: Expression | undefined, solutionFunc: Expression): boolean {
	return !!func && areConstantMultiples(func, solutionFunc)
}

function checkFAndG(input: { f?: Expression, g?: Expression }, solution: { f?: Expression, g?: Expression, h?: Expression }): boolean {
	return !!input.f && !!input.g && !!solution.f && !!solution.g && !!solution.h && checkF(input.f, solution.f) && checkF(input.g, solution.g) && areEquivalent(input.f.divide(input.g), solution.h)
}

export default buildStepExercise({
	metadata: {
		skill: 'findGeneralDerivative',
		...createStepExerciseMetadata([undefined, undefined, 'applyQuotientRule']),
		weight: 2,
		comparisons: { Expression: areEquivalent, checkF, checkFAndG },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [fRaw, g] = getRandomElementaryFunctions(2, false, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { c, fRaw, g }
	},

	getStaticSolution(parameters) {
		const { c, fRaw, g } = parameters
		const method = 1
		const f = fRaw.multiplyLeft(c).cancel()
		const h = f.divide(g).flatten()
		const x = h.collectVariables()[0]
		return { ...parameters, method, x, f, h }
	},

	// The input dependency is the functions f and g when correctly given, and otherwise an empty object.
	updateInputDependency({ previousInputDependency, staticSolution, input }): DerivativeInputDependency | undefined {
		if (input.f === undefined && input.g === undefined) return previousInputDependency
		const selectedInput = pickKeys(input, ['f', 'g']) as { f?: Expression, g?: Expression }
		return checkFAndG(selectedInput, staticSolution) ? { f: selectedInput.f, g: selectedInput.g, adjusted: true } : {}
	},

	getSolution(_, inputDependency, staticSolution) {
		const adjustedSolution = inputDependency ?? {}
		const f = adjustedSolution.f ?? staticSolution.f
		const g = adjustedSolution.g ?? staticSolution.g
		if (!f || !g) throw new Error('Expected the quotient-rule solution to contain functions f and g.')
		const fDerivative = f.differentiate().combine()
		const gDerivative = g.differentiate().combine()
		const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
		const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
		return { ...adjustedSolution, f, g, fDerivative, gDerivative, derivativeRaw, derivative }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('method', data)
			case 2: return checkFAndG(data.input, data.solution!)
			default: return compareInputs('derivative', data)
		}
	},
})
