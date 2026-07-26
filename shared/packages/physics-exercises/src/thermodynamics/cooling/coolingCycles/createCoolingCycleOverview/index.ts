import { type SkillExercises } from '@step-wise/exercise-definition'

import createCoolingCycleOverviewFromPressures from './createCoolingCycleOverviewFromPressures'
import createCoolingCycleOverviewFromTemperatures from './createCoolingCycleOverviewFromTemperatures'

export default {
	examples: { createCoolingCycleOverviewFromPressures },
	exercises: { createCoolingCycleOverviewFromPressures, createCoolingCycleOverviewFromTemperatures },
} satisfies SkillExercises
