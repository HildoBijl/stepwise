import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import poissonsLawBicyclePump from './poissonsLawBicyclePump.ts'
import poissonsLawCompressor from './poissonsLawCompressor.ts'
import poissonsLawTurbine from './poissonsLawTurbine.ts'

export default {
	examples: { poissonsLawBicyclePump },
	exercises: { poissonsLawBicyclePump, poissonsLawCompressor, poissonsLawTurbine },
} satisfies SkillExerciseBundle
