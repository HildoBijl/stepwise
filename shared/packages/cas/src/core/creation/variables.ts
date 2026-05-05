import { type Accent, Variable } from '../nodes'

// Define variable patterns.
const accentPattern = `(?:(?<accent>${Variable.accents.join('|')})\\((?<accentedSymbol>[^()_]+)\\))`
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
	return new Variable(symbol, subscript, accent as Accent)
}

// A back-up constructor, which is rarely needed.
export const variable = (symbol: string, subscript?: string, accent?: Accent) => new Variable(symbol, subscript, accent)
