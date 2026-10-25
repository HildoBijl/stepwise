import { expressionComparisons } from '@step-wise/cas'
import { FeedbackTranslation } from 'ui/eduTools'

export const rightSideChanged = (input, correct, solution, isCorrect) => !expressionComparisons.areEqualExceptOrder(input.right, correct.right) && <FeedbackTranslation shared id="rightSideChanged">Leave the right side of the equation unchanged!</FeedbackTranslation>
