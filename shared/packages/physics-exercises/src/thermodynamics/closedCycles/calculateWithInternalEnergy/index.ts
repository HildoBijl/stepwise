import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateWithInternalEnergyEngine from './calculateWithInternalEnergyEngine'
import calculateWithInternalEnergyBalloon from './calculateWithInternalEnergyBalloon'
import calculateWithInternalEnergyTire from './calculateWithInternalEnergyTire'

export default {
	examples: { calculateWithInternalEnergyEngine },
	exercises: { calculateWithInternalEnergyEngine, calculateWithInternalEnergyBalloon, calculateWithInternalEnergyTire },
} satisfies SkillExercises
