import type { LoadName } from './types.ts'
import { createLoadName } from './creation.ts'

export function getLoadNameSubscript(name: LoadName): string | undefined {
	name = createLoadName(name)
	const subscript = `${name.point ?? ''}${name.suffix ?? ''}`
	return subscript || undefined
}
