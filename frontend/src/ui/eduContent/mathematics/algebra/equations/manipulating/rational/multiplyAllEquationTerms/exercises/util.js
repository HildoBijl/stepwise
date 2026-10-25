
import { Condition } from '@step-wise/i18n'
export const incorrectFormMessage = (part, form) => <>Both sides should be of the form {form}. Your <Condition value={part === 'left'}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side is not set up this way.</>
export const incorrectCopyMessage = (part) => <>It looks like you didn't copy the original equation properly on the <Condition value={part === 'left'}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side.</>
