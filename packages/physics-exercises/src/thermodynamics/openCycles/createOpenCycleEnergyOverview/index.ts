import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import createOpenCycleEnergyOverviewspsp from './createOpenCycleEnergyOverviewspsp.ts'
import createOpenCycleEnergyOverviewNspsp from './createOpenCycleEnergyOverviewNspsp.ts'
import createOpenCycleEnergyOverviewTsp from './createOpenCycleEnergyOverviewTsp.ts'

export default {
	examples: { createOpenCycleEnergyOverviewspsp },
	exercises: { createOpenCycleEnergyOverviewspsp, createOpenCycleEnergyOverviewNspsp, createOpenCycleEnergyOverviewTsp },
} satisfies SkillExerciseBundle
