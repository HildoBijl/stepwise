import type { LoadName } from './types'
import { createLoadName } from './creation'

export function getLoadNameSubscript(name: LoadName): string | undefined {
	name = createLoadName(name)
	const subscript = `${name.point ?? ''}${name.suffix ?? ''}`
	return subscript || undefined
}
