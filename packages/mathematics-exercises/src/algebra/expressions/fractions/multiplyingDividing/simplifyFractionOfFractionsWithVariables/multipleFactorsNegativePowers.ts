import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionChecks, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { hasNegativeExponent, hasFractionWithinFraction } = expressionChecks
const { equivalent, onlyOrderChanges } = expressionComparisons

// (a*(x+c)^p*(x+d)^q)/(b*(x+d)^r*(x+e)^s*(x+c)^t).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e', 'p', 'q', 'r', 's', 't']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyFractionOfFractionsWithVariables',
		...stepsToSetup(['rewriteNegativePower', 'multiplyDivideFractions', 'simplifyFractionWithVariables']),
		compare: {
			withoutNegativeExponents: (input: Expression, correct: Expression) => !hasNegativeExponent(input) && equivalent(input, correct),
			singleFraction: (input: Expression, correct: Expression) => input.isFraction() && !hasFractionWithinFraction(input) && equivalent(input, correct),
			ans: (input: Expression, correct: Expression) => onlyOrderChanges(input.combine(), input.flatten()) && equivalent(input, correct),
		},
	},

	generateParameters() {
		while (true) {
			const a = randomInteger(-12, 12, { exclude: [-1, 0, 1] })
			const b = randomInteger(-12, 12, { exclude: [-1, 0, 1, a] })
			const c = randomInteger(-4, 4)
			const d = randomInteger(-4, 4, { exclude: [c] })
			const e = randomInteger(-4, 4, { exclude: [c, d] })
			if (c !== 0 && d !== 0 && e !== 0) continue
			const p = randomInteger(-4, 4, { exclude: [0] })
			const q = randomInteger(-4, 4, { exclude: [0] })
			const r = randomInteger(-4, 4, { exclude: [0, q] })
			const s = randomInteger(-4, 4, { exclude: [0] })
			const t = randomInteger(-4, 4, { exclude: [0, p] })
			if (Math.sign(p) === Math.sign(q) && Math.sign(p) === Math.sign(r) && Math.sign(p) === Math.sign(s) && Math.sign(t)) continue
			if (Math.sign(q) !== Math.sign(r) && Math.sign(p) !== Math.sign(t)) continue
			return {
				x: sample(variableSet),
				a, b,
				c, d, e,
				p, q, r, s, t,
				flip: randomBoolean(),
			}
		}
	},

	getSolution(parameters) {
		const variables = filterVariables(parameters, usedVariables, constants)
		const part1 = asExpression('a*(x+c)^p*(x+d)^q', { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
		const part2 = asExpression('b*(x+d)^r*(x+e)^s*(x+c)^t', { eAsConstant: false }).substitute(variables).removeTrivial([], ['mergeFractionMinuses'])
		const expression = (parameters.flip ? part2.divide(part1) : part1.divide(part2)).removeTrivial([], ['mergeFractionMinuses'])
		const part1WithoutNegativeExponents = part1.removeTrivial(['convertNegativePowers'])
		const part2WithoutNegativeExponents = part2.removeTrivial(['convertNegativePowers'])
		const withoutNegativeExponents = expression.removeTrivial(['convertNegativePowers'])
		const singleFraction = withoutNegativeExponents.removeTrivial(['mergeFractionProducts', 'flattenFractions'])
		const inBetween = singleFraction.cancel()
		const ans = expression.combine()
		return { ...parameters, variables, part1, part2, part1WithoutNegativeExponents, part2WithoutNegativeExponents, expression, withoutNegativeExponents, singleFraction, inBetween, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('withoutNegativeExponents', data)
			case 2: return compare('singleFraction', data)
			default: return compare('ans', data)
		}
	},
})
