import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import createCoolingCycleOverviewFromPressures from './createCoolingCycleOverviewFromPressures.ts'
import createCoolingCycleOverviewFromTemperatures from './createCoolingCycleOverviewFromTemperatures.ts'

export default {
	examples: { createCoolingCycleOverviewFromPressures },
	exercises: { createCoolingCycleOverviewFromPressures, createCoolingCycleOverviewFromTemperatures },
} satisfies SkillExerciseBundle
