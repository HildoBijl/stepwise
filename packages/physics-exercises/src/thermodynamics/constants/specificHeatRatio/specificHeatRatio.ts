import { sample } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { gasProperties } from '@step-wise/physics-data'

import { buildMonoExercise } from '#physicsExerciseBuilding'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildMonoExercise({
	metadata: {
		skill: 'specificHeatRatio',
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.015 } },
		},
	},

	generateParameters() {
		return { medium: sample(media) }
	},

	getSolution({ medium }) {
		return { k: gasProperties[medium].k }
	},

	checkInput(data) {
		return compareInputs('k', data)
	},
})
