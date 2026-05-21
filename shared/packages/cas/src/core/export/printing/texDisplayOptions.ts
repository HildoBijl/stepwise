import { mergeDefaults } from '@step-wise/utils'

export type DecimalSeparator = '.' | ','
export type TexDisplayOptions = { decimalSeparator: DecimalSeparator }
export type TexDisplayOptionsInput = Partial<TexDisplayOptions>

export const defaultTexDisplayOptions = {
	decimalSeparator: '.'
} satisfies TexDisplayOptions

export function asTexDisplayOptions(options: TexDisplayOptionsInput): TexDisplayOptions {
	return mergeDefaults(options, defaultTexDisplayOptions)
}
