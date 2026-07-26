import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateClosedCycleVTp from './calculateClosedCycleVTp'
import calculateClosedCycleTsV from './calculateClosedCycleTsV'
import calculateClosedCycleSTST from './calculateClosedCycleSTST'
import calculateClosedCycleSVSV from './calculateClosedCycleSVSV'

export default {
	examples: { calculateClosedCycleVTp },
	exercises: { calculateClosedCycleVTp, calculateClosedCycleTsV, calculateClosedCycleSTST, calculateClosedCycleSVSV },
} satisfies SkillExercises
