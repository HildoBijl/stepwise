import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateMissedWorkIsotherm from './calculateMissedWorkIsotherm'
import calculateMissedWorkPiston from './calculateMissedWorkPiston'
import calculateMissedWorkCompressor from './calculateMissedWorkCompressor'

export default {
	examples: { calculateMissedWorkIsotherm },
	exercises: { calculateMissedWorkIsotherm, calculateMissedWorkPiston, calculateMissedWorkCompressor },
} satisfies SkillExercises
