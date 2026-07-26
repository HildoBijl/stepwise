import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateWithEfficiencyGenerator from './calculateWithEfficiencyGenerator'
import calculateWithEfficiencyBattery from './calculateWithEfficiencyBattery'

export default {
	examples: { calculateWithEfficiencyGenerator },
	exercises: { calculateWithEfficiencyGenerator, calculateWithEfficiencyBattery },
} satisfies SkillExercises
