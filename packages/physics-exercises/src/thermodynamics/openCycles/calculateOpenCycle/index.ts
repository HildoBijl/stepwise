import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateOpenCyclespsp from './calculateOpenCyclespsp.ts'
import calculateOpenCycleNspsp from './calculateOpenCycleNspsp.ts'
import calculateOpenCycleTsp from './calculateOpenCycleTsp.ts'

export default {
	examples: { calculateOpenCyclespsp },
	exercises: { calculateOpenCyclespsp, calculateOpenCycleNspsp, calculateOpenCycleTsp },
} satisfies SkillExerciseBundle
