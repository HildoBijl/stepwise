import { type SkillExercises } from '@step-wise/exercise-bundling'

import analyseOpenCyclespsp from './analyseOpenCyclespsp'
import analyseOpenCycleNspsp from './analyseOpenCycleNspsp'
import analyseOpenCycleTsp from './analyseOpenCycleTsp'

export default {
	examples: { analyseOpenCyclespsp },
	exercises: { analyseOpenCyclespsp, analyseOpenCycleNspsp, analyseOpenCycleTsp },
} satisfies SkillExercises
