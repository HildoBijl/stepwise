import { sample, getRandomInteger } from '@step-wise/utils'
import { type Expression, asExpression, expressionComparisons } from '@step-wise/cas'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables } from '../../generationTools'

const availableVariableSets = [
	['a', 'b', 'c'],
	['x', 'y', 'z'],
	['p', 'q', 'r'],
] as const
const usedVariables = ['x', 'y']

export default buildSimpleExercise({
	metaData: {
		skill: 'enterExpression',
		compare: { ans: (input: Expression, correct: Expression) => expressionComparisons.exactEqual(input.flatten(), correct.flatten()) },
	},

	generateState() {
		const variableSet = sample(availableVariableSets)
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			expression: sample([
				asExpression(`(${getRandomInteger(-12, 12, [0])}-x)/(y+${getRandomInteger(-12, 12, [0])})`),
				asExpression(`${getRandomInteger(-12, 12, [0])}${variables.x}_${getRandomInteger(1, 3)}^${getRandomInteger(2, 4)} + ${getRandomInteger(-12, 12, [0])}${variables.y}_${getRandomInteger(2, 4)}^${getRandomInteger(1, 3)}`),
				asExpression(`${getRandomInteger(-12, 12, [0])}*hat(${variables.x})_${getRandomInteger(1, 3)} + ${getRandomInteger(-12, 12, [0])}*dot(${variables.y})^${getRandomInteger(2, 4)}`),
				asExpression(`(${getRandomInteger(-12, 12, [0])}-x)^(y/${getRandomInteger(2, 6)})`),
				asExpression(`${sample(['sin', 'cos', 'tan'])}(${getRandomInteger(-4, 4, [0, 1])}*${sample(['asin', 'acos', 'atan'])}(x/y))`),
				asExpression(`root[x](${getRandomInteger(-12, 12, [0])}+y)`),
				asExpression(`log[x](${getRandomInteger(-12, 12, [0])}y)`),
			]).combine().substitute(variables),
		}
	},

	getSolution({ expression }) {
		return { ans: expression }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
