import { expressionComparisons } from 'step-wise/CAS'

const { onlyOrderChanges } = expressionComparisons

export const unsimplifiedNumbers = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && !onlyOrderChanges(input.simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true }), input) && translateCrossExercise(<>The numbers inside the fraction can still be simplified further.</>, 'unsimplifiedNumbers')
export const unsimplifiedFactors = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && !onlyOrderChanges(input.simplify({ mergeProductFactors: true, crossOutFractionTerms: true }), input) && translateCrossExercise(unsimplifiedFactors, 'unsimplifiedFactors')
