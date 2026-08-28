import { type VectorLike } from '@step-wise/geometry'

import { type Load } from './types.ts'

export function isLoadAtPoint(load: Load, point: VectorLike): boolean {
	return load.position.equals(point)
}
