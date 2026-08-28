import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import findAdvancedDerivativeChainOfProduct from './findAdvancedDerivativeChainOfProduct.ts'
import findAdvancedDerivativeChainOfFraction from './findAdvancedDerivativeChainOfFraction.ts'
import findAdvancedDerivativeProductOfChain from './findAdvancedDerivativeProductOfChain.ts'
import findAdvancedDerivativeFractionOfProduct from './findAdvancedDerivativeFractionOfProduct.ts'
import findAdvancedDerivativeFractionOfChain from './findAdvancedDerivativeFractionOfChain.ts'

export default {
	examples: {},
	exercises: { findAdvancedDerivativeChainOfProduct, findAdvancedDerivativeChainOfFraction, findAdvancedDerivativeProductOfChain, findAdvancedDerivativeFractionOfProduct, findAdvancedDerivativeFractionOfChain },
} satisfies SkillExerciseBundle
