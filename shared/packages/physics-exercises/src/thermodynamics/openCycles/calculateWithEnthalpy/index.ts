import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateWithEnthalpyCompressor from './calculateWithEnthalpyCompressor'
import calculateWithEnthalpyBoiler from './calculateWithEnthalpyBoiler'
import calculateWithEnthalpyTurbine from './calculateWithEnthalpyTurbine'

export default {
	examples: { calculateWithEnthalpyCompressor },
	exercises: { calculateWithEnthalpyCompressor, calculateWithEnthalpyBoiler, calculateWithEnthalpyTurbine },
} satisfies SkillExercises
