import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateOpenCyclespsp from './calculateOpenCyclespsp'
import calculateOpenCycleNspsp from './calculateOpenCycleNspsp'
import calculateOpenCycleTsp from './calculateOpenCycleTsp'

export default {
	examples: { calculateOpenCyclespsp },
	exercises: { calculateOpenCyclespsp, calculateOpenCycleNspsp, calculateOpenCycleTsp },
} satisfies SkillExercises
