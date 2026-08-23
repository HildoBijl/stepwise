import { mergeDefaults } from '@step-wise/js-utils'

export type DecimalSeparator = '.' | ','
export type TexDisplayOptions = { decimalSeparator: DecimalSeparator }
export type TexDisplayOptionsInput = Partial<TexDisplayOptions>

export const defaultTexDisplayOptions = {
	decimalSeparator: ','
} satisfies TexDisplayOptions

export function resolveTexDisplayOptions(options?: TexDisplayOptionsInput): TexDisplayOptions {
	const resolved = mergeDefaults(options ?? {}, defaultTexDisplayOptions)
	if (resolved.decimalSeparator !== ',' && resolved.decimalSeparator !== '.') throw new RangeError(`Invalid decimal separator "${resolved.decimalSeparator}".`)
	return resolved
}
