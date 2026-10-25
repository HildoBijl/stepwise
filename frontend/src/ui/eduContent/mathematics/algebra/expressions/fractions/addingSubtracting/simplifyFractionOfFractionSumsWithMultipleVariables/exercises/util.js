import { expressionComparisons } from '@step-wise/cas'
import { M } from '@step-wise/math-display'
import { FeedbackTranslation } from 'ui/eduTools'

const { areEquivalent: equivalent } = expressionComparisons

export const wrongDenominatorWithLCM = (input, correct, { fraction1, fraction2 }, isCorrect) => !isCorrect && !equivalent(correct.denominator, input.denominator) && <FeedbackTranslation shared id="wrongDenominatorWithLCM">Your fraction does not have the right denominator. Is your denominator the least common multiple of <M>{fraction1.denominator}</M> and <M>{fraction2.denominator}</M>?</FeedbackTranslation>

export const wrongDenominatorWithExpectation = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(correct.denominator, input.denominator) && <FeedbackTranslation shared id="wrongDenominatorWithExpectation">Your fraction does not have the right denominator. Try setting up a fraction with <M>{correct.denominator}</M> in the denominator.</FeedbackTranslation>

export const wrongNumerator = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(correct.numerator, input.numerator) && <FeedbackTranslation shared id="wrongNumerator">The denominator is correct, but there's something wrong in the numerator of your fraction.</FeedbackTranslation>
