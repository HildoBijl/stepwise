import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import linearInterpolationPopulation from './linearInterpolationPopulation.ts'
import linearInterpolationKettle from './linearInterpolationKettle.ts'
import linearInterpolationChild from './linearInterpolationChild.ts'

export default {
	examples: { linearInterpolationPopulation },
	exercises: { linearInterpolationPopulation, linearInterpolationKettle, linearInterpolationChild },
} satisfies SkillExerciseBundle
