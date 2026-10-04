import type { RectangleLike, TransformationLike, VectorLike } from '@step-wise/geometry'

import type { YDirection } from './types.ts'

export type PointCollection = readonly VectorLike[] | Readonly<Record<string, VectorLike>>
export type Scale = number | VectorLike
export type AxisMargin = number | readonly [number, number]
export type Margin = number | readonly [AxisMargin, AxisMargin]

type ViewOptions = {
	yDirection?: YDirection
}

type SizedViewOptions = ViewOptions & {
	width: number
	height: number
}

export type IdentityView = SizedViewOptions & {
	type: 'identity'
}

export type BoundsView = SizedViewOptions & {
	type: 'bounds'
	bounds: RectangleLike
	margin?: Margin
}

export type ScaleView = ViewOptions & {
	type: 'scale'
	points: PointCollection
	scale?: Scale
	margin?: Margin
	pretransform?: TransformationLike
}

export type FitView = ViewOptions & {
	type: 'fit'
	points: PointCollection
	maxWidth?: number
	maxHeight?: number
	maxScale?: Scale
	uniform?: boolean
	margin?: Margin
	pretransform?: TransformationLike
}

export type CustomView = SizedViewOptions & {
	type: 'custom'
	drawingToPixelTransformation: TransformationLike
}

export type DrawingView = IdentityView | BoundsView | ScaleView | FitView | CustomView
