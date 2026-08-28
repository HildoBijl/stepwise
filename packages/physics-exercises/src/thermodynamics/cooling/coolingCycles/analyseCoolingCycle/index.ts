import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseCoolingCycleWithEtai from './analyseCoolingCycleWithEtai.ts'
import analyseCoolingCycleWithT2 from './analyseCoolingCycleWithT2.ts'

export default {
	examples: { analyseCoolingCycleWithEtai },
	exercises: { analyseCoolingCycleWithEtai, analyseCoolingCycleWithT2 },
} satisfies SkillExerciseBundle
