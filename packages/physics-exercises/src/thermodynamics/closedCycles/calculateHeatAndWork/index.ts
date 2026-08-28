import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateHeatAndWorkIsobaric from './calculateHeatAndWorkIsobaric.ts'
import calculateHeatAndWorkIsochoric from './calculateHeatAndWorkIsochoric.ts'
import calculateHeatAndWorkIsothermal from './calculateHeatAndWorkIsothermal.ts'
import calculateHeatAndWorkIsentropic from './calculateHeatAndWorkIsentropic.ts'
import calculateHeatAndWorkPolytropic from './calculateHeatAndWorkPolytropic.ts'

export default {
	examples: { calculateHeatAndWorkIsobaric },
	exercises: { calculateHeatAndWorkIsobaric, calculateHeatAndWorkIsochoric, calculateHeatAndWorkIsothermal, calculateHeatAndWorkIsentropic, calculateHeatAndWorkPolytropic },
} satisfies SkillExerciseBundle
