import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import massFlowTrickCompressor from './massFlowTrickCompressor.ts'
import massFlowTrickWater from './massFlowTrickWater.ts'
import massFlowTrickEngine from './massFlowTrickEngine.ts'

export default {
	examples: { massFlowTrickCompressor },
	exercises: { massFlowTrickCompressor, massFlowTrickWater, massFlowTrickEngine },
} satisfies SkillExerciseBundle
