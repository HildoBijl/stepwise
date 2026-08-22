import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateMissedWorkIsotherm from './calculateMissedWorkIsotherm'
import calculateMissedWorkPiston from './calculateMissedWorkPiston'
import calculateMissedWorkCompressor from './calculateMissedWorkCompressor'

export default {
	examples: { calculateMissedWorkIsotherm },
	exercises: { calculateMissedWorkIsotherm, calculateMissedWorkPiston, calculateMissedWorkCompressor },
} satisfies SkillExerciseBundle
