import { sample } from '@step-wise/js-utils'
import { c, g, R, e, k, G } from '@step-wise/physics-data'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

const constants = { c, g, R, e, k, G }
type ConstantName = keyof typeof constants
const exampleConstantNames: ConstantName[] = ['c', 'g', 'R']
const constantNames: ConstantName[] = ['c', 'g', 'R', 'e', 'k', 'G']

export default buildSimpleExercise({
	metaData: {
		skill: 'lookUpConstant',
		compare: {
			ans: {
				float: { relativeTolerance: 0.0001 },
			},
		},
	},

	generateState(example) {
		return { constant: sample(example ? exampleConstantNames : constantNames) }
	},

	getSolution({ constant }) {
		return { ans: constants[constant] }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})
