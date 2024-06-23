import { count } from 'step-wise/util'
import { Sum, Product, Power, expressionComparisons } from 'step-wise/CAS'

import { M } from 'ui/components'

export const wrongBracketsExpanded = (input, correct, { factor2 }, isCorrect, { translateCrossExercise }) => !isCorrect && input.recursiveSome(term => term.isSubtype(Product) && term.factors.some(factor => factor.isSubtype(Sum) && !expressionComparisons.equivalent(factor, factor2))) && translateCrossExercise(<>Make sure to expand all brackets, except for <M>\left({factor2}\right)</M>.</>, 'wrongBracketsExpanded')

export const bracketProductRemains = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && input.recursiveSome(term => term.isSubtype(Product) && count(term.factors, factor => factor.isSubtype(Sum)) > 1) && translateCrossExercise(<>Make sure to expand one set of brackets: you cannot have brackets multiplied by brackets anymore.</>, 'bracketProductRemains')

export const stillHasPower = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && input.recursiveSome(factor => factor.isSubtype(Power) && factor.base.isSubtype(Sum)) && translateCrossExercise(<>There are still brackets with an exponent above it.</>, 'stillHasPower')
