import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import createClosedCycleEnergyOverviewVTp from './createClosedCycleEnergyOverviewVTp'
import createClosedCycleEnergyOverviewTsV from './createClosedCycleEnergyOverviewTsV'
import createClosedCycleEnergyOverviewSTST from './createClosedCycleEnergyOverviewSTST'
import createClosedCycleEnergyOverviewSVSV from './createClosedCycleEnergyOverviewSVSV'

export default {
	examples: { createClosedCycleEnergyOverviewVTp },
	exercises: { createClosedCycleEnergyOverviewVTp, createClosedCycleEnergyOverviewTsV, createClosedCycleEnergyOverviewSTST, createClosedCycleEnergyOverviewSVSV },
} satisfies SkillExerciseBundle
