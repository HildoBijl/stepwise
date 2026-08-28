import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateClosedCycleVTp from './calculateClosedCycleVTp.ts'
import calculateClosedCycleTsV from './calculateClosedCycleTsV.ts'
import calculateClosedCycleSTST from './calculateClosedCycleSTST.ts'
import calculateClosedCycleSVSV from './calculateClosedCycleSVSV.ts'

export default {
	examples: { calculateClosedCycleVTp },
	exercises: { calculateClosedCycleVTp, calculateClosedCycleTsV, calculateClosedCycleSTST, calculateClosedCycleSVSV },
} satisfies SkillExerciseBundle
