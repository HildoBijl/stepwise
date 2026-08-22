import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import massFlowTrickCompressor from './massFlowTrickCompressor'
import massFlowTrickWater from './massFlowTrickWater'
import massFlowTrickEngine from './massFlowTrickEngine'

export default {
	examples: { massFlowTrickCompressor },
	exercises: { massFlowTrickCompressor, massFlowTrickWater, massFlowTrickEngine },
} satisfies SkillExerciseBundle
