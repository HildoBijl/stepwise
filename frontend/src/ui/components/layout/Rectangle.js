// The Rectangle object ensures that the given HTML object always has a certain aspect ratio (height divided by width; it is 1 (square) by default). Alternatively, a falsy aspect ratio can be given to ignore the aspect ratio.

import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
	rectangleOutside: {
		height: 0,
		overflow: 'hidden',
		paddingTop: ({ aspectRatio }) => `${aspectRatio * 100}%`,
		position: 'relative',
	},
	rectangleInside: {
		height: '100%',
		left: 0,
		position: 'absolute',
		top: 0,
		width: '100%',
	},
}))

export default function Rectangle({ children, className, outerClassName, aspectRatio = 1 }) {
	const classes = useStyles({ aspectRatio })
	
	// On a falsy aspect ratio, just give a div.
	if (!aspectRatio)
		return <div className={className}>{children}</div>

	// Set up the Rectangle properly.
	return (
		<div className={clsx(classes.rectangleOutside, outerClassName)}>
			<div className={clsx(classes.rectangleInside, className)}>
				{children}
			</div>
		</div>
	)
}
