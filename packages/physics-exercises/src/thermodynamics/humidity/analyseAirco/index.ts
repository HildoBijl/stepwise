import { type SkillExercises } from '@step-wise/exercise-bundling'

import analyseAircoBasic from './analyseAircoBasic'
import analyseAircoWaterDischarge from './analyseAircoWaterDischarge'
import analyseAircoPower from './analyseAircoPower'

export default {
	examples: { analyseAircoBasic },
	exercises: { analyseAircoBasic, analyseAircoWaterDischarge, analyseAircoPower },
} satisfies SkillExercises
