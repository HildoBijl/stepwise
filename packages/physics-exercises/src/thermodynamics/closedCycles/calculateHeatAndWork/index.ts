import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateHeatAndWorkIsobaric from './calculateHeatAndWorkIsobaric'
import calculateHeatAndWorkIsochoric from './calculateHeatAndWorkIsochoric'
import calculateHeatAndWorkIsothermal from './calculateHeatAndWorkIsothermal'
import calculateHeatAndWorkIsentropic from './calculateHeatAndWorkIsentropic'
import calculateHeatAndWorkPolytropic from './calculateHeatAndWorkPolytropic'

export default {
	examples: { calculateHeatAndWorkIsobaric },
	exercises: { calculateHeatAndWorkIsobaric, calculateHeatAndWorkIsochoric, calculateHeatAndWorkIsothermal, calculateHeatAndWorkIsentropic, calculateHeatAndWorkPolytropic },
} satisfies SkillExerciseBundle
