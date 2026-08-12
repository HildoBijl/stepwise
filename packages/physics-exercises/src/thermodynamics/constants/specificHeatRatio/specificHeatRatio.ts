import { sample } from '@step-wise/utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { gasProperties } from '@step-wise/physics-data'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildSimpleExercise({
	metaData: {
		skill: 'specificHeatRatio',
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.015 } },
		},
	},

	generateState() {
		return { medium: sample(media) }
	},

	getSolution({ medium }) {
		return { k: gasProperties[medium].k }
	},

	checkInput(data) {
		return compare('k', data)
	},
})
