import { type AccentName, accents, isAccent } from '@step-wise/math-input-value'

import { Variable } from '../nodes'

// Define variable patterns.
const accentPattern = `(?:(?<accent>${accents.join('|')})\\((?<accentedSymbol>[^()_]+)\\))`
const plainPattern = `(?<plainSymbol>[^()_]+)`
const subscriptPattern = `(?:_\\((?<longSubscript>[^()]+)\\)|_(?<shortSubscript>[^()_]+))?`
const pattern = new RegExp(`^(?:${accentPattern}|${plainPattern})${subscriptPattern}$`)

// Turn a string into a variable.
export function stringToVariable(input: string): Variable {
	// Match with a regular expression.
	const match = pattern.exec(input)
	if (!match?.groups) throw new Error(`Variable interpretation error: could not interpret "${input}" as a variable.`)

	// Extract the various parts.
	const symbol = match.groups.accentedSymbol ?? match.groups.plainSymbol
	const subscript = match.groups.longSubscript ?? match.groups.shortSubscript
	const accent = match.groups.accent
	if (accent !== undefined && !isAccent(accent)) throw new Error(`Unknown accent "${accent}".`)
	return new Variable(symbol, subscript, accent)
}

// A back-up constructor, which is rarely needed.
export const variable = (symbol: string, subscript?: string, accent?: AccentName) => new Variable(symbol, subscript, accent)

// Turn a variable into a string. It's the opposite of the above function.
export function variableToString(node: Variable): string {
	let result = node.symbol
	if (node.accent) result = `${node.accent}(${result})`
	if (node.subscript) result = node.subscript.length > 1 ? `${result}_(${node.subscript})` : `${result}_${node.subscript}`
	return result
}

// Ensure that a string or Variable is a Variable object.
export function ensureVariable(variable: string | Variable): Variable {
	return typeof variable === 'string' ? stringToVariable(variable) : variable
}

// Check variable equality.
export function equalVariables(a: Variable, b: Variable): boolean {
	return a.symbol === b.symbol && a.subscript === b.subscript && a.accent === b.accent
}
