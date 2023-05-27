import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { Vector, ensureVector } from 'step-wise/geometry/Vector'

import { useGraphicalVector } from 'ui/components/figures'
import { defaultObject, useRefWithEventHandlers } from 'ui/components/figures/Drawing/components/svgTemp/util'

import { Beam } from '../structuralComponents'

const useStyles = makeStyles((theme) => ({
	supportBlock: {
		'stroke-width': 0,
	},
}))

export const defaultSupportBlock = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	color: Beam.defaultProps.color,
	width: 36,
	height: 6,
	className: 'supportBlock',
}

export const SupportBlock = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, color, width, height, className, style } = processOptions(props, defaultSupportBlock)
	position = ensureVector(useGraphicalVector(position, graphicalPosition), 2)
	color = ensureString(color)
	width = ensureNumber(width)
	height = ensureNumber(height)
	className = ensureString(className)
	style = ensureObject(style)
	ref = useRefWithEventHandlers(props, ref)

	// Draw the support block.
	const classes = useStyles()
	return <rect ref={ref} x={position.x - width / 2} y={position.y - height / 2} width={width} height={height} className={clsx(classes.supportBlock, className)} style={{ fill: color, ...style }} />
})
SupportBlock.defaultProps = defaultSupportBlock
export default SupportBlock
