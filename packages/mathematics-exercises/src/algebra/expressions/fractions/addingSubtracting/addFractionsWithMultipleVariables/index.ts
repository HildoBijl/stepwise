import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import mergeFractionsNumberInDenominator from './mergeFractionsNumberInDenominator'
import splitFractionsNumberInDenominator from './splitFractionsNumberInDenominator'
import mergeFractionsSquareAppearing from './mergeFractionsSquareAppearing'
import splitFractionsSquareAppearing from './splitFractionsSquareAppearing'
import mergeFractionsVariableDenominator from './mergeFractionsVariableDenominator'
import splitFractionsVariableDenominator from './splitFractionsVariableDenominator'

export default {
	examples: { mergeFractionsNumberInDenominator, splitFractionsNumberInDenominator },
	exercises: { mergeFractionsNumberInDenominator, splitFractionsNumberInDenominator, mergeFractionsSquareAppearing, splitFractionsSquareAppearing, mergeFractionsVariableDenominator, splitFractionsVariableDenominator },
} satisfies SkillExerciseBundle
