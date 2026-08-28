import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseClosedCycleVTp from './analyseClosedCycleVTp.ts'
import analyseClosedCycleTsV from './analyseClosedCycleTsV.ts'
import analyseClosedCycleSTST from './analyseClosedCycleSTST.ts'
import analyseClosedCycleSVSV from './analyseClosedCycleSVSV.ts'

export default {
	examples: { analyseClosedCycleVTp },
	exercises: { analyseClosedCycleVTp, analyseClosedCycleTsV, analyseClosedCycleSTST, analyseClosedCycleSVSV },
} satisfies SkillExerciseBundle
