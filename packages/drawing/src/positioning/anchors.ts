import type { VectorLike } from '@step-wise/geometry'

export const anchors = {
	center: 'center',
	left: 'left',
	right: 'right',
	top: 'top',
	bottom: 'bottom',
	topLeft: 'topLeft',
	topRight: 'topRight',
	bottomLeft: 'bottomLeft',
	bottomRight: 'bottomRight',
} as const

export type NamedAnchor = typeof anchors[keyof typeof anchors]
export type Anchor = NamedAnchor | VectorLike
