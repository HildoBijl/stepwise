import { pickKeys, sample, getRandomInteger } from '@step-wise/utils'
import { type Expression, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getRandomElementaryFunctions } from '../../tools'

const { equivalent, constantMultiple } = expressionComparisons

const variableSet = ['x', 'y', 't']

function checkF(func: Expression | undefined, solutionFunc: Expression): boolean {
	return !!func && constantMultiple(func, solutionFunc)
}

function checkFAndG(input: { f?: Expression, g?: Expression }, solution: { f?: Expression, g?: Expression, h?: Expression }): boolean {
	return !!input.f && !!input.g && !!solution.f && !!solution.g && !!solution.h && checkF(input.f, solution.f) && checkF(input.g, solution.g) && equivalent(input.f.divide(input.g), solution.h)
}

export default buildStepExercise({
	metaData: {
		skill: 'findGeneralDerivative',
		...stepsToSetup([undefined, undefined, 'applyQuotientRule']),
		weight: 2,
		compare: { method: {}, Expression: equivalent, checkF, checkFAndG },
	},

	generateState() {
		const x = sample(variableSet)
		const [fRaw, g] = getRandomElementaryFunctions(2, false, false).map(func => func.substitute('x', x))
		const c = getRandomInteger(-12, 12, [0])
		return { c, fRaw, g }
	},

	getSolution: {
		dependentFields: ['f', 'g'],

		getStaticSolution(state) {
			const { c, fRaw, g } = state
			const method = 1
			const f = fRaw.multiplyLeft(c).cancel()
			const h = f.divide(g).flatten()
			const x = h.getVariables()[0]
			return { ...state, method, x, f, h }
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
			if (!f || !g) throw new Error('Expected the quotient-rule solution to contain functions f and g.')
			const fDerivative = f.getDerivative().combine()
			const gDerivative = g.getDerivative().combine()
			const derivativeRaw = fDerivative.multiply(g).subtract(f.multiply(gDerivative)).divide(g.toPower(2))
			const derivative = derivativeRaw.normalize([], ['applyPolynomialCancellation', 'expandPowersOfSums']).format()
			return { ...solutionMerged, fDerivative, gDerivative, derivativeRaw, derivative }
		},
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('method', data)
			case 2: return checkFAndG(data.input, data.solution!)
			default: return compare('derivative', data)
		}
	},
})
