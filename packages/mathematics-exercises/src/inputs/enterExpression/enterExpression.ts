import { sample, randomInteger } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables } from '#generationTools'

const availableVariableSets = [
	['a', 'b', 'c'],
	['x', 'y', 'z'],
	['p', 'q', 'r'],
] as const
const usedVariables = ['x', 'y']

export default buildMonoExercise({
	metadata: {
		skill: 'enterExpression',
		comparisons: { ans: (input: Expression, correct: Expression) => expressionComparisons.areExactlyEqual(input.flatten(), correct.flatten()) },
	},

	generateParameters() {
		const variableSet = sample(availableVariableSets)
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			expression: sample([
				asExpression(`(${randomInteger(-12, 12, { exclude: [0] })}-x)/(y+${randomInteger(-12, 12, { exclude: [0] })})`),
				asExpression(`${randomInteger(-12, 12, { exclude: [0] })}${variables.x}_${randomInteger(1, 3)}^${randomInteger(2, 4)} + ${randomInteger(-12, 12, { exclude: [0] })}${variables.y}_${randomInteger(2, 4)}^${randomInteger(1, 3)}`),
				asExpression(`${randomInteger(-12, 12, { exclude: [0] })}*hat(${variables.x})_${randomInteger(1, 3)} + ${randomInteger(-12, 12, { exclude: [0] })}*dot(${variables.y})^${randomInteger(2, 4)}`),
				asExpression(`(${randomInteger(-12, 12, { exclude: [0] })}-x)^(y/${randomInteger(2, 6)})`),
				asExpression(`${sample(['sin', 'cos', 'tan'])}(${randomInteger(-4, 4, { exclude: [0, 1] })}*${sample(['asin', 'acos', 'atan'])}(x/y))`),
				asExpression(`root[x](${randomInteger(-12, 12, { exclude: [0] })}+y)`),
				asExpression(`log[x](${randomInteger(-12, 12, { exclude: [0] })}y)`),
			]).combine().substitute(variables),
		}
	},

	getSolution({ expression }) {
		return { ans: expression }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})
