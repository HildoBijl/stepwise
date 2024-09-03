import { expressionComparisons, equationComparisons } from 'step-wise/CAS'

import { Check } from 'i18n'

export const termsNotCanceled = (input, correct, { bothSidesChanged, positive, termIsLeft }, isCorrect, { translateCrossExercise }) => !isCorrect && expressionComparisons.onlyOrderChanges(input[termIsLeft ? 'left' : 'right'].removeUseless(), bothSidesChanged[termIsLeft ? 'left' : 'right'].removeUseless()) && translateCrossExercise(<>You <Check value={positive}><Check.True>subtracted the correct term from</Check.True><Check.False>added the correct term to</Check.False></Check> both sides, but you still have to cancel some terms.</>, 'termsNotCanceled')

export const wrongSignUsed = (input, correct, { ansWithWrongSignUsed, positive }, isCorrect, { translateCrossExercise }) => !isCorrect && equationComparisons.onlyOrderChanges(input, ansWithWrongSignUsed) && translateCrossExercise(<>If the term is <Check value={positive}><Check.True>added (with plus sign)</Check.True><Check.False>subtracted (with minus sign)</Check.False></Check> on one side, then when it's brought to the other side it should be <Check value={positive}><Check.True>subtracted (with minus sign)</Check.True><Check.False>added (with plus sign)</Check.False></Check>.</>, 'wrongSignUsed')
