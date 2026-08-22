import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseClosedCycleVTp from './analyseClosedCycleVTp'
import analyseClosedCycleTsV from './analyseClosedCycleTsV'
import analyseClosedCycleSTST from './analyseClosedCycleSTST'
import analyseClosedCycleSVSV from './analyseClosedCycleSVSV'

export default {
	examples: { analyseClosedCycleVTp },
	exercises: { analyseClosedCycleVTp, analyseClosedCycleTsV, analyseClosedCycleSTST, analyseClosedCycleSVSV },
} satisfies SkillExerciseBundle
