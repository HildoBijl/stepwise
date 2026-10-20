const translationVariable = Symbol('translationVariable')

export type TranslationVariable = {
	readonly name: string
	readonly value: unknown
	readonly [translationVariable]: true
}

// Mark a runtime value as a named variable within translatable React content.
export function variable(name: string, value: unknown): TranslationVariable {
	if (!/^[A-Za-z_$][A-Za-z0-9_$.-]*$/.test(name)) throw new Error(`Invalid translation variable name "${name}".`)
	return { name, value, [translationVariable]: true }
}

// Check if a given value is a named variable created by the variable function.
export function isTranslationVariable(value: unknown): value is TranslationVariable {
	return typeof value === 'object' && value !== null && translationVariable in value
}
