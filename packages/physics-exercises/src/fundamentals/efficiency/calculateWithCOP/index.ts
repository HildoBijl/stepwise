import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithCOPRefrigerator from './calculateWithCOPRefrigerator.ts'
import calculateWithCOPHeatPump from './calculateWithCOPHeatPump.ts'

export default {
	examples: { calculateWithCOPRefrigerator },
	exercises: { calculateWithCOPRefrigerator, calculateWithCOPHeatPump },
} satisfies SkillExerciseBundle
