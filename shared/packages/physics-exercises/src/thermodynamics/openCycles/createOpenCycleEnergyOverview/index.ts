import { type SkillExercises } from '@step-wise/exercise-definition'

import createOpenCycleEnergyOverviewspsp from './createOpenCycleEnergyOverviewspsp'
import createOpenCycleEnergyOverviewNspsp from './createOpenCycleEnergyOverviewNspsp'
import createOpenCycleEnergyOverviewTsp from './createOpenCycleEnergyOverviewTsp'

export default {
	examples: { createOpenCycleEnergyOverviewspsp },
	exercises: { createOpenCycleEnergyOverviewspsp, createOpenCycleEnergyOverviewNspsp, createOpenCycleEnergyOverviewTsp },
} satisfies SkillExercises
