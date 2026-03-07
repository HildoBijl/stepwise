import { expressionComparisons } from 'step-wise/CAS'

import { M } from 'ui/components'

const { equivalent } = expressionComparisons

export const wrongDenominatorWithLCM = (input, correct, { fraction1, fraction2 }, isCorrect, { translateCrossExercise }) => !isCorrect && !equivalent(correct.denominator, input.denominator) && translateCrossExercise(<>Your fraction does not have the right denominator. Is your denominator the least common multiple of <M>{fraction1.denominator}</M> and <M>{fraction2.denominator}</M>?</>, 'wrongDenominatorWithLCM')

export const wrongDenominatorWithExpectation = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && !equivalent(correct.denominator, input.denominator) && translateCrossExercise(<>Your fraction does not have the right denominator. Try setting up a fraction with <M>{correct.denominator}</M> in the denominator.</>, 'wrongDenominatorWithExpectation')

export const wrongNumerator = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && !equivalent(correct.numerator, input.numerator) && translateCrossExercise(<>The denominator is correct, but there's something wrong in the numerator of your fraction.</>, 'wrongNumerator')
