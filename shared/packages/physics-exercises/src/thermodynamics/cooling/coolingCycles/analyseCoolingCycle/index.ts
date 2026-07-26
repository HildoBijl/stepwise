import { type SkillExercises } from '@step-wise/exercise-definition'

import analyseCoolingCycleWithEtai from './analyseCoolingCycleWithEtai'
import analyseCoolingCycleWithT2 from './analyseCoolingCycleWithT2'

export default {
	examples: { analyseCoolingCycleWithEtai },
	exercises: { analyseCoolingCycleWithEtai, analyseCoolingCycleWithT2 },
} satisfies SkillExercises
