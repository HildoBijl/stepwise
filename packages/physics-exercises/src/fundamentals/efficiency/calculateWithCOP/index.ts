import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithCOPRefrigerator from './calculateWithCOPRefrigerator'
import calculateWithCOPHeatPump from './calculateWithCOPHeatPump'

export default {
	examples: { calculateWithCOPRefrigerator },
	exercises: { calculateWithCOPRefrigerator, calculateWithCOPHeatPump },
} satisfies SkillExerciseBundle
