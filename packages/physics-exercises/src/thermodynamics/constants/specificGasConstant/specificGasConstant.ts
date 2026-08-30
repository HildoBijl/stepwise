import { sample } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { gasProperties } from '@step-wise/physics-data'

import { buildMonoExercise } from '#physicsExerciseBuilding'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildMonoExercise({
	metadata: {
		skill: 'specificGasConstant',
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.015 } },
		},
	},

	generateParameters() {
		return { medium: sample(media) }
	},

	getSolution({ medium }) {
		return { Rs: gasProperties[medium].Rs }
	},

	checkInput(data) {
		return compareInputs('Rs', data)
	},
})
