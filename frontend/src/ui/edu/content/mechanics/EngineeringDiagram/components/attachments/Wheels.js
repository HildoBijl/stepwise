import React, { forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { ensureInt, ensureNumber } from 'step-wise/util/numbers'
import { ensureString } from 'step-wise/util/strings'
import { ensureObject, processOptions } from 'step-wise/util/objects'
import { numberArray } from 'step-wise/util/arrays'
import { Vector } from 'step-wise/geometry'

import { Group } from 'ui/figures/Drawing/components/svgComponents'
import { defaultObject, useRefWithEventHandlers } from 'ui/figures/Drawing/components/svgComponents/util'

import { Hinge } from '../structuralComponents'

const useStyles = makeStyles((theme) => ({
	wheels: {
		'& circle': {
			'stroke-width': 0,
		},
	},
}))

export const defaultWheels = {
	...defaultObject,
	position: undefined,
	graphicalPosition: Vector.zero,
	color: Hinge.defaultProps.color,
	numWheels: 4,
	wheelRadius: 4,
	wheelStyle: {},
	className: 'wheels',
}

export const Wheels = forwardRef((props, ref) => {
	// Check input.
	let { position, graphicalPosition, color, numWheels, wheelRadius, wheelStyle, className, style } = processOptions(props, defaultWheels)
	color = ensureString(color)
	numWheels = ensureInt(numWheels, true, true)
	wheelRadius = ensureNumber(wheelRadius)
	wheelStyle = ensureObject(wheelStyle)
	ref = useRefWithEventHandlers(props, ref)

	// Draw a group with the right number of wheels (circles).
	const classes = useStyles()
	return <Group className={clsx(classes.wheels, className)} {...{ ref, position, graphicalPosition, style }}>
		{numberArray(0, numWheels - 1).map(index => <circle
			key={index}
			cx={(2 * index + 1 - numWheels) * wheelRadius}
			cy="0"
			r={wheelRadius}
			style={{ fill: color, ...wheelStyle }}
		/>)}
	</Group>
})
Wheels.defaultProps = defaultWheels
export default Wheels
