import { count } from '@step-wise/js-utils'
import { expressionComparisons } from '@step-wise/cas'
import { M } from '@step-wise/math-display'
import { FeedbackTranslation } from 'ui/eduTools'

export const wrongBracketsExpanded = (input, correct, { factor2 }, isCorrect) => !isCorrect && input.some(term => term.isProduct() && term.factors.some(factor => factor.isSum() && !expressionComparisons.areEquivalent(factor, factor2))) && <FeedbackTranslation shared id="wrongBracketsExpanded">Make sure to expand all brackets, except for <M>\left({factor2}\right)</M>.</FeedbackTranslation>

export const bracketProductRemains = (input, correct, solution, isCorrect) => !isCorrect && input.some(term => term.isProduct() && count(term.factors, factor => factor.isSum()) > 1) && <FeedbackTranslation shared id="bracketProductRemains">Make sure to expand one set of brackets: you cannot have brackets multiplied by brackets anymore.</FeedbackTranslation>

export const stillHasPower = (input, correct, solution, isCorrect) => !isCorrect && input.some(factor => factor.isPower() && factor.base.isSum()) && <FeedbackTranslation shared id="stillHasPower">There are still brackets with an exponent above it.</FeedbackTranslation>
