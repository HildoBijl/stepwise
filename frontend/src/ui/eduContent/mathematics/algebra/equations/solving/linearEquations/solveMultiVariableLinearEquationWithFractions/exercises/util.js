import { expressionComparisons } from 'step-wise/CAS'

const { onlyOrderChanges } = expressionComparisons

export const rightSideChanged = (input, correct, solution, isCorrect, { translateCrossExercise }) => !onlyOrderChanges(input.right, correct.right) && translateCrossExercise(<>Leave the right side of the equation unchanged!</>, 'rightSideChanged')
