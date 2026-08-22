import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import poissonsLawBicyclePump from './poissonsLawBicyclePump'
import poissonsLawCompressor from './poissonsLawCompressor'
import poissonsLawTurbine from './poissonsLawTurbine'

export default {
	examples: { poissonsLawBicyclePump },
	exercises: { poissonsLawBicyclePump, poissonsLawCompressor, poissonsLawTurbine },
} satisfies SkillExerciseBundle
