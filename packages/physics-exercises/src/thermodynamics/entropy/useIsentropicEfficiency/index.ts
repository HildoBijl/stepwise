import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import useIsentropicEfficiencyCompressor1 from './useIsentropicEfficiencyCompressor1.ts'
import useIsentropicEfficiencyCompressor2 from './useIsentropicEfficiencyCompressor2.ts'
import useIsentropicEfficiencyTurbine1 from './useIsentropicEfficiencyTurbine1.ts'
import useIsentropicEfficiencyTurbine2 from './useIsentropicEfficiencyTurbine2.ts'

export default {
	examples: { useIsentropicEfficiencyCompressor1 },
	exercises: { useIsentropicEfficiencyCompressor1, useIsentropicEfficiencyCompressor2, useIsentropicEfficiencyTurbine1, useIsentropicEfficiencyTurbine2 },
} satisfies SkillExerciseBundle
