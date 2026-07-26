import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateWithCOPRefrigerator from './calculateWithCOPRefrigerator'
import calculateWithCOPHeatPump from './calculateWithCOPHeatPump'

export default {
	examples: { calculateWithCOPRefrigerator },
	exercises: { calculateWithCOPRefrigerator, calculateWithCOPHeatPump },
} satisfies SkillExercises
