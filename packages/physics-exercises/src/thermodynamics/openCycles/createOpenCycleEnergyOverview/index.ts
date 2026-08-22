import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import createOpenCycleEnergyOverviewspsp from './createOpenCycleEnergyOverviewspsp'
import createOpenCycleEnergyOverviewNspsp from './createOpenCycleEnergyOverviewNspsp'
import createOpenCycleEnergyOverviewTsp from './createOpenCycleEnergyOverviewTsp'

export default {
	examples: { createOpenCycleEnergyOverviewspsp },
	exercises: { createOpenCycleEnergyOverviewspsp, createOpenCycleEnergyOverviewNspsp, createOpenCycleEnergyOverviewTsp },
} satisfies SkillExerciseBundle
