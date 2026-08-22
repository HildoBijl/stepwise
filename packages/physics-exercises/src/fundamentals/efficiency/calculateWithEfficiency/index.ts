import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithEfficiencyGenerator from './calculateWithEfficiencyGenerator'
import calculateWithEfficiencyBattery from './calculateWithEfficiencyBattery'

export default {
	examples: { calculateWithEfficiencyGenerator },
	exercises: { calculateWithEfficiencyGenerator, calculateWithEfficiencyBattery },
} satisfies SkillExerciseBundle
