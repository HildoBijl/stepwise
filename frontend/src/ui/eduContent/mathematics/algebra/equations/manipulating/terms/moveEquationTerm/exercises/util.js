import { expressionComparisons, equationComparisons } from '@step-wise/cas'
import { Condition } from '@step-wise/i18n'
import { FeedbackTranslation } from 'ui/eduTools'


export const termsNotCanceled = (input, correct, { bothSidesChanged, positive, termIsLeft }, isCorrect) => !isCorrect && expressionComparisons.areEqualExceptOrder(input[termIsLeft ? 'left' : 'right'].removeTrivial(), bothSidesChanged[termIsLeft ? 'left' : 'right'].removeTrivial()) && <FeedbackTranslation shared id="termsNotCanceled">You <Condition value={positive}><Condition.True>subtracted the correct term from</Condition.True><Condition.False>added the correct term to</Condition.False></Condition> both sides, but you still have to cancel some terms.</FeedbackTranslation>

export const termsLeft = (input, correct, { toLeft, ans }, isCorrect) => !isCorrect && !expressionComparisons.areEqualExceptOrder(input[toLeft ? 'right' : 'left'].removeTrivial(), ans[toLeft ? 'right' : 'left'].removeTrivial()) && <FeedbackTranslation shared id="termsLeft">There are still terms left on the <Condition value={toLeft}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> side of the equation.</FeedbackTranslation>

export const wrongSignUsed = (input, correct, { ansWithWrongSignUsed, positive }, isCorrect) => !isCorrect && equationComparisons.areEqualExceptOrder(input, ansWithWrongSignUsed) && <FeedbackTranslation shared id="wrongSignUsed">If the term is <Condition value={positive}><Condition.True>added (with plus sign)</Condition.True><Condition.False>subtracted (with minus sign)</Condition.False></Condition> on one side, then when it's brought to the other side it should be <Condition value={positive}><Condition.True>subtracted (with minus sign)</Condition.True><Condition.False>added (with plus sign)</Condition.False></Condition>.</FeedbackTranslation>
