import { sample, getRandomInteger } from '@step-wise/js-utils'
import { type Equation, asEquation, equationComparisons } from '@step-wise/cas'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables } from '#generationTools'

const availableVariableSets = [
	['a', 'b', 'c'],
	['x', 'y', 'z'],
	['p', 'q', 'r'],
] as const
const usedVariables = ['x', 'y', 'z']

export default buildSimpleExercise({
	metaData: {
		skill: 'enterEquation',
		compare: { ans: (input: Equation, correct: Equation) => !equationComparisons.exactEqual(input, correct.switch()) && equationComparisons.equivalent(input, correct.switch()) },
	},

	generateState() {
		const variableSet = sample(availableVariableSets)
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			equation: sample([
				asEquation(`x^${getRandomInteger(2, 4)}+y^${getRandomInteger(2, 4)}=z^${getRandomInteger(2, 4)}`),
				asEquation(`(${getRandomInteger(-12, 12, [0, 1])}x+${getRandomInteger(-12, 12, [0, 1])}y)/(${getRandomInteger(-12, 12, [0])}z)=1`),
				asEquation(`x^y-${getRandomInteger(1, 8)}=z`),
				asEquation(`(x+${getRandomInteger(-12, 12, [0])})(y+${getRandomInteger(-12, 12, [0])})(z+${getRandomInteger(-12, 12, [0])})=1`),
			]).combine().substitute(variables),
		}
	},

	getSolution({ equation }) {
		return { ans: equation.switch() }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
