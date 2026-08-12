import { type SkillExercises } from '@step-wise/exercise-bundling'

import createCoolingCycleOverviewFromPressures from './createCoolingCycleOverviewFromPressures'
import createCoolingCycleOverviewFromTemperatures from './createCoolingCycleOverviewFromTemperatures'

export default {
	examples: { createCoolingCycleOverviewFromPressures },
	exercises: { createCoolingCycleOverviewFromPressures, createCoolingCycleOverviewFromTemperatures },
} satisfies SkillExercises
