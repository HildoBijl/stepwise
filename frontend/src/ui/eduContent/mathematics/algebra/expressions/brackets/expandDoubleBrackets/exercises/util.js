import { count } from '@step-wise/utils'
import { expressionComparisons } from '@step-wise/cas'

import { M } from 'ui/components'

export const wrongBracketsExpanded = (input, correct, { factor2 }, isCorrect, { translateCrossExercise }) => !isCorrect && input.some(term => term.isProduct() && term.factors.some(factor => factor.isSum() && !expressionComparisons.equivalent(factor, factor2))) && translateCrossExercise(<>Make sure to expand all brackets, except for <M>\left({factor2}\right)</M>.</>, 'wrongBracketsExpanded')

export const bracketProductRemains = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && input.some(term => term.isProduct() && count(term.factors, factor => factor.isSum()) > 1) && translateCrossExercise(<>Make sure to expand one set of brackets: you cannot have brackets multiplied by brackets anymore.</>, 'bracketProductRemains')

export const stillHasPower = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && input.some(factor => factor.isPower() && factor.base.isSum()) && translateCrossExercise(<>There are still brackets with an exponent above it.</>, 'stillHasPower')
