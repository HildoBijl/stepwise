import { type RectangleLike, Rectangle, Vector } from '@step-wise/geometry'

import { type YDirection, ensureYDirection } from '../transforms/index.ts'

import type { NamedAnchor } from './anchors.ts'

export class Bounds {
	readonly yDirection: YDirection
	private readonly _rectangle: Rectangle

	constructor(rectangle: RectangleLike, yDirection: YDirection) {
		this._rectangle = new Rectangle(rectangle)
		if (this._rectangle.dimension !== 2) throw new Error(`Invalid Bounds rectangle: expected a two-dimensional rectangle but received a ${this._rectangle.dimension}D rectangle.`)
		this.yDirection = ensureYDirection(yDirection)
	}

	/*
	 * Rectangle attributes.
	 */

	get rectangle(): Rectangle {
		return this._rectangle.clone()
	}

	get min(): Vector {
		return this._rectangle.min
	}

	get max(): Vector {
		return this._rectangle.max
	}

	/*
	 * Sizing.
	 */

	get width(): number {
		return this._rectangle.width
	}

	get height(): number {
		return this._rectangle.height
	}

	get size(): Vector {
		return this._rectangle.size
	}

	/*
	 * Specific coordinates (numbers).
	 */

	get minX(): number {
		return this._rectangle.min.x
	}

	get maxX(): number {
		return this._rectangle.max.x
	}

	get minY(): number {
		return this._rectangle.min.y
	}

	get maxY(): number {
		return this._rectangle.max.y
	}

	get left(): number {
		return this.minX
	}

	get right(): number {
		return this.maxX
	}

	get top(): number {
		return this.yDirection === 'up' ? this.maxY : this.minY
	}

	get bottom(): number {
		return this.yDirection === 'up' ? this.minY : this.maxY
	}

	/*
	 * Anchor positions.
	 */

	get center(): Vector {
		return this._rectangle.midpoint
	}

	get midpoint(): Vector {
		return this.center
	}

	get topLeft(): Vector {
		return this.getAnchor('topLeft')
	}

	get topMiddle(): Vector {
		return this.getAnchor('top')
	}

	get topCenter(): Vector {
		return this.topMiddle
	}

	get topRight(): Vector {
		return this.getAnchor('topRight')
	}

	get middleRight(): Vector {
		return this.getAnchor('right')
	}

	get centerRight(): Vector {
		return this.middleRight
	}

	get bottomRight(): Vector {
		return this.getAnchor('bottomRight')
	}

	get bottomMiddle(): Vector {
		return this.getAnchor('bottom')
	}

	get bottomCenter(): Vector {
		return this.bottomMiddle
	}

	get bottomLeft(): Vector {
		return this.getAnchor('bottomLeft')
	}

	get middleLeft(): Vector {
		return this.getAnchor('left')
	}

	get centerLeft(): Vector {
		return this.middleLeft
	}

	getAnchor(anchor: NamedAnchor): Vector {
		switch (anchor) {
			case 'center': return this.center
			case 'left': return new Vector(this.left, this.center.y)
			case 'right': return new Vector(this.right, this.center.y)
			case 'top': return new Vector(this.center.x, this.top)
			case 'bottom': return new Vector(this.center.x, this.bottom)
			case 'topLeft': return new Vector(this.left, this.top)
			case 'topRight': return new Vector(this.right, this.top)
			case 'bottomLeft': return new Vector(this.left, this.bottom)
			case 'bottomRight': return new Vector(this.right, this.bottom)
		}
	}
}
