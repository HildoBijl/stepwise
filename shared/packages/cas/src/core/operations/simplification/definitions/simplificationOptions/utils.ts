import { type SimplificationOptions } from './types'

export function getActiveSimplificationOptions(options: SimplificationOptions): (keyof SimplificationOptions)[] {
	return (Object.keys(options) as (keyof SimplificationOptions)[]).filter(key => options[key])
}
