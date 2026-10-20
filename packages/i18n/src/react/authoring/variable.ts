import { type ReactNode } from 'react'

import { isPlainObject } from '@step-wise/js-utils'

export type TranslatableReactNode = ReactNode | TranslationVariable | TranslationVariableShorthand

/*
 * Regular translation variables through variable('name', value).
 */

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

/*
 * Translation variable shorthand {{ name: value }}.
 */

export type TranslationVariableShorthand = { readonly [name: string]: unknown }

// Check if a value uses the {{ name: value }} translation variable shorthand.
export function isTranslationVariableShorthand(value: unknown): value is TranslationVariableShorthand {
	return isPlainObject(value) && Object.keys(value).length === 1
}
