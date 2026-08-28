import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import createClosedCycleEnergyOverviewVTp from './createClosedCycleEnergyOverviewVTp.ts'
import createClosedCycleEnergyOverviewTsV from './createClosedCycleEnergyOverviewTsV.ts'
import createClosedCycleEnergyOverviewSTST from './createClosedCycleEnergyOverviewSTST.ts'
import createClosedCycleEnergyOverviewSVSV from './createClosedCycleEnergyOverviewSVSV.ts'

export default {
	examples: { createClosedCycleEnergyOverviewVTp },
	exercises: { createClosedCycleEnergyOverviewVTp, createClosedCycleEnergyOverviewTsV, createClosedCycleEnergyOverviewSTST, createClosedCycleEnergyOverviewSVSV },
} satisfies SkillExerciseBundle
