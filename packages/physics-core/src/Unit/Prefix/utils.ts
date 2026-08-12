import { type Prefix } from './Prefix'
import { prefixList, prefixes } from './prefixes'

export function findPrefix(str?: string): Prefix | undefined {
	if (!str) return undefined
	return prefixes[str] ?? prefixList.find(prefix => prefix.equalsString(str))
}

// ToDo: check if we need this.
export function getPrefixName(str: string): string {
	if (str === '') return ''
	const prefix = findPrefix(str)
	if (!prefix) throw new Error(`Unknown prefix "${str}".`)
	return prefix.name
}

// ToDo: check if we need this.
export function getPrefixExponent(str: string): number {
	if (str === '') return 0
	const prefix = findPrefix(str)
	if (!prefix) throw new Error(`Unknown prefix "${str}".`)
	return prefix.exponent
}
