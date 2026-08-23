import { sample } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { gasProperties } from '@step-wise/physics-data'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildMonoExercise({
	metadata: {
		skill: 'specificHeats',
		comparisons: {
			FloatUnit: { float: { relativeTolerance: 0.02 } },
		},
	},

	generateParameters() {
		return { medium: sample(media) }
	},

	getSolution({ medium }) {
		return gasProperties[medium]
	},

	checkInput(data) {
		return compareInputs(['cv', 'cp'], data)
	},
})
