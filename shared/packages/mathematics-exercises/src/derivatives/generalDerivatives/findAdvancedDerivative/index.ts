import { type SkillExercises } from '@step-wise/exercise-definition'

import findAdvancedDerivativeChainOfProduct from './findAdvancedDerivativeChainOfProduct'
import findAdvancedDerivativeChainOfFraction from './findAdvancedDerivativeChainOfFraction'
import findAdvancedDerivativeProductOfChain from './findAdvancedDerivativeProductOfChain'
import findAdvancedDerivativeFractionOfProduct from './findAdvancedDerivativeFractionOfProduct'
import findAdvancedDerivativeFractionOfChain from './findAdvancedDerivativeFractionOfChain'

export default {
	examples: {},
	exercises: { findAdvancedDerivativeChainOfProduct, findAdvancedDerivativeChainOfFraction, findAdvancedDerivativeProductOfChain, findAdvancedDerivativeFractionOfProduct, findAdvancedDerivativeFractionOfChain },
} satisfies SkillExercises
