import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithEfficiencyGenerator from './calculateWithEfficiencyGenerator.ts'
import calculateWithEfficiencyBattery from './calculateWithEfficiencyBattery.ts'

export default {
	examples: { calculateWithEfficiencyGenerator },
	exercises: { calculateWithEfficiencyGenerator, calculateWithEfficiencyBattery },
} satisfies SkillExerciseBundle
