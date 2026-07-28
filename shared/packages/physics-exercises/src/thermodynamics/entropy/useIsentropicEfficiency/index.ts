import { type SkillExercises } from '@step-wise/exercise-bundling'

import useIsentropicEfficiencyCompressor1 from './useIsentropicEfficiencyCompressor1'
import useIsentropicEfficiencyCompressor2 from './useIsentropicEfficiencyCompressor2'
import useIsentropicEfficiencyTurbine1 from './useIsentropicEfficiencyTurbine1'
import useIsentropicEfficiencyTurbine2 from './useIsentropicEfficiencyTurbine2'

export default {
	examples: { useIsentropicEfficiencyCompressor1 },
	exercises: { useIsentropicEfficiencyCompressor1, useIsentropicEfficiencyCompressor2, useIsentropicEfficiencyTurbine1, useIsentropicEfficiencyTurbine2 },
} satisfies SkillExercises
