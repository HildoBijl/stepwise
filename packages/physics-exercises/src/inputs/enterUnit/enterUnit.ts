import { sample } from '@step-wise/js-utils'
import { Unit } from '@step-wise/physics-core'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildMonoExercise } from '#physicsExerciseBuilding'

export default buildMonoExercise({
	metadata: {
		skill: 'enterUnit',
		comparisons: {
			ans: { target: 'unchanged' },
		},
	},

	generateParameters() {
		return {
			unit: sample([
				new Unit('dC'),
				new Unit('mum'),
				new Unit('Ohm'),
				new Unit('kg * m / s^2'),
				new Unit('N / mm^2'),
				new Unit('kJ / kg * K'),
				new Unit('m^3 / kg * s^2'),
			]),
		}
	},

	getSolution({ unit }) {
		return { ans: unit }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})
