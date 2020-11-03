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
	return (
		<div className={clsx(classes.rectangleOutside, outerClassName)}>
			<div className={clsx(classes.rectangleInside, className)}>
				{children}
			</div>
		</div>
	)
}
