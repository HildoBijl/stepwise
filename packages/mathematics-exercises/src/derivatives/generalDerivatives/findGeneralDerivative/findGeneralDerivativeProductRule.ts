import { pickKeys, sample, randomInteger } from '@step-wise/js-utils'
import { type Expression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const { areEquivalent, areConstantMultiples } = expressionComparisons

const variableSet = ['x', 'y', 't']

function checkF(func: Expression | undefined, solution: { f: Expression, g: Expression }): boolean {
	return !!func && (areConstantMultiples(func, solution.f) || areConstantMultiples(func, solution.g))
}

function checkFAndG(input: { f?: Expression, g?: Expression }, solution: { f?: Expression, g?: Expression, h?: Expression }): boolean {
	return !!input.f && !!input.g && !!solution.f && !!solution.g && !!solution.h && checkF(input.f, { f: solution.f, g: solution.g }) && checkF(input.g, { f: solution.f, g: solution.g }) && areEquivalent(input.f.multiply(input.g), solution.h)
}

export default buildStepExercise({
	metadata: {
		skill: 'findGeneralDerivative',
		...createStepExerciseMetadata([undefined, undefined, 'applyProductRule']),
		weight: 3,
		comparisons: { method: {}, Expression: areEquivalent, checkF, checkFAndG },
	},

	generateParameters() {
		const x = sample(variableSet)
		const [fRaw, g] = getRandomElementaryFunctions(2, false, false).map(func => func.substitute('x', x))
		const c = randomInteger(-12, 12, { exclude: [0] })
		return { c, fRaw, g }
	},

	getSolution: {
		dependentFields: ['f', 'g'],

		getStaticSolution(parameters) {
			const { c, fRaw, g } = parameters
			const method = 0
			const f = fRaw.multiplyLeft(c).cancel()
			const h = f.multiply(g).flatten()
			const x = h.collectVariables()[0]
			return { ...parameters, method, x, f, h }
		},

		// The input dependency is the functions f and g when correctly given, and otherwise an empty object.
		getInputDependency(input, solution) {
			const selectedInput = pickKeys(input, ['f', 'g']) as { f?: Expression, g?: Expression }
			const functionsCorrect = checkFAndG(selectedInput, solution)
			return functionsCorrect ? { f: selectedInput.f, g: selectedInput.g, adjusted: true } : {}
		},

		getDynamicSolution(inputDependency, solution) {
			const solutionMerged = { ...solution, ...(inputDependency as { f?: Expression, g?: Expression, adjusted?: boolean }) }
			const { f, g } = solutionMerged
			if (!f || !g) throw new Error('Expected the product-rule solution to contain functions f and g.')
			const fDerivative = f.differentiate().combine()
			const gDerivative = g.differentiate().combine()
			const derivativeRaw = fDerivative.multiply(g).add(f.multiply(gDerivative))
			const derivative = derivativeRaw.normalize([], ['cancelPolynomialFactors', 'expandPowersOfSums']).format()
			return { ...solutionMerged, fDerivative, gDerivative, derivativeRaw, derivative }
		},
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('method', data)
			case 2: return checkFAndG(data.input, data.solution!)
			default: return compareInputs('derivative', data)
		}
	},
})
