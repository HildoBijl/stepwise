import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateClosedCycleVTp from './calculateClosedCycleVTp'
import calculateClosedCycleTsV from './calculateClosedCycleTsV'
import calculateClosedCycleSTST from './calculateClosedCycleSTST'
import calculateClosedCycleSVSV from './calculateClosedCycleSVSV'

export default {
	examples: { calculateClosedCycleVTp },
	exercises: { calculateClosedCycleVTp, calculateClosedCycleTsV, calculateClosedCycleSTST, calculateClosedCycleSVSV },
} satisfies SkillExerciseBundle
