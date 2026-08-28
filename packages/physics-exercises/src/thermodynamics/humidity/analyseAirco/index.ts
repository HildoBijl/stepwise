import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseAircoBasic from './analyseAircoBasic.ts'
import analyseAircoWaterDischarge from './analyseAircoWaterDischarge.ts'
import analyseAircoPower from './analyseAircoPower.ts'

export default {
	examples: { analyseAircoBasic },
	exercises: { analyseAircoBasic, analyseAircoWaterDischarge, analyseAircoPower },
} satisfies SkillExerciseBundle
