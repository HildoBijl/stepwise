import { type SkillExercises } from '@step-wise/exercise-definition'

import poissonsLawBicyclePump from './poissonsLawBicyclePump'
import poissonsLawCompressor from './poissonsLawCompressor'
import poissonsLawTurbine from './poissonsLawTurbine'

export default {
	examples: { poissonsLawBicyclePump },
	exercises: { poissonsLawBicyclePump, poissonsLawCompressor, poissonsLawTurbine },
} satisfies SkillExercises
