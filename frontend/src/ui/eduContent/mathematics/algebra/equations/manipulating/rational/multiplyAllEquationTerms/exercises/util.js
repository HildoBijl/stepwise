import { Check } from 'i18n'

export const incorrectFormMessage = (part, form) => <>Both sides should be of the form {form}. Your <Check value={part === 'left'}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side is not set up this way.</>
export const incorrectCopyMessage = (part) => <>It looks like you didn't copy the original equation properly on the <Check value={part === 'left'}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side.</>
