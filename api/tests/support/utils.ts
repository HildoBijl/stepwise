import { ensurePlainObject } from '@step-wise/js-utils'

// Convert a value into GraphQL input syntax for use in integration-test operations.
export function stringifyGraphQLInput(value: unknown): string {
	if (typeof value === 'function') throw new TypeError('stringifyGraphQLInput: value may not be or contain a function.')
	if (value === null) return 'null'
	if (value === undefined) return 'undefined'
	if (typeof value !== 'object') return JSON.stringify(value)
	if (Array.isArray(value)) return `[${value.map(item => stringifyGraphQLInput(item)).join(',')}]`

	const object = ensurePlainObject(value)
	return `{${Object.keys(object).map(key => `${key}:${stringifyGraphQLInput(object[key])}`).join(',')}}`
}
