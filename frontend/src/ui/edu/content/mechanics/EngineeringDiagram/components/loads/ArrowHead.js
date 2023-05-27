import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry'

import { useGraphicalVector } from 'ui/components/figures'
import { defaultObject, useRefWithEventHandlers } from 'ui/components/figures/Drawing/components/SvgComponents/util'

const useStyles = makeStyles((theme) => ({
	arrowHead: {
		fill: 'black',
		'stroke-width': 0,
	},
}))

export const defaultArrowHead = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	angle: 0,
	size: 4,
	color: 'black',
	className: 'arrowHead',
}

// ArrowHead draws an arrowhead in the given container at the given position and with the given angle. It can also be sized up and styled further.
export const ArrowHead = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, angle, size, color, className, style } = processOptions(props, defaultArrowHead)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), 2)
	angle = ensureNumber(angle)
	size = ensureNumber(size)
	color = ensureString(color)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the arrow head shape and position it.
	const classes = useStyles()
	return <polygon
		ref={ref}
		points="0 0, -20 -10, -14 0, -20 10"
		className={clsx(classes.arrowHead, className)}
		style={{
			fill: color,
			transform: `translate(${position.x}px, ${position.y}px) rotate(${angle * 180 / Math.PI}deg) scale(${size / defaultArrowHead.size})`,
			stroke: 'red',
			...style,
		}}
	/>
})
ArrowHead.defaultProps = defaultArrowHead
export default ArrowHead
