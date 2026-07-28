import { type SkillExercises } from '@step-wise/exercise-bundling'

import linearInterpolationPopulation from './linearInterpolationPopulation'
import linearInterpolationKettle from './linearInterpolationKettle'
import linearInterpolationChild from './linearInterpolationChild'

export default {
	examples: { linearInterpolationPopulation },
	exercises: { linearInterpolationPopulation, linearInterpolationKettle, linearInterpolationChild },
} satisfies SkillExercises
