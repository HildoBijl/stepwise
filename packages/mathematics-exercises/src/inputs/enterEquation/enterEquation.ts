import { sample, randomInteger } from '@step-wise/js-utils'
import { type Equation, asEquation, equationComparisons } from '@step-wise/cas'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables } from '#generationTools'

const availableVariableSets = [
	['a', 'b', 'c'],
	['x', 'y', 'z'],
	['p', 'q', 'r'],
] as const
const usedVariables = ['x', 'y', 'z']

export default buildMonoExercise({
	metadata: {
		skill: 'enterEquation',
		compare: { ans: (input: Equation, correct: Equation) => !equationComparisons.exactEqual(input, correct.switch()) && equationComparisons.equivalent(input, correct.switch()) },
	},

	generateParameters() {
		const variableSet = sample(availableVariableSets)
		const variables = selectRandomVariables(variableSet, usedVariables)
		return {
			equation: sample([
				asEquation(`x^${randomInteger(2, 4)}+y^${randomInteger(2, 4)}=z^${randomInteger(2, 4)}`),
				asEquation(`(${randomInteger(-12, 12, { exclude: [0, 1] })}x+${randomInteger(-12, 12, { exclude: [0, 1] })}y)/(${randomInteger(-12, 12, { exclude: [0] })}z)=1`),
				asEquation(`x^y-${randomInteger(1, 8)}=z`),
				asEquation(`(x+${randomInteger(-12, 12, { exclude: [0] })})(y+${randomInteger(-12, 12, { exclude: [0] })})(z+${randomInteger(-12, 12, { exclude: [0] })})=1`),
			]).combine().substitute(variables),
		}
	},

	getSolution({ equation }) {
		return { ans: equation.switch() }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})
