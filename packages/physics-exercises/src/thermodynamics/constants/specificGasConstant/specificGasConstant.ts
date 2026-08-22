import { sample } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { gasProperties } from '@step-wise/physics-data'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildMonoExercise({
	metadata: {
		skill: 'specificGasConstant',
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.015 } },
		},
	},

	generateParameters() {
		return { medium: sample(media) }
	},

	getSolution({ medium }) {
		return { Rs: gasProperties[medium].Rs }
	},

	checkInput(data) {
		return compare('Rs', data)
	},
})
