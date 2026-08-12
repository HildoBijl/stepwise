import { simplificationRules } from '../rules'

export type SimplificationOption = keyof typeof simplificationRules
export type SimplificationOptions = ReadonlySet<SimplificationOption>
export type SimplificationOptionsInput = SimplificationOptions | readonly SimplificationOption[]
