import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateMissedWorkIsotherm from './calculateMissedWorkIsotherm.ts'
import calculateMissedWorkPiston from './calculateMissedWorkPiston.ts'
import calculateMissedWorkCompressor from './calculateMissedWorkCompressor.ts'

export default {
	examples: { calculateMissedWorkIsotherm },
	exercises: { calculateMissedWorkIsotherm, calculateMissedWorkPiston, calculateMissedWorkCompressor },
} satisfies SkillExerciseBundle
