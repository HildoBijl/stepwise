import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseOpenCyclespsp from './analyseOpenCyclespsp.ts'
import analyseOpenCycleNspsp from './analyseOpenCycleNspsp.ts'
import analyseOpenCycleTsp from './analyseOpenCycleTsp.ts'

export default {
	examples: { analyseOpenCyclespsp },
	exercises: { analyseOpenCyclespsp, analyseOpenCycleNspsp, analyseOpenCycleTsp },
} satisfies SkillExerciseBundle
