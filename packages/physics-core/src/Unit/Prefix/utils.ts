import { type Prefix } from './Prefix.ts'
import { prefixList, prefixes } from './prefixes.ts'

export function findPrefix(str?: string): Prefix | undefined {
	if (!str) return undefined
	return prefixes[str] ?? prefixList.find(prefix => prefix.equalsString(str))
}
