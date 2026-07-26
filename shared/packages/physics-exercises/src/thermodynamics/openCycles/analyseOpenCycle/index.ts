import { type SkillExercises } from '@step-wise/exercise-definition'

import analyseOpenCyclespsp from './analyseOpenCyclespsp'
import analyseOpenCycleNspsp from './analyseOpenCycleNspsp'
import analyseOpenCycleTsp from './analyseOpenCycleTsp'

export default {
	examples: { analyseOpenCyclespsp },
	exercises: { analyseOpenCyclespsp, analyseOpenCycleNspsp, analyseOpenCycleTsp },
} satisfies SkillExercises
