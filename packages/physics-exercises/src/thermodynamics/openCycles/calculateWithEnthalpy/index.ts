import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithEnthalpyCompressor from './calculateWithEnthalpyCompressor.ts'
import calculateWithEnthalpyBoiler from './calculateWithEnthalpyBoiler.ts'
import calculateWithEnthalpyTurbine from './calculateWithEnthalpyTurbine.ts'

export default {
	examples: { calculateWithEnthalpyCompressor },
	exercises: { calculateWithEnthalpyCompressor, calculateWithEnthalpyBoiler, calculateWithEnthalpyTurbine },
} satisfies SkillExerciseBundle
