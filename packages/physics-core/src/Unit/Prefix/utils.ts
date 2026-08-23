import { type Prefix } from './Prefix'
import { prefixList, prefixes } from './prefixes'

export function findPrefix(str?: string): Prefix | undefined {
	if (!str) return undefined
	return prefixes[str] ?? prefixList.find(prefix => prefix.equalsString(str))
}
