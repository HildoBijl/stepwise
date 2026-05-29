import { expressionComparisons } from '@step-wise/cas'

export const rightSideChanged = (input, correct, solution, isCorrect, { translateCrossExercise }) => !expressionComparisons.onlyOrderChanges(input.right, correct.right) && translateCrossExercise(<>Leave the right side of the equation unchanged!</>, 'rightSideChanged')
