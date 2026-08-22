import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseCoolingCycleWithEtai from './analyseCoolingCycleWithEtai'
import analyseCoolingCycleWithT2 from './analyseCoolingCycleWithT2'

export default {
	examples: { analyseCoolingCycleWithEtai },
	exercises: { analyseCoolingCycleWithEtai, analyseCoolingCycleWithT2 },
} satisfies SkillExerciseBundle
